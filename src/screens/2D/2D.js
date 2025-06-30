"use client"

import SmallMapPanel from "./SmallMapPanel/SmallMapPanel";  
import LargeMapPanel from "./LargeMapPanel/LargeMapPanel";

import ZoomButtons from "@/components/Buttons/ZoomButtons/ZoomButtons";
import SwitchButton from "@/components/Buttons/SwitchButton/SwitchButton";
import LeftPanel from "@/components/LeftPanel/LeftPanel";
import GoogleMapSelector from "@/components/2DMap/2DMap";
import { useState, useEffect, useMemo } from "react";
import { useMap, useMapsLibrary, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

const TwoDimensionalMap = () => {
    const map = useMap();
    const placesLib = useMapsLibrary('places');
    const [locationInit, setLocationInit] = useState(false);
    const [visible, setVisible] = useState(false);
    const [isSmall, setIsSmall] = useState(false);

    const [canPin, setCanPin] = useState(false);
    const [toPin, setToPin] = useState([]);
    const [pinned, setPinned] = useState([]);
    const [panelObject, setPanelObject] = useState({});

    const handleZoomIn = () => {
        if(map) map.setZoom(map.getZoom() + 1);
    };

    const handleZoomOut = () => {
        if(map) map.setZoom(map.getZoom() - 1);
    };

    const queryToPlaces = async (res, status, pagination, maxResults = 40) => {
        if (maxResults <= pinned.length || status !== 'OK') {
            return;
        }
        setToPin(prev => [...prev, ...res]);
        if (pagination.hasNextPage) {
            pagination.nextPage();
        } else {
            setCanPin(true);
        }
    }

    const markers = useMemo(() => {
        const Keys = {}
        const getKey = (address) => {
            let key = address.replace(/[^0-9A-Za-z]/, '-')
            if (Keys[key]) {
                key = key + '-' + Keys[key];
                Keys[address] += 1;
            } else {
                Keys[key] = 2;
            }
            return key;
        }
        return (
            pinned.map((place, index) => {
                return(
                <AdvancedMarker 
                    position={place.geometry.location} 
                    key={getKey(place.formatted_address)}
                    onClick={() => {
                        setPanelObject(place);
                        setVisible(true);
                    }}
                >
                    <Pin
                        background={'#0f9d58'}
                        borderColor={'#006425'}
                        glyphColor={'#60d98f'}
                        
                    />
                </AdvancedMarker>
                )
            }) 
        )
    }, [pinned]);

    useEffect(() => {
        if (canPin){
            setPinned(toPin);
        }
    }, [canPin]);

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
            const svc = new placesLib.PlacesService(map);
            const bounds = map.getBounds();
            setCanPin(false)
            setToPin([]);
            svc.textSearch({
                'bounds': bounds,
                'type': 'locality',
                'query': 'city',
            }, (res, status, pagination) => {
                queryToPlaces(res, status, pagination);
            });
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
                onClick={() => {
                    setVisible(true);
                }}
            >Open Left Panel</button>
            <LeftPanel visible={visible} setVisible={setVisible}>
                {isSmall ? <SmallMapPanel /> : <LargeMapPanel place={panelObject} />}
            </LeftPanel>
            <GoogleMapSelector>
                {markers}
            </GoogleMapSelector>
        </div>
    );
}


export default TwoDimensionalMap;