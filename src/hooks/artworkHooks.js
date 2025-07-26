import { useState, useEffect, useMemo } from "react";
import { regionQuery } from "@/constants/google_map_queries";
import RandomSelector from "@/common/RandomSelector";
import getState from "@/common/getState";

import { getArtworkById, getArtworksByQuery } from "@/api/api";

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
    setIsLoading, setIsEnd, setError, 
    PAGE_SIZE = 6, limitSize = false, size = 3
) {
    const [artworks, setArtworks] = useState([]);

    // Set Regions and Ids, if the there are no artworks about the current region, then search for artworks in larger region
    const [currRegion, setCurrRegion] = useState({
        local: null,
        county: null,
        state: null
    });
    const [currGallary, setCurrGallary] = useState(0);
    const [ids, setIds] = useState({
        local: [],
        county: [],
        state: []
    });

    // Reinit Artwork when place changes
    useEffect(() => {
        console.log("Init map panel");
        // Reset Everything upon place change
        setArtworks([]);
        setToQuery(true);
        setIsEnd(false);
        setIsLoading(false);
        setIds({
            local: [],
            county: [],
            state: []
        });
        setCurrRegion({
            local: null,
            county: null,
            state: null
        });
        if (!map || !placesLib) return;
        if (place && Object.keys(place).length) {
            console.log("Place: " + place);
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
    }, [map, placesLib, place]);

    useEffect(() => {
        console.log("CurrRegion: ", currRegion);
        async function fetchIDsAll() {
            const newIds = {...ids};
            for (let region of REGION_TYPES){
                const location = currRegion[region];
                if (!location) continue;
                const artworks = await getArtworksByQuery(`q=${location}&limit=${MAX_SIZE}`);
                if (artworks?.error) {
                    setError(artworks?.error + ': ' + artworks?.detail);
                    newIds[region] = [];
                    continue;
                }
                const artworkIds = artworks.map((artwork, idx) => artwork?.id);
                newIds[region] = artworkIds;
            }
            setIds(newIds);
        }
        fetchIDsAll();
    }, [currRegion]);


    const rs = useMemo(() => {
        console.log("Selector Init: ", ids);
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
        return null;
    }, [ids]);

    useEffect(() => {
        if (!ids) return;
        if (rs && toQuery) {
            setIsLoading(true);
            const fetchArtworks = async (ids) => {
                let artworksLeft = 0;
                if (limitSize) {
                    artworksLeft = size - artworks.length;
                } else {
                    artworksLeft = PAGE_SIZE;
                }
                const aws = [];
                let cg = currGallary;
                while (artworksLeft > 0) {
                    const selectedIds = rs.select(1);
                    // Current selector is empty
                    if (selectedIds.length === 0) {
                        // Run out of artworks
                        if (cg === 2) {
                            setIsEnd(true);
                            break; 
                        }
                        // Find artworks in next level of region
                        rs.reset(ids[REGION_TYPES[currGallary + 1]]);
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
                            setToQuery(prev => false);
                            setIsLoading(false);
                            continue;
                        }
                        aws.push(artwork);
                        artworksLeft -= 1;
                    }
                }
                // if (limitSize) {
                //     const newLength = artworks.length + aws.length;
                //     if (size < newLength) {
                //         setArtworks(prev => [...prev,...aws].slice(newLength - size, newLength));
                //     } else {
                //         setArtworks(prev => [...prev,...aws]);
                //     }
                // } else {
                //     setArtworks(prev => [...prev,...aws]);
                // }
                setArtworks(prev => [...prev,...aws]);
                console.log('Artworks: ', [...artworks, ...aws]);
                setIsLoading(false);
            }
            fetchArtworks(ids);
            setToQuery(false);
        }
    }, [toQuery, rs]);
    
    return artworks;
}