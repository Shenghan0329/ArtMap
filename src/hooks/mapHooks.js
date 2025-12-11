import { useEffect, useState, useContext } from "react";

import { ErrorContext } from "@/app/page";

import MAP_OPTIONS from "@/constants/mapOptions";

export function useLocationInit(map, placesLib) {
    const {setError} = useContext(ErrorContext);
    const [locationInit, setLocationInit] = useState(false);

    useEffect(() => {
        if (!placesLib || !map) return;
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
                    const defaultLocation = MAP_OPTIONS.defaultCenter;
                    map.setCenter(defaultLocation);
                    setError(err.message || "Unable to retrieve your location. Please enable location access.");
                    setLocationInit(true);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser. Please enable location access.");
            setLocationInit(true);
        }
        
    }, [map, placesLib]);
    return locationInit;
}