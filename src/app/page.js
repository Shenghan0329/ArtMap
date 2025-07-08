"use client"
import { useState, useContext, createContext } from 'react';
import {APIProvider} from '@vis.gl/react-google-maps';
import TwoDimensionalMap from "@/screens/2D/2D";
import ErrorPopup from '@/components/ErrorPopup/ErrorPopup';

export const ErrorContext = createContext();

export default function Home() {
  const [error, setError] = useState(null);
  return (
    <ErrorContext.Provider value={{ error, setError }}>
      <APIProvider apiKey={process.env.GOOGLE_MAP_API_KEY} onLoad={() => console.log('Loaded Google Map API')}>
        <ErrorPopup />
        <TwoDimensionalMap />
      </APIProvider>
    </ErrorContext.Provider>
  );
}
