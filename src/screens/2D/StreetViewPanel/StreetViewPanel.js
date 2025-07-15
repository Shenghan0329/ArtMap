import { useState, useEffect } from "react";

import Image from "next/image";
import TimeLine from "@/components/TimeLine/TimeLine";
import CloseButton from "@/components/Buttons/CloseButton";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { smallMapDetailsQuery, smallMapDetailsFields } from "@/constants/google_map_queries";
import { usePlace } from "@/hooks/placeHooks";

const StreetViewPanel = ({artwork}) => {
    const map = useMap();
    const placesLib = useMapsLibrary('places');
    const detailedPlace = usePlace(artwork, map, placesLib, smallMapDetailsQuery);

    return (<>
        <div className="text-white text-lg font-bold">{artwork?.name}</div>
        <div className="text-white text-sm">Location: {artwork?.vicinity}</div>
        <div className="text-white flex flex-row flex-wrap gap-2">
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

export default StreetViewPanel;