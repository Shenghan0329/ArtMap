import { useEffect, useState, useContext } from "react";

import { ErrorContext } from "@/app/page";

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
                    console.log(err);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser. Please enable location access.");
        }
        
    }, [map, placesLib]);
    return locationInit;
}