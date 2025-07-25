import { useState, useEffect, useMemo, useContext, useRef } from "react";

import Image from "next/image";
import TimeLine from "@/components/TimeLine/TimeLine";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { smallMapDetailsQuery, smallMapDetailsFields } from "@/constants/google_map_queries";
import { usePlace } from "@/hooks/placeHooks";

import { regionQuery } from "@/constants/google_map_queries";
import RandomSelector from "@/common/RandomSelector";
import getState from "@/common/getState";
import { ErrorContext } from "@/app/page";

import { getArtworkById, getArtworksByQuery } from "@/api/api";
import ArtworkDisplay from "@/components/ArtworkDisplay/ArtworkDisplay";

const MIN_SIZE = 36;
const PAGE_SIZE = 6;
const MAX_SIZE = 36;
const REGION_TYPES = ['local', 'county','state'];

const MapPanel = ({place, isSmall=false}) => {
    const map = useMap();
    const placesLib = useMapsLibrary('places');

    const [time, setTime] = useState(2025);
    const [details, setDetails] = useState(false);
    const [selectedArtwork, setSelectedArtwork] = useState({});
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
    const [artworks, setArtworks] = useState([]);
    const [toQuery, setToQuery] = useState(true);
    const [selectorInit, setSelectorInit] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const containerRef = useRef(null);

    const { error, setError } = useContext(ErrorContext);

    const detailedPlace = usePlace(place, map, placesLib, smallMapDetailsQuery);

    // Scroll event listener for loading more content
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = (e) => {
            e.stopPropagation(); // Prevent scroll from bubbling to parent
            
            if (isLoading || isEnd) return;
            
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            // Trigger load more when user is 200px from bottom
            if (scrollTop + clientHeight >= scrollHeight - 40) {
                setToQuery(true);
            }
        };

        const handleWheel = (e) => {
            // Only prevent propagation if we can scroll in the intended direction
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            
            if ((e.deltaY > 0 && scrollTop < scrollHeight - clientHeight) || 
                (e.deltaY < 0 && scrollTop > 0)) {
                e.stopPropagation();
            }
        };

        container.addEventListener('scroll', handleScroll);
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            container.removeEventListener('scroll', handleScroll);
            container.removeEventListener('wheel', handleWheel);
        };
    }, [isLoading, isEnd]);

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
        if (place) {
            console.log("Place: " + place);
            let local = '';
            let county = '';
            let state = '';
            // Search for local
            if (place?.name) {
                local = place.name;
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
                } else {
                    setError('STATE_NOT_FOUND');
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
        // if (selectorInit) return;
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
                let artworksLeft = PAGE_SIZE;
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
                setArtworks(prev => [...prev,...aws]);
                console.log('Artworks: ', artworks);
                setIsLoading(false);
            }
            fetchArtworks(ids);
            setToQuery(false);
        }
    }, [toQuery, rs]);
    
    return (<>
        {details ? 
            (<ArtworkDisplay artwork={selectedArtwork} setDetails={setDetails}/>)
        : (
            <div className="border border-gray-200 w-[33vw] max-[768px]:w-[100vw] h-screen">
                <div ref={containerRef} className="overflow-y-auto overflow-x-hidden w-full h-[20vh] flex flex-col">
                    <div className="flex flex-row p-2">
                        {!isSmall && (<TimeLine time={time} setTime={setTime}/>)}
                        <button className="text-gray-500 text-xs" onClick={() => {setToQuery(true)}}>Reload</button>
                    </div>
                    
                    <div className="mb-2 m-2">Year: {time}</div>
                    <div className="mb-2 m-2">About {place.name}</div>
                </div>
                <div ref={containerRef} className="overflow-y-auto h-[70vh] flex flex-row flex-wrap gap-2">
                    {artworks.map((item, index) => {
                        
                        return (
                            <div                          
                                className="relative w-full lg:w-[calc(50%-0.25rem)] aspect-square bg-gray-100 overflow-hidden"                          
                                key={index}
                                onClick={() => {
                                    setSelectedArtwork(item);
                                    setDetails(true);
                                }}                     
                            >                         
                                <Image                             
                                    className="dark:invert w-full h-full object-cover"                             
                                    src={item?.primaryImageLarge}                             
                                    alt={item?.thumbnail?.alt_text || item?.title || 'Artwork'}                             
                                    fill={true}                             
                                    sizes='500px'                             
                                    blurDataURL="/sample-img.jpg"                             
                                    placeholder="blur"                             
                                    priority                         
                                />
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="absolute bottom-2 right-2 text-white text-sm text-right">
                                    <div className="font-bold">{item?.title}</div>
                                    <div>{item?.artist_titles.length ? item?.artist_titles[0] : 'Unknown Artist'}</div>
                                </div>                     
                            </div>
                        )
                    })}
                </div>
                {isLoading && (
                    <div className="flex justify-center py-4">
                        <div className="text-gray-500">Loading more artworks...</div>
                    </div>
                )}
                {isEnd && (
                    <div className="flex justify-center py-4">
                        <div className="text-gray-500">No more artworks to load</div>
                    </div>
                )}
            </div>
        )}
    </>);
}

export default MapPanel;