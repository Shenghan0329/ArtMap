"use client"

import SmallMapPanel from "./SmallMapPanel/SmallMapPanel";  
import LargeMapPanel from "./LargeMapPanel/LargeMapPanel";
import Image from "next/image";
import TimeLine from "@/components/TimeLine/TimeLine";
import ZoomButtons from "@/components/Buttons/ZoomButtons/ZoomButtons";
import CloseButton from "@/components/Buttons/CloseButton/CloseButton";
import SwitchButton from "@/components/Buttons/SwitchButton/SwitchButton";
import LeftPanel from "@/components/LeftPanel/LeftPanel";
import GoogleMapSelector from "@/components/2DMap/2DMap";
import { useState, useEffect } from "react";

const TwoDimensionalMap = () => {
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState(2025);
  const [map, setMap] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState({});
  const [isSmall] = useState(false);

  const handleZoomIn = () => {
    console.log(map);
    if (map) {
      map.setZoom(map.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom(map.getZoom() - 1);
    }
  };

  useEffect(() => {
    if(map) {
        console.log(map.getZoom());
    }
  }, [map])

  return (
    <div className="font-[family-name:var(--font-geist-sans)] w-full h-screen">
        <ZoomButtons 
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
        />

        <SwitchButton onClick={async () => {
          console.log("Switch")
        }} />
        <button 
          className="bg-gray-100 dark:bg-gray-800 rounded-full w-32 h-32 flex items-center justify-center absolute top-5 right-5 z-5"
          onClick={async () => {
            "use client"
            setVisible(true);
          }}
        >Open Left Panel</button>
        <LeftPanel visible={visible} setVisible={setVisible}>
          <div className="flex flex-row">
            <TimeLine time={time} setTime={setTime}/>
            <CloseButton onClick={async () => {
              "use client"
              setVisible(false);
            }} />
          </div>
          <div className="mb-2">Year: {time}</div>
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
        </LeftPanel>
        <GoogleMapSelector 
          map={map} 
          setMap={setMap}
          selectedPlace={selectedPlace}
          setSelectedPlace={setSelectedPlace}
        />
    </div>
  );
}


export default TwoDimensionalMap;