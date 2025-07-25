import { useState, useEffect, useContext, useRef } from "react";

import { ErrorContext } from "@/app/page";

import Image from "next/image";
import TimeLine from "@/components/TimeLine/TimeLine";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { smallMapDetailsQuery, smallMapDetailsFields } from "@/constants/google_map_queries";
import { usePlace } from "@/hooks/placeHooks";
import { useArtworks } from "@/hooks/artworkHooks";

import ArtworkDisplay from "@/components/ArtworkDisplay/ArtworkDisplay";

const MapPanel = ({place, isSmall=false}) => {
    const map = useMap();
    const placesLib = useMapsLibrary('places');
    const { error, setError } = useContext(ErrorContext);

    const [time, setTime] = useState(2025);
    const [details, setDetails] = useState(false);
    const [toQuery, setToQuery] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const artworks = useArtworks(map, placesLib, place, toQuery, setToQuery, setIsLoading, setIsEnd, setError);
    const [selectedArtwork, setSelectedArtwork] = useState({});

    const containerRef = useRef(null);

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
                                    src={item?.primaryImageMedium}                             
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