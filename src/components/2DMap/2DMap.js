"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';

import MAP_OPTIONS from '@/constants/mapOptions';

const GoogleMapSelector = ({children}) => {
    const map = useMap();
    const defaultMapOptions = {
        disableDefaultUI: true,
        streetViewControl: false,
    };

    return (
        <Map
            defaultZoom={MAP_OPTIONS.ZOOM_LEVEL}
            defaultCenter={ { lat: -33.860664, lng: 151.208138 } }
            mapId = {"2DMap"}
            {...defaultMapOptions}
        >
            {children}
        </Map>
    )
}

export default GoogleMapSelector;