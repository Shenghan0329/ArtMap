"use client"

import SmallMapPanel from "./SmallMapPanel/SmallMapPanel";  
import LargeMapPanel from "./LargeMapPanel/LargeMapPanel";

import ZoomButtons from "@/components/Buttons/ZoomButtons";
import SwitchButton from "@/components/Buttons/SwitchButton";
import LeftPanel from "@/components/LeftPanel/LeftPanel";
import GoogleMapSelector from "@/components/2DMap/2DMap";
import { useState, useEffect, use } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

const TwoDimensionalMap = () => {
    const map = useMap();
    const placesLib = useMapsLibrary('places');
    const [locationInit, setLocationInit] = useState(false);
    const [visible, setVisible] = useState(false);
    const [isSmall, setIsSmall] = useState(false);

    const handleZoomIn = () => {
        map.setZoom(map.getZoom() + 1);
    };

    const handleZoomOut = () => {
        map.setZoom(map.getZoom() - 1);
    };

    const getRadius = () => {
        const bounds = map.getBounds();
        const {Kh, ki} = bounds;
        const khl = Kh.lo;
        const khh = Kh.hi;
        const kil = ki.lo; 
        const kih = ki.hi;
        const radius = Math.max(khh-khl, kih-kil) * 111000;
        return radius;
    }

    useEffect(() => {
        if (!placesLib || !map) return;

        console.log(map);
        // Set Current Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    map.setCenter(currLocation);
                },
                (err) => {
                    console.log(err);
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
            return;
        }
        setLocationInit(true);

        // Set Listeners
        map.addListener('zoom_changed', () => {
            const zoom = map.getZoom();
            if (zoom < 12) {
                setIsSmall(false);
            } else {
                setIsSmall(true);
            }
        });
        
        map.addListener('zoom_changed', () => {
            const zoom = map.getZoom();
            const svc = new placesLib.PlacesService(map);
            svc.nearbySearch({
                "type": 'locality',
                "radius": getRadius(),
                "location": map.getCenter()
            }, (res, status, pagination) => {
                console.log(res, status, pagination);
            })
        });
        
    }, [map, placesLib]);

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
            <GoogleMapSelector />
        </div>
    );
}


export default TwoDimensionalMap;