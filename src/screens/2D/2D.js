"use client"

import { useState, useEffect, useMemo, useContext, use } from "react";
import { useMap, useMapsLibrary, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { ErrorContext } from "@/app/page";
import { useLocationInit } from "@/hooks/mapHooks";

import SmallMapPanel from "./SmallMapPanel/SmallMapPanel";  
import LargeMapPanel from "./LargeMapPanel/LargeMapPanel";

import ZoomButtons from "@/components/Buttons/ZoomButtons";
import SwitchButton from "@/components/Buttons/SwitchButton";
import LeftPanel from "@/components/LeftPanel/LeftPanel";
import GoogleMapSelector from "@/components/2DMap/2DMap";
import { PictureFrame3D } from "@/components/3D/PictureFrame3D";

import { largeMapQuery, smallMapQuery } from "@/constants/google_map_queries";
import MAP_OPTIONS from "@/constants/mapOptions";
import STREETVIEW_OPTIONS from "@/constants/streetViewOptions";
import StreetViewPanel from "./StreetViewPanel/StreetViewPanel";

const TwoDimensionalMap = () => {
    const {setError} = useContext(ErrorContext);
    const map = useMap();
    const placesLib = useMapsLibrary('places');

    const locationInit = useLocationInit(map, placesLib);
    const [loadingEnabled, setLoadingEnabled] = useState(false);

    const [visible, setVisible] = useState(false);
    const [is2D, setIs2D] = useState(true);
    const [zoom, setZoom] = useState(MAP_OPTIONS.defaultZoom);
    const [pov, setPov] = useState({heading: 0, pitch: 0});

    const [selectedPos, setSelectedPos] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(-1);
    const [streetView, setStreetView] = useState(null);
    const [streetViewAvailable, setStreetViewAvailable] = useState(false);

    const [isSmall, setIsSmall] = useState(true);
    const [queryText, setQueryText] = useState(smallMapQuery);
    

    const [canPin, setCanPin] = useState(false);
    const [toPin, setToPin] = useState([]);
    const [pinned, setPinned] = useState([]);
    const [panelObject, setPanelObject] = useState({});
    const [artwork, setArtwork] = useState({});

    const handleZoomIn = () => {
        if (map) {
            if (is2D) map.setZoom(map.getZoom() + 1);
            else streetView.setZoom(streetView.getZoom() + 0.5);
        }
    };

    const handleZoomOut = () => {
        if (map) {
            if (is2D) map.setZoom(map.getZoom() - 1);
            else streetView.setZoom(streetView.getZoom() - 0.5);
        }
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

    const getMarkers = (toStore = false) => {
        if (!placesLib || !map) {
            return;
        }
        // Reset selected Marker and Position
        setSelectedMarker(-1);
        setSelectedPos(null);
        // Load target
        const svc = new placesLib.PlacesService(map);
        const bounds = map.getBounds();
        setCanPin(false)
        setToPin([]);
        let maxResults = MAP_OPTIONS.MAX_LABELS;
        svc.nearbySearch({
            'bounds': bounds,
            ...queryText
        }, (res, status, pagination) => {
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
                        setSelectedPos(place.geometry.location);
                        setSelectedMarker(index);
                        setVisible(true);
                    }}
                >
                    <Pin
                        background={selectedMarker == index ? 'red' : 'blue'}
                        borderColor={'#006425'}
                        glyphColor={'#60d98f'}
                    />
                </AdvancedMarker>
                )
            }) 
        )
    }, [pinned, selectedMarker]);

    useEffect(() => {
        if (zoom > 13) {
            setIsSmall(true);
        } else {
            setIsSmall(false);
        }
    }, [zoom])

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
        getMarkers();
    }, [queryText, locationInit]);

    useEffect(() => {
        if (selectedPos !== null && streetView) {
            streetView.setPosition(selectedPos);
        }
    }, [selectedPos]);

    useEffect(() => {
        if (!streetView) return; 
        if (!is2D && isSmall && streetViewAvailable) {
            streetView.setVisible(true);       
        } else {
            streetView.setVisible(false);
        }
    }, [is2D, streetViewAvailable]);


    useEffect(() => {
        if (!placesLib || !map) return;
                // Set Listeners
        map.addListener('zoom_changed', () => {
            const zoom = map.getZoom();
            setLoadingEnabled(true);
            setZoom(zoom);
        });
        map.addListener('center_changed', () => {
            setLoadingEnabled(true);
        });
    }, [map, placesLib]);

    useEffect(() => {
        if (!map) return; 
        const streetView = map.getStreetView();
        streetView.setOptions(STREETVIEW_OPTIONS);
        setStreetView(streetView);
        streetView.setZoom(0);
        const pov = streetView.getPov();
        setPov(pov);
        streetView.addListener("position_changed", () => {
            setStreetViewAvailable(true);
        });
        streetView.addListener("status_changed", () => {
            if (streetView.getStatus() !== "OK") {
                setError("3D_VIEW_NOT_AVAILABLE");
                setStreetViewAvailable(false);
                setIs2D(true);
            } else {
                setStreetViewAvailable(true);
            }
        });
        streetView.addListener("pov_changed", () => {
            const pov = streetView.getPov();
            setPov(pov);
        });
    }, [map]);

    
    return (
        <div className="font-[family-name:var(--font-geist-sans)] w-full h-screen">
            {!is2D && <PictureFrame3D pov={pov} images={[
                { position: [0, 0, 0], rotation: [0, 0, 0], artwork: {name: '1', url: '/sample-img.jpg', }, onClick: () => {setArtwork({name: '1'}); setVisible(true);}},
                { position: [-1, 0, -3], rotation: [0, 0, 0], artwork: {name: '2', url: '/sample-img.jpg',}, onClick: () => {setArtwork({name: '2'}); setVisible(true);}},
                { position: [-2, 0, -6], rotation: [0, 0, 0], artwork: {name: '3', url: '/sample-img.jpg', }, onClick: () => {setArtwork({name: '3'}); setVisible(true);}}
            ]}/>}
            <ZoomButtons 
                handleZoomIn={handleZoomIn}
                handleZoomOut={handleZoomOut}
            />
            {
                isSmall && selectedPos !== null && (
                    <SwitchButton onClick={async () => {
                        setIs2D(prev => !prev);
                    }} />
                )
            }
            <button 
                className="bg-gray-100 dark:bg-gray-800 rounded-full w-32 h-32 flex items-center justify-center absolute top-5 right-5 z-5 disabled:invisible"
                onClick={getMarkers}
                disabled={!loadingEnabled}
            >Load More</button>
            <LeftPanel visible={visible} setVisible={setVisible} transparent={isSmall && !is2D}>
                {isSmall ? 
                    (is2D ? <SmallMapPanel place={panelObject} /> : <StreetViewPanel artwork={artwork} /> ): 
                    <LargeMapPanel place={panelObject} />}
            </LeftPanel>
            <GoogleMapSelector>
                {markers}
                
            </GoogleMapSelector>
        </div>
    );
}


export default TwoDimensionalMap;