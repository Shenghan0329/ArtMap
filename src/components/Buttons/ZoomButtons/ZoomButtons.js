'use client'

import { useState } from 'react';

const ZoomButtons = ({ 
  handleZoomIn,
  handleZoomOut,
  disableZoomIn = false,
  disableZoomOut = false,
  className = ''
}) => {
  
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      <button
        onClick={handleZoomIn}
        disabled={disableZoomIn}
        className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 font-semibold text-lg transition-colors"
      >
        +
      </button>
      <button
        onClick={handleZoomOut}
        disabled={disableZoomOut}
        className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 font-semibold text-lg transition-colors"
      >
        −
      </button>
    </div>
  );
};

export default ZoomButtons;