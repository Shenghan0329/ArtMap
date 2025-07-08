import { useEffect, useState, useContext } from "react";

export function useLocationInit(map, placesLib) {
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
            console.log("Geolocation is not supported by this browser.");
        }
        
    }, [map, placesLib]);
    return locationInit;
}