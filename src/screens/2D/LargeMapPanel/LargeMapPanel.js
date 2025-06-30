import { useState, useEffect } from "react";

import Image from "next/image";
import TimeLine from "@/components/TimeLine/TimeLine";
import CloseButton from "@/components/Buttons/CloseButton/CloseButton";

const LargeMapPanel = ({place}) => {
    const [time, setTime] = useState(2025);

    useEffect(() => {
        console.log(place);
    }, [place]);
    
    return (<>
        <div className="flex flex-row">
            <TimeLine time={time} setTime={setTime}/>
        </div>
        <div className="mb-2">Year: {time}</div>
        <div className="mb-2">About {place.formatted_address}</div>
        <div className="flex flex-row flex-wrap gap-2">
            {[0,0,0,0,0,0,0,0].map((item, index) => {
                return (
                    <div className="relative basis-19/40 aspect-square bg-gray-100 overflow-hidden" key={index}>
                    <Image
                        className="dark:invert"
                        src="/sample-img.jpg"
                        alt="Sample Image"
                        layout="fill"
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                    </div>
                )
            })}
        </div>
    </>);
}

export default LargeMapPanel;