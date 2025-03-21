'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MobileSimulatorProps {
  url?: string;
  width?: number;
  height?: number;
}

export default function MobileSimulator({ 
  url = 'http://localhost:3000', 
  width = 375, 
  height = 667 
}: MobileSimulatorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRotated, setIsRotated] = useState(false);
  const [zoom, setZoom] = useState(1);
  
  // Calculate dimensions based on rotation and zoom
  const deviceWidth = isRotated ? height : width;
  const deviceHeight = isRotated ? width : height;
  const scaledWidth = deviceWidth * zoom;
  const scaledHeight = deviceHeight * zoom;
  
  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
  };
  
  // Toggle device rotation
  const toggleRotation = () => {
    setIsRotated(!isRotated);
  };
  
  // Zoom controls
  const zoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 1.5));
  };
  
  const zoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.5));
  };
  
  const resetZoom = () => {
    setZoom(1);
  };

  return (
    <div className="flex flex-col items-center p-8 bg-zinc-900 min-h-screen">
      <div className="flex justify-between items-center w-full max-w-4xl mb-6">
        <h1 className="text-2xl font-bold text-white">Mobile Simulator</h1>
        <div className="flex gap-3">
          <button 
            onClick={toggleRotation}
            className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors text-sm"
          >
            {isRotated ? 'Portrait' : 'Landscape'}
          </button>
          <button 
            onClick={zoomOut}
            className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors text-sm"
            disabled={zoom <= 0.5}
          >
            -
          </button>
          <button 
            onClick={resetZoom}
            className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors text-sm"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button 
            onClick={zoomIn}
            className="px-3 py-1.5 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors text-sm"
            disabled={zoom >= 1.5}
          >
            +
          </button>
        </div>
      </div>
      
      <div className="relative flex items-center justify-center">
        <motion.div 
          className="relative bg-black rounded-[3rem] p-4 shadow-2xl transition-all duration-300"
          style={{ 
            width: scaledWidth + 40, 
            height: scaledHeight + 80,
          }}
          animate={{ 
            width: scaledWidth + 40, 
            height: scaledHeight + 80,
            rotate: isRotated ? 90 : 0
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Phone frame details */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-7 bg-black rounded-b-2xl z-10 flex justify-center items-center">
            <div className="w-16 h-1.5 bg-zinc-800 rounded-full"></div>
          </div>
          
          {/* Power button */}
          <div className="absolute top-20 right-0 transform translate-x-1/2 w-1.5 h-10 bg-zinc-700 rounded-r-md"></div>
          
          {/* Volume buttons */}
          <div className="absolute top-24 left-0 transform -translate-x-1/2 w-1.5 h-8 bg-zinc-700 rounded-l-md"></div>
          <div className="absolute top-36 left-0 transform -translate-x-1/2 w-1.5 h-8 bg-zinc-700 rounded-l-md"></div>
          
          {/* Screen */}
          <div className="relative w-full h-full bg-white overflow-hidden rounded-2xl">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}
            <iframe 
              src={url} 
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              title="Mobile Preview"
            />
          </div>
          
          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-1/3 h-1 bg-zinc-800 rounded-full"></div>
        </motion.div>
      </div>
      
      <div className="mt-8 text-center text-zinc-400 text-sm">
        <p>Simulating mobile device at {deviceWidth}x{deviceHeight}</p>
        <p className="mt-2">URL: {url}</p>
      </div>
    </div>
  );
}
