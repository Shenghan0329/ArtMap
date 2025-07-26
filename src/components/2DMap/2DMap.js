"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Map, useMap } from '@vis.gl/react-google-maps';

import MAP_OPTIONS from '@/constants/mapOptions';

const GoogleMapSelector = ({children, ...props}) => {
    return (
        <Map 
            mapId = {"2DMap"}
            {...MAP_OPTIONS}
            {...props}
        >
            {children}
        </Map>
    )
}

export default GoogleMapSelector;