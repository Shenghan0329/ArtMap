"use client"
import { useState, useContext, createContext } from 'react';
import {APIProvider} from '@vis.gl/react-google-maps';
import TwoDimensionalMap from "@/screens/2D/2D";
import ErrorPopup from '@/components/ErrorPopup/ErrorPopup';
import { PictureFrame3D } from '@/components/3D/PictureFrame3D';
import { GlobalErrorBoundary } from '@/components/ErrorBoundary';

export const ErrorContext = createContext();

export default function Home() {
  const [error, setError] = useState(null);
  return (
    <ErrorContext.Provider value={{ error, setError }}>
      <GlobalErrorBoundary>
      <APIProvider apiKey={process.env.GOOGLE_MAP_API_KEY} onLoad={() => console.log('Loaded Google Map API')}>
        <ErrorPopup />
         {/* <PictureFrame3D images={[
              { position: [0, 0, 0], rotation: [0, 0, 0], url: '/sample-img.jpg',}
          ]}/> */}
        <TwoDimensionalMap />
      </APIProvider>
      </GlobalErrorBoundary>
    </ErrorContext.Provider>
  );
}
