"use client"
import React, { useState, useEffect, useRef } from 'react';

const GoogleMapSelector = ({map, setMap, selectedPlace, setSelectedPlace}) => {
  const mapRef = useRef(null);
  
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (window.google) {
      setIsLoaded(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAP_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    script.onerror = () => console.error('Failed to load Google Maps script');
    document.head.appendChild(script);

    return () => {
      // Cleanup script if component unmounts
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Initialize map when script is loaded
  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // New York City
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false, // We'll add custom zoom controls
        disableDefaultUI: true,
      });

      // Add click listener to select places
      googleMap.addListener('click', (event) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        // Use Geocoding API to get place details
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results[0]) {
            const place = {
              id: Date.now(),
              name: results[0].formatted_address,
              lat,
              lng,
            };
            setSelectedPlace(place);
          }
        });
      });

      setMap(googleMap);
    }
  }, [isLoaded, map]);

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center w-full h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Google Maps...</p>
          <p className="text-sm text-gray-500 mt-2">
            Note: You'll need a valid Google Maps API key for this to work
          </p>
        </div>
      </div>
    );
  }

  return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full h-full">

        <div className="flex flex-col lg:flex-row w-full h-full">
          {/* Map Container */}
          <div className="relative flex-1">
            <div ref={mapRef} className="w-full h-full" />
            
            {/* Map Instructions */}
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 text-sm text-gray-700 max-w-xs">
              <p className="font-semibold mb-1">How to use:</p>
              <ul className="text-xs space-y-1">
                <li>• Click anywhere on the map to select a place</li>
                <li>• Use zoom buttons or mouse wheel to zoom</li>
                <li>• Click markers to see place details</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
  );
};

export default GoogleMapSelector;