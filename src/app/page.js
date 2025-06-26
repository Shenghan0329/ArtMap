"use client"
import {APIProvider} from '@vis.gl/react-google-maps';

import TwoDimensionalMap from "@/screens/2D/2D";

export default function Home() {
  
  return (
    <APIProvider apiKey={process.env.GOOGLE_MAP_API_KEY} onLoad={() => console.log('Loaded Google Map API')}>
      <TwoDimensionalMap />
    </APIProvider>
  );
}
