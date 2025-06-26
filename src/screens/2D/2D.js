"use client"

import SmallMapPanel from "./SmallMapPanel/SmallMapPanel";  
import LargeMapPanel from "./LargeMapPanel/LargeMapPanel";

import ZoomButtons from "@/components/Buttons/ZoomButtons/ZoomButtons";
import SwitchButton from "@/components/Buttons/SwitchButton/SwitchButton";
import LeftPanel from "@/components/LeftPanel/LeftPanel";
import GoogleMapSelector from "@/components/2DMap/2DMap";
import { useState, useEffect } from "react";

const TwoDimensionalMap = () => {
const [visible, setVisible] = useState(false);
const [mapOptions, setMapOptions] = useState({
    center: { lat: 37.5665, lng: 126.9780 },
    zoom: 13
});
const [mapEvent, setMapEvent] = useState({});
const [isSmall, setIsSmall] = useState(false);

const handleZoomIn = () => {
    setMapOptions({...mapOptions, zoom: mapOptions.zoom + 1 });
};

const handleZoomOut = () => {
    setMapOptions({...mapOptions, zoom: mapOptions.zoom - 1 });
};

useEffect(() => {
    if(mapOptions) {
        console.log(mapOptions.zoom);
    }
}, [mapOptions]);

useEffect(() => {
    const detail = mapEvent?.detail;
    if (detail?.zoom > 10) {
        setIsSmall(true);
    } else {
        setIsSmall(false);
    }
}, [mapEvent]);

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
            {isSmall ? <SmallMapPanel /> : <LargeMapPanel />}
        </LeftPanel>
        <GoogleMapSelector
            mapOptions={mapOptions}
            setMapOptions={setMapOptions}
            mapEvent={mapEvent}
            setMapEvent={setMapEvent}
        />
    </div>
);
}


export default TwoDimensionalMap;