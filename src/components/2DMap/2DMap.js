"use client"
import React, { useState, useEffect, useCallback } from 'react';
import {Map} from '@vis.gl/react-google-maps';

const GoogleMapSelector = ({mapEvent, setMapEvent, mapOptions = {}, setMapOptions}) => {

    const defaultMapOptions = {
        disableDefaultUI: true,
    };

    const handleCameraChange = useCallback((ev) => {
        setMapOptions((mapOptions) => {
            return {...mapOptions, center: ev.detail.center, zoom: ev.detail.zoom}
        });
        setMapEvent(ev);
    });

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const currLocation = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setMapOptions((mapOptions) => {
                        return {...mapOptions, center: currLocation }
                    });
                },
                (err) => {
                    console.log(err);
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    }, []);

    return (
        <Map
            {...mapOptions}
            defaultZoom={13}
            defaultCenter={ { lat: -33.860664, lng: 151.208138 } }
            onCameraChanged={handleCameraChange}
            {...defaultMapOptions}
        >
        </Map>
    )
}

export default GoogleMapSelector;