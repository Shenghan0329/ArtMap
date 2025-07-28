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
import MapPanel from "../../components/MapPanel/MapPanel";
import ArtworkDisplay from "@/components/ArtworkDisplay/ArtworkDisplay";
import { THREED_IMAGE_NUMBER } from "@/constants/constants";

const STREETVIEW_MIN_ZOOM = 0.8140927000158323
const STREETVIEW_MAX_ZOOM = 3

const defaultPov = {heading: 0, pitch: 0};

const TwoDimensionalMap = () => {
    const {setError} = useContext(ErrorContext);
    const map = useMap();
    
    const placesLib = useMapsLibrary('places');

    const locationInit = useLocationInit(map, placesLib);
    const [loadingEnabled, setLoadingEnabled] = useState(false);

    const [visible, setVisible] = useState(false);
    const [is2D, setIs2D] = useState(true);

    const [selectedMarker, setSelectedMarker] = useState(-1);

    const [isSmall, setIsSmall] = useState(true);
    const [queryText, setQueryText] = useState(smallMapQuery);
    

    const [canPin, setCanPin] = useState(false);
    const [toPin, setToPin] = useState([]);
    const [pinned, setPinned] = useState([]);
    const [panelObject, setPanelObject] = useState({});
    const [artwork, setArtwork] = useState({});

    const [toQuery, setToQuery] = useState(true);
    const [isEnd, setIsEnd] = useState(false);
    const [isLoading, setIsLoading] = useState(false);;

    const artworks = useArtworks(
        map, placesLib, panelObject, toQuery, setToQuery, 
        setIsLoading, setIsEnd, setError, 
        {
            "PAGE_SIZE": THREED_IMAGE_NUMBER, 
            "limitSize": true, 
            "size": THREED_IMAGE_NUMBER,
            "byDate": false,
        }
    );
    
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
        // Load target
        const svc = new placesLib.PlacesService(map);
        const bounds = map.getBounds();
        setCanPin(false)
        setToPin([]);
        let maxResults = MAP_OPTIONS.MAX_LABELS;
        console.log("Searching for places");
        svc.nearbySearch({
            'bounds': bounds,
            ...queryText
        }, (res, status, pagination) => {
            if (maxResults >= 0 && status == 'OK') {
                queryToPlaces(res, status, pagination);
                maxResults -= res.length;
            } else {
                maxResults = MAP_OPTIONS.MAX_LABELS;
                setCanPin(true);
            }
        });
        setLoadingEnabled(false);
    }

    const markers = useMemo(() => {
        if (!pinned) return [];
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
                    className = "pointer-events-auto"
                    position={place.geometry.location} 
                    key={getKey(place.formatted_address, index)}
                    onClick={() => {
                        if (!map) return;
                        const streetView = map.getStreetView();
                        streetView.setPosition(place.geometry.location);
                        setPanelObject(place);
                        setSelectedMarker(index);
                        setVisible(true);
                    }}
                >
                    <Pin
                        background={selectedMarker == index ? 'red' : 'blue'}
                        borderColor={'#fff'}
                        glyphColor={'#fff'}
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
        if (!is2D && isSmall) {
            streetView.setVisible(true);  
            setLoadingEnabled(false);     
        } else {
            streetView.setVisible(false);
        }
    }, [is2D]);


    useEffect(() => {
        if (!map) return;
        // Set Map Listeners
        map.addListener('zoom_changed', () => {
            const zoom = map.getZoom();
            if (!loadingEnabled) {
                setLoadingEnabled(true);
            }
            if (zoom > 13) {
                setIsSmall(prev => true);
            } else {
                setIsSmall(prev =>false);
            }
        });
        map.addListener('center_changed', () => {
            setVisible(false);
            setLoadingEnabled(true);
        });

        // Set StreetView Listeners
        const streetView = map.getStreetView();
        streetView.setOptions(STREETVIEW_OPTIONS);
        streetView.setZoom(0);
        streetView.addListener("status_changed", () => {
            const streetViewAvailable = (streetView.getStatus() == "OK");
            if (!streetViewAvailable) {
                setError("3D_VIEW_NOT_AVAILABLE");
                setIs2D(true);
            }
        })
        streetView.addListener("pov_changed", () => {
            if(streetView.getVisible()) setVisible(false);
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
        streetView.addListener("position_changed", () => {
            setToQuery(true);
        });
    }, [map]);

    
    return (
        <div className="font-[family-name:var(--font-geist-sans)] w-full h-screen">
            {!is2D && 
                <PictureFrame3D 
                    artworks={artworks} 
                    setArtwork={setArtwork} 
                    setVisible={setVisible} 
                    pov={map?.streetView?.getPov() || defaultPov}
                />}
            <ZoomButtons 
                handleZoomIn={handleZoomIn}
                handleZoomOut={handleZoomOut}
            />
            {
                isSmall && (panelObject && Object.keys(panelObject).length > 0) && (
                    <SwitchButton 
                        place={panelObject}
                        text={is2D ? "Street View" : "2D Map"}
                        onClick={async () => {
                            setIs2D(prev => !prev);
                            setVisible(false);
                        }}
                    />
                )
            }
            {loadingEnabled && is2D &&
                (<div 
                    className="fixed top-8 right-8 z-50 px-2 py-1 bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white text-xs rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 border border-white/20" 
                >
                    <button 
                        className="flex items-center gap-2"
                        onClick={getMarkers}
                        disabled={!loadingEnabled}
                    >
                        search more in this area
                    </button>
                </div>)
            }
            <LeftPanel visible={visible} setVisible={setVisible} transparent={isSmall && !is2D}>
                {is2D ? 
                    <MapPanel place={panelObject} isSmall={isSmall} /> : 
                    <ArtworkDisplay 
                        artwork={artwork} 
                        setDetails={() => {
                            setToQuery(true);
                        }}
                        is3D={true}
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