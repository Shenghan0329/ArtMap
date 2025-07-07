import { useState, useEffect } from "react";

import Image from "next/image";
import TimeLine from "@/components/TimeLine/TimeLine";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { smallMapDetailsQuery, smallMapDetailsFields } from "@/constants/google_map_queries";
import { usePlace } from "@/hooks/placeHooks";

const LargeMapPanel = ({place}) => {
    const map = useMap();
    const placesLib = useMapsLibrary('places');
    const [time, setTime] = useState(2025);

    const detailedPlace = usePlace(place, map, placesLib, smallMapDetailsQuery);
    
    return (<>
        <div className="flex flex-row">
            <TimeLine time={time} setTime={setTime}/>
        </div>
        <div className="mb-2">Year: {time}</div>
        <div className="mb-2">About {place.name}</div>
        <div className="flex flex-row flex-wrap gap-2">
            {detailedPlace?.photos?.slice(0, 8).map((item, index) => {
                const imgUrl = item.getUrl();
                return (
                    <div className="relative basis-19/40 aspect-square bg-gray-100 overflow-hidden" key={index}>
                        <Image
                            className="dark:invert w-full h-auto"
                            src={imgUrl}
                            alt="Sample Image"
                            fill={true}
                            sizes='500px'
                            blurDataURL="/sample-img.jpg"
                            placeholder="blur"
                            priority
                        />
                    </div>
                )
            })}
        </div>
    </>);
}

export default LargeMapPanel;