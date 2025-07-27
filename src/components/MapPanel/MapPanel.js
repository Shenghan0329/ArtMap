import { useState, useEffect, useContext, useRef } from "react";

import { ErrorContext } from "@/app/page";

import TimeLine from "@/components/TimeLine/TimeLine";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { smallMapDetailsQuery, smallMapDetailsFields } from "@/constants/google_map_queries";
import { usePlace } from "@/hooks/placeHooks";
import { useArtworks } from "@/hooks/artworkHooks";

import ArtworkDisplay from "@/components/ArtworkDisplay/ArtworkDisplay";
import ArtworkImage from "@/components/ArtworkImage/ArtworkImage";

const MapPanel = ({place, isSmall=true}) => {
    const map = useMap();
    const placesLib = useMapsLibrary('places');
    const { error, setError } = useContext(ErrorContext);

    const [time, setTime] = useState([1900, 2000]);
    const [details, setDetails] = useState(false);
    const [toQuery, setToQuery] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const artworks = useArtworks(
        map, placesLib, place, toQuery, setToQuery, 
        setIsLoading, setIsEnd, setError, 
        {
            "PAGE_SIZE": 6,
            "limitSize": false, 
            "byDate": !isSmall,
            "from": time[0] ? time[0] : 1900,
            "to": time[1] ? time[1] : 2000,
        }
    );
    const [selectedArtwork, setSelectedArtwork] = useState({});

    const containerRef = useRef(null);

    const detailedPlace = usePlace(place, map, placesLib, smallMapDetailsQuery);

    // useEffect(() => {
    //     setDetails(false);
    // }, [place])

    // Scroll event listener for loading more content
    useEffect(() => {
        if (!place || Object.keys(place).length === 0) return;
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = (e) => {
            e.stopPropagation(); // Prevent scroll from bubbling to parent
            if (isLoading || isEnd || details) return;
            
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;
            // Trigger load more when user is 200px from bottom
            if (scrollTop + clientHeight >= scrollHeight - 120) {
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
    }, [isLoading, isEnd, details]);

    
    
    return (<>
        {details ? 
            (<ArtworkDisplay artwork={selectedArtwork} setDetails={setDetails}/>)
        : (
            <div className="border border-gray-200 w-[40vw] max-[1024px]:w-[50vw] max-[768px]:w-[100vw] h-screen">
                <div ref={containerRef} className={`p-4 overflow-y-auto overflow-x-hidden w-full ${isSmall ? 'h-[15vh]' : 'h-[20vh]'} flex flex-col justify-between`}>
                    {!isSmall && (
                        <div className="space-y-4 w-full">
                            {/* Timeline Section */}
                                <TimeLine time={time} setTime={setTime}/>
                        </div>
                    )}
                                                
                    {/* Year Display */}
                    <div className="text-md font-medium text-gray-700 flex flex-row justify-between">
                        <h1 className="w-1/2 text-lg mt-2 font-bold text-gray-900 leading-tight">
                            {place.name}
                        </h1>
                        {!isSmall &&<p className="w-1/2 text-gray-600 mt-2">Year: <span className="font-bold">{time[0] + ' - ' + time[1]}</span></p>}
                    </div>
                    
                </div>
                <div ref={containerRef} className={`overflow-y-auto h-full ${isSmall ? 'max-h-[75vh]' : 'max-h-[70vh]'} flex flex-row flex-wrap gap-2`}>
                    {artworks.map((item, index) => {
                        
                        return (
                            <div                          
                                className="relative w-full min-[728px]:w-[calc(50%-0.25rem)] min-h-[26vh] aspect-square bg-gray-100 overflow-hidden"                          
                                key={item?.title + index}
                                onClick={() => {
                                    setSelectedArtwork(item);
                                    setDetails(true);
                                }}                     
                            >                         
                                <ArtworkImage artwork={item} />
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="absolute bottom-2 right-2 text-white text-sm text-right">
                                    <div className="font-bold">{item?.title?.length <= 66 ? item?.title : item?.title?.slice(0, 60) + '...'}</div>
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
                {!isLoading && !isEnd && (
                    <div className="flex justify-center py-4">
                        <div className="text-gray-500" onClick={() => {setToQuery(true)}}>Load More</div>
                    </div>
                )}
            </div>
        )}
    </>);
}

export default MapPanel;