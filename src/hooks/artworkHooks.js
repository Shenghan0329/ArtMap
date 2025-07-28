import { useState, useEffect, useMemo } from "react";
import { regionQuery } from "@/constants/google_map_queries";
import RandomSelector from "@/common/RandomSelector";
import getState from "@/common/getState";
import { useDebounced } from "./generalHooks";

import { getArtworkById, getArtworksByQuery, searchArtworksByTimeRange } from "@/api/api";

const MAX_SIZE = 96;
const REGION_TYPES = ['local', 'county','state'];

/*
* @param {google.maps.Map} map - Google Map instance
* @param {google.maps.places.PlacesService} placesLib - Google Places Library instance
* @param {google.maps.places.PlaceResult} place - Current Place
* @param {boolean} toQuery - Whether to query for artworks
* @param {function} setToQuery - Setter for toQuery
* @param {boolean} setIsLoading - Setter for isLoading, to indicate whether the artworks are being fetched
* @param {boolean} setIsEnd - Setter for isEnd, to indicate whether there are more artworks to fetch
* @param {function} setError - Setter for error
*/
export function useArtworks(
    map, placesLib, place, 
    toQuery, setToQuery, 
    setIsLoading, setIsEnd, setError, options = {
        "PAGE_SIZE": 6, 
        "limitSize": false, 
        "byDate": false,
        "from": 1900,
        "to": 2000,
    }
) {
    const [artworks, setArtworks] = useState([]);
    const { PAGE_SIZE, limitSize, byDate, from, to, reset } = options;
    const dFrom = useDebounced(from, 500);
    const dTo = useDebounced(to, 500);

    // Set Regions and Ids, if the there are no artworks about the current region, then search for artworks in larger region
    const [currRegion, setCurrRegion] = useState({});
    const [currGallary, setCurrGallary] = useState(0);
    const [ids, setIds] = useState({});
    const [idInit, setIdInit] = useState(false);

    // Reinit Artwork when place changes
    useEffect(() => {
        if (!map || !placesLib) return;
            
        // Reset Everything upon place change
        console.log("Init Artworks panel"); 
        setArtworks([]);
        setToQuery(true);
        setIsEnd(false);
        setIsLoading(false);
        setIds({});
        setIdInit(false);
        setCurrRegion({});
        if (rs) rs.reset([]);

        // Query Regions
        if (place && Object.keys(place).length) {
            let local = '';
            let county = '';
            let state = '';
            // Search for local
            if (place?.name) {
                local = place.name;
            } else {
                setError('STATE_NOT_FOUND');
            }
            const bounds = map.getBounds();
            const svc = new placesLib.PlacesService(map);
            // Search for county
            svc.nearbySearch({
                'bounds': bounds,
                ...regionQuery, 
            }, (res, status, pagination) => {
                if (status == 'OK' && res.length > 0) {
                    county = res[0].name;
                }
            });
            // Search for state
            if (place?.vicinity) {
                const st = getState(place.vicinity);
                state = st;
            }
            setCurrRegion({local, county, state});
        }
    }, [place, dFrom, dTo]);

    useEffect(() => {
        if (!currRegion || Object.keys(currRegion).length === 0) return;
        async function fetchIDsAll() {
            console.log('Fetching Artwork Ids');
            const newIds = {...ids};
            for (let region of REGION_TYPES){
                const location = currRegion[region];
                if (location === '') {
                    newIds[region] = []
                    continue;
                }
                let artworks = [];
                if (!byDate) {
                    artworks = await getArtworksByQuery(`q=${location}&limit=${MAX_SIZE}`);
                } else {
                    artworks = await searchArtworksByTimeRange(
                        dFrom, dTo, 
                        {
                            "searchTerm": location,
                            "limit": MAX_SIZE,
                            "page": 1,
                            "publicDomainOnly": true
                        }
                    );
                }
                if (artworks?.error) {
                    setError(artworks?.error + ': ' + artworks?.detail);
                    newIds[region] = [];
                    continue;
                }
                const artworkIds = artworks.map((artwork, idx) => artwork?.id);
                newIds[region] = artworkIds;
            }
            setIds(newIds);
            setIdInit(true);
        }
        fetchIDsAll();
    }, [currRegion]);


    const rs = useMemo(() => {
        if (!idInit) return null;
        console.log("Artwork Random Selector Initing: ", ids);
        if (ids?.local?.length) {
            setCurrGallary(0);
            setToQuery(true);
            return new RandomSelector(ids.local);
        }
        if (ids?.county?.length) {
            setCurrGallary(1);
            setToQuery(true);
            return new RandomSelector(ids.county);
        }
        if (ids?.state?.length) {
            setCurrGallary(2);
            setToQuery(true);
            return new RandomSelector(ids.state);
        }
        setIsEnd(true);
        return null;
    }, [idInit, ids]);

    useEffect(() => {
        if (!idInit) return;
        if (rs && toQuery) {
            setIsLoading(true);
            const fetchArtworks = async (ids) => {
                let artworksLeft = 0;
                artworksLeft = PAGE_SIZE;
                const aws = [];
                let cg = currGallary;
                while (artworksLeft > 0) {
                    const selectedIds = rs.select(1);
                    // Current selector is empty
                    if (selectedIds.length === 0) {
                        // Run out of artworks
                        if (cg === 2) {
                            if (!limitSize) {
                                setIsEnd(true);
                                break; 
                            } else {
                                setCurrGallary(0);
                                rs.reset(ids[REGION_TYPES[0]]);
                            }
                        }
                        // Find artworks in next level of region
                        rs.reset(ids[REGION_TYPES[cg + 1]]);
                        setCurrGallary(prev => prev + 1);
                        cg += 1;
                        continue;
                    }
                    // Get Artwork from id
                    for (let i = 0; i < selectedIds.length; i++) {
                        const currId = selectedIds[i];
                        if (!currId) continue;
                        const artwork = await getArtworkById(currId);
                        if (artwork?.error) {
                            setError(artworks?.error + ': ' + artworks?.detail);
                            continue;
                        }
                        aws.push(artwork);
                        artworksLeft -= 1;
                    }
                }
                if (limitSize) {
                    setArtworks(aws);
                } else {
                    setArtworks(prev => [...prev,...aws]);
                }
                setIsLoading(false);
            }
            fetchArtworks(ids);
            setToQuery(false);
        }
    }, [toQuery, rs]);
    
    return artworks;
}