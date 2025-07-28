import { useState, useEffect } from "react";
import { smallMapDetailsQuery } from "@/constants/google_map_queries";

export function usePlace(place, map, placesLib, query = smallMapDetailsQuery) {
    const [detailedPlace, setDetailedPlace] = useState({});
        
    useEffect(() => {
        if (!placesLib || !map) return;
        if (!place?.place_id) return;
        const svc = new placesLib.PlacesService(map);
        svc.getDetails({
            placeId: place.place_id,
            ...query
        }, (place, status) => {
            if (status === 'OK') {
                setDetailedPlace(place);
            }
        });
    }, [place, map, placesLib]);

    return detailedPlace;
}