import { useState, useEffect, useMemo, useContext } from "react";
import RandomSelector from "@/common/RandomSelector";
import { useDebounced } from "./generalHooks";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { ErrorContext } from "@/app/page";

import { getArtworkById, getArtworksByQuery, searchArtworksByTimeRange } from "@/api/api";

const MAX_SIZE = 96;

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
const baseRegions = {
    administrative_area_level_2: '', 
    administrative_area_level_1: '',
    country: ''
};

export function useArtworks(
    place, 
    toQuery, setToQuery, 
    setIsLoading, setIsEnd, 
    options = {
        "PAGE_SIZE": 6, 
        "limitSize": false, 
        "byDate": false,
        "from": 1600,
        "to": 2000,
        "isSmall": false,
        "streetView": false
    }
) {
    const map = useMap();
    const geocoder = useMapsLibrary('geocoding');
    const placesLib = useMapsLibrary('places');
    const {setError} = useContext(ErrorContext);
    const [artworks, setArtworks] = useState([]);
    const { PAGE_SIZE, limitSize, byDate, from, to, isSmall, streetView } = options;
    const dFrom = useDebounced(from, 500);
    const dTo = useDebounced(to, 500);

    // Set Regions and Ids, using geocoding to get proper address components
    const [currRegion, setCurrRegion] = useState({});
    const [currGallary, setCurrGallary] = useState(0);
    const [ids, setIds] = useState({});
    const [idInit, setIdInit] = useState(false);

    const REGION_TYPES = streetView ? 
        ['neighborhood', 'sublocality', 'administrative_area_level_2', 'administrative_area_level_1', 'country'] 
        : (isSmall ? ['sublocality', 'administrative_area_level_2', 'administrative_area_level_1', 'country']
            : ['administrative_area_level_2', 'administrative_area_level_1', 'country']
        );

    // Function to extract region names from geocoding results
    const extractRegionsFromGeocoding = (addressComponents) => {
        const regions = streetView ? 
            {
                neighborhood: '',
                sublocality: '',
                ...baseRegions
            } : (
                isSmall ? {
                    sublocality: '',
                    ...baseRegions
                } : baseRegions
            );

        addressComponents.forEach(component => {
            // Check each address component type
            if (component.types.includes('sublocality') || 
                component.types.includes('sublocality_level_1')) {
                regions.sublocality = component.long_name;
            }
            if (component.types.includes('administrative_area_level_2')) {
                regions.administrative_area_level_2 = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
                regions.administrative_area_level_1 = component.long_name;
            }
            if (component.types.includes('country')) {
                regions.country = component.long_name;
            }
        });

        return regions;
    };

    // Geocode the place to get proper address components
    const geocodePlace = async (place) => {
        if (!geocoder || !place) return {};

        return new Promise((resolve, reject) => {
            const geocoderService = new geocoder.Geocoder();
            
            let request = {};
            
            // If we have coordinates, use them for reverse geocoding
            if (place.geometry && place.geometry.location) {
                request = {
                    location: place.geometry.location
                };
            }
            // Otherwise, use the place name/formatted address
            else if (place.formatted_address) {
                request = {
                    address: place.formatted_address
                };
            }
            else if (place.name) {
                request = {
                    address: place.name
                };
            }
            else {
                resolve({});
                return;
            }

            geocoderService.geocode(request, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const regions = extractRegionsFromGeocoding(results[0].address_components);
                    resolve(regions);
                } else {
                    console.warn('Geocoding failed:', status);
                    resolve({});
                }
            });
        });
    };

    // Reinit Artwork when place changes
    useEffect(() => {
        if (!map || !placesLib || !geocoder) return;
            
        // Reset Everything upon place change
        console.log("Init Artworks panel"); 
        setArtworks([]);
        setToQuery(false);
        setIsEnd(false);
        setIsLoading(false);
        setIds({});
        setIdInit(false);
        setCurrRegion({});
        if (rs) rs.reset([]);

        // Query Regions using geocoding
        if (place && Object.keys(place).length) {
            geocodePlace(place).then(regions => {
                setCurrRegion(regions);
            }).catch(error => {
                setError('GEOCODING_FAILED');
            });
        }
    }, [place, dFrom, dTo, geocoder]);

    useEffect(() => {
        if (!currRegion || Object.keys(currRegion).length === 0) return;
        
        async function fetchIDsAll() {
            const newIds = {...ids};
            
            for (let regionType of REGION_TYPES){
                const location = currRegion[regionType];
                if (!location || location === '') {
                    newIds[regionType] = [];
                    continue;
                }
                
                let artworks = [];
                try {
                    let fromYear = 0;
                    let toYear = 3000;
                    if (byDate) {
                        fromYear = dFrom;
                        toYear = dTo;
                    } 
                    if (currRegion?.country) {
                        artworks = await searchArtworksByTimeRange(
                            fromYear, toYear, 
                            {
                                "searchTerm": location,
                                "limit": MAX_SIZE,
                                "page": 1,
                                "publicDomainOnly": true,
                                "placeOfOrigin": currRegion.country
                            }
                        );
                    } else {
                        artworks = await searchArtworksByTimeRange(
                            dFrom, dTo, 
                            {
                                "searchTerm": location,
                                "limit": MAX_SIZE,
                                "page": 1,
                                "publicDomainOnly": true,
                            }
                        );
                    }
                    if (artworks?.error) {
                        setError(artworks?.error + ': ' + artworks?.detail);
                        newIds[regionType] = [];
                        continue;
                    }
                    
                    const artworkIds = artworks.map((artwork, idx) => artwork?.id);
                    newIds[regionType] = artworkIds;
                } catch (error) {
                    console.error(`Error fetching artworks for ${regionType}:`, error);
                    newIds[regionType] = [];
                }
            }
            setIds(newIds);
            setIdInit(true);
        }
        fetchIDsAll();
    }, [currRegion]);

    const rs = useMemo(() => {
        if (!idInit) return null;
        console.log("Artwork Random Selector Initing: ", ids);
        
        // Try each region type in order of preference
        for (let i = 0; i < REGION_TYPES.length; i++) {
            const regionType = REGION_TYPES[i];
            if (ids[regionType]?.length) {
                setCurrGallary(i);
                setToQuery(true);
                return new RandomSelector(ids[regionType]);
            }
        }
        
        setIsEnd(true);
        return null;
    }, [idInit, ids]);

    useEffect(() => {
        if (!idInit) return;
        if (rs && toQuery) {
            setIsLoading(true);
            const fetchArtworks = async (ids) => {
                let artworksLeft = PAGE_SIZE;
                const aws = [];
                let cg = currGallary;
                
                while (artworksLeft > 0) {
                    const selectedIds = rs.select(1);
                    // Current selector is empty
                    if (selectedIds.length === 0) {
                        // Run out of artworks at the broadest level (country)
                        if (cg === REGION_TYPES.length - 1) {
                            if (!limitSize) {
                                setIsEnd(true);
                                break; 
                            } else {
                                setCurrGallary(0);
                                rs.reset(ids[REGION_TYPES[0]]);
                            }
                        } else {
                            // Find artworks in next level of region
                            const nextRegionType = REGION_TYPES[cg + 1];
                            if (ids[nextRegionType]?.length > 0) {
                                rs.reset(ids[nextRegionType]);
                                setCurrGallary(prev => prev + 1);
                                cg += 1;
                                continue;
                            } else {
                                // Skip to next region if current one is empty
                                cg += 1;
                                if (cg >= REGION_TYPES.length) {
                                    setIsEnd(true);
                                    break;
                                }
                                continue;
                            }
                        }
                    }
                    
                    // Get Artwork from id
                    for (let i = 0; i < selectedIds.length; i++) {
                        const currId = selectedIds[i];
                        if (!currId) continue;
                        
                        try {
                            const artwork = await getArtworkById(currId);
                            if (artwork?.error) {
                                setError(artwork?.error + ': ' + artwork?.detail);
                                continue;
                            }
                            aws.push(artwork);
                            artworksLeft -= 1;
                        } catch (error) {
                            console.error('Error fetching artwork:', error);
                            continue;
                        }
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