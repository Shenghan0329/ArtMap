"use client"

import { useState, useEffect, useMemo } from "react";
import { useMap, useMapsLibrary, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

import SmallMapPanel from "./SmallMapPanel/SmallMapPanel";  
import LargeMapPanel from "./LargeMapPanel/LargeMapPanel";

import ZoomButtons from "@/components/Buttons/ZoomButtons";
import SwitchButton from "@/components/Buttons/SwitchButton";
import LeftPanel from "@/components/LeftPanel/LeftPanel";
import GoogleMapSelector from "@/components/2DMap/2DMap";

import { largeMapQuery, smallMapQuery } from "@/constants/google_map_queries";
import MAP_OPTIONS from "@/constants/mapOptions";

const TwoDimensionalMap = () => {
    const map = useMap();
    const placesLib = useMapsLibrary('places');
    const [locationInit, setLocationInit] = useState(false);
    const [visible, setVisible] = useState(false);

    const [zoom, setZoom] = useState(MAP_OPTIONS.ZOOM_LEVEL);
    const [isSmall, setIsSmall] = useState(false);
    const [queryText, setQueryText] = useState(smallMapQuery);
    const [loadingEnabled, setLoadingEnabled] = useState(false);

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

    const queryToPlaces = async (res, status, pagination) => {
        setToPin(prev => {
            return [...prev, ...res]
        });
        if (pagination.hasNextPage) {
            pagination.nextPage();
        } else {
            setCanPin(true);
        }
    }

    const getMarkers =() => {
        if (!placesLib || !map) {
            return;
        }
        const svc = new placesLib.PlacesService(map);
        const bounds = map.getBounds();
        setCanPin(false)
        setToPin([]);
        let maxResults = MAP_OPTIONS.MAX_LABELS;
        svc.nearbySearch({
            'bounds': bounds,
            ...queryText
        }, (res, status, pagination) => {
            console.log(maxResults);
            if (maxResults >= 0 && status == 'OK') {
                queryToPlaces(res, status, pagination);
                maxResults -= res.length;
            } else {
                maxResults = MAP_OPTIONS.MAX_LABELS;
            }
        });
        setLoadingEnabled(false);
    }

    const markers = useMemo(() => {
        const Keys = {}
        const getKey = (address, index) => {
            let key = address?.replace(/[^0-9A-Za-z]/, '-')
            if (!address) {
                key = index;
            }
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
                    key={getKey(place.formatted_address, index)}
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
        setLoadingEnabled(true);
        if (zoom < 12) {
            setIsSmall(false);
        } else {
            setIsSmall(true);
        }
    }, [zoom]);

    useEffect(() => {
        if (isSmall) {
            setQueryText(smallMapQuery);
        } else {
            setQueryText(largeMapQuery);
        }
    }, [isSmall]);

    useEffect(() => {
        if (canPin){
            setPinned(toPin);
        }
    }, [canPin]);

    useEffect(() => {
        if (locationInit) {
            getMarkers();
        }
    }, [locationInit])

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
                    setLocationInit(true);
                },
                (err) => {
                    console.log(err);
                    return;
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
            return;
        }

        // Set Listeners
        map.addListener('zoom_changed', () => {
            const zoom = map.getZoom();
            setZoom(prevZoom => {
                return zoom;
            })
        });
        map.addListener('center_changed', () => {
            setLoadingEnabled(true);
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
                className="bg-gray-100 dark:bg-gray-800 rounded-full w-32 h-32 flex items-center justify-center absolute top-5 right-5 z-5 disabled:invisible"
                onClick={getMarkers}
                disabled={!loadingEnabled}
            >Load More</button>
            <LeftPanel visible={visible} setVisible={setVisible}>
                {isSmall ? <SmallMapPanel place={panelObject} /> : <LargeMapPanel place={panelObject} />}
            </LeftPanel>
            <GoogleMapSelector>
                {markers}
            </GoogleMapSelector>
        </div>
    );
}


export default TwoDimensionalMap;