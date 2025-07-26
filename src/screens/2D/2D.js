"use client"

import { useState, useEffect, useMemo, useContext, use } from "react";
import { useMap, useMapsLibrary, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { ErrorContext } from "@/app/page";
import { useLocationInit } from "@/hooks/mapHooks";
import { useArtworks } from "@/hooks/artworkHooks";

import ZoomButtons from "@/components/Buttons/ZoomButtons";
import SwitchButton from "@/components/Buttons/SwitchButton";
import LeftPanel from "@/components/LeftPanel/LeftPanel";
import GoogleMapSelector from "@/components/2DMap/2DMap";
import { PictureFrame3D } from "@/components/3D/PictureFrame3D";

import { largeMapQuery, smallMapQuery } from "@/constants/google_map_queries";
import MAP_OPTIONS from "@/constants/mapOptions";
import STREETVIEW_OPTIONS from "@/constants/streetViewOptions";
import StreetViewPanel from "./StreetViewPanel/StreetViewPanel";
import MapPanel from "./MapPanel";
import ArtworkDisplay from "@/components/ArtworkDisplay/ArtworkDisplay";

const STREETVIEW_MIN_ZOOM = 0.8140927000158323
const STREETVIEW_MAX_ZOOM = 3

const IMAGE_NUMBER = 3;
const defaultPov = {heading: 0, pitch: 0};

const TwoDimensionalMap = () => {
    const {setError} = useContext(ErrorContext);
    const map = useMap();
    
    const placesLib = useMapsLibrary('places');

    const locationInit = useLocationInit(map, placesLib);
    const [loadingEnabled, setLoadingEnabled] = useState(false);

    const [visible, setVisible] = useState(false);
    const [is2D, setIs2D] = useState(true);

    const [selectedPos, setSelectedPos] = useState(null);
    const [selectedMarker, setSelectedMarker] = useState(-1);
    const [streetViewAvailable, setStreetViewAvailable] = useState(false);

    const [isSmall, setIsSmall] = useState(true);
    const [queryText, setQueryText] = useState(smallMapQuery);
    

    const [canPin, setCanPin] = useState(false);
    const [toPin, setToPin] = useState([]);
    const [pinned, setPinned] = useState([]);
    const [panelObject, setPanelObject] = useState({});
    const [artwork, setArtwork] = useState({});

    
    const [toQuery, setToQuery] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const artworks = useArtworks(map, placesLib, panelObject, toQuery, setToQuery, setIsLoading, setIsEnd, setError, 1, true, IMAGE_NUMBER);
    const positions = [[0, 0, 0], [-1, 0, -3], [-2, 0, -6]];
    const rotation = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    console.log('aaa');
    const images = artworks.map((artwork, index) => {
        return {
            position: positions[index],
            rotation: rotation[index],
            artwork: artwork,
            onClick: () => {
                setArtwork(artwork);
                setVisible(true);
            }
        }
    });

    const handleZoomIn = () => {
        if (map) {
            if (is2D) map.setZoom(map.getZoom() + 1);
            else {
                const streetView = map.getStreetView();
                const updatedZoom = Math.min(streetView.getZoom() + 0.2, STREETVIEW_MAX_ZOOM);
                streetView.setZoom(updatedZoom);
                streetView.setPov({...streetView.getPov(), zoom: updatedZoom});
            }
        }
    };

    const handleZoomOut = () => {
        if (map) {
            if (is2D) map.setZoom(map.getZoom() - 1);
            else {
                const streetView = map.getStreetView();
                const updatedZoom = Math.max(streetView.getZoom() - 0.2, STREETVIEW_MIN_ZOOM);
                streetView.setZoom(updatedZoom);
                streetView.setPov({...streetView.getPov(), zoom: updatedZoom});
            }
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
        setPanelObject({});
        setVisible(false);
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
        if (!map) return;
        const streetView = map.getStreetView();
        if (selectedPos !== null && streetView) {
            streetView.setPosition(selectedPos);
        }
    }, [selectedPos]);

    useEffect(() => {
        if (!map) return; 
        const streetView = map.getStreetView();
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
            if (!loadingEnabled) {
                setLoadingEnabled(true);
            }
            if (zoom > 13) {
                if (!isSmall) setIsSmall(true);
            } else {
                if (isSmall) setIsSmall(false);
            }
        });
        map.addListener('center_changed', () => {
            setLoadingEnabled(true);
        });
    }, [map, placesLib]);

    useEffect(() => {
        if (!map) return; 
        const streetView = map.getStreetView();
        streetView.setOptions(STREETVIEW_OPTIONS);
        streetView.setZoom(0);
        const pov = streetView.getPov();
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
            if (pov.zoom < STREETVIEW_MIN_ZOOM) {
                pov.zoom = STREETVIEW_MIN_ZOOM;
                streetView.setPov(pov);
                streetView.setZoom(pov.zoom);
            }
            if (pov.zoom > STREETVIEW_MAX_ZOOM) {
                pov.zoom = STREETVIEW_MAX_ZOOM;
                streetView.setPov(pov);
                streetView.setZoom(pov.zoom);
            }
        });
    }, [map]);

    
    return (
        <div className="font-[family-name:var(--font-geist-sans)] w-full h-screen">
            {!is2D && <PictureFrame3D pov={map?.streetView?.getPov() || defaultPov} images={images} />}
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
                {is2D ? 
                    <MapPanel place={panelObject} isSmall={isSmall} /> : 
                    <ArtworkDisplay 
                        artwork={artwork} 
                        setDetails={() => {
                            setVisible(false);
                        }}
                    />
                }
            </LeftPanel>
            <GoogleMapSelector>
                {markers}
            </GoogleMapSelector>
        </div>
    );
}


export default TwoDimensionalMap;