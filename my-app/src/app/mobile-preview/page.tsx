'use client';

import { useState } from 'react';
import MobileSimulator from '@/components/mobile-simulator';

export default function MobilePreviewPage() {
  const [url, setUrl] = useState('http://localhost:3000');
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <label htmlFor="url" className="block text-sm font-medium text-zinc-400 mb-2">
            Preview URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="url"
              value={url}
              onChange={handleUrlChange}
              className="flex-1 bg-zinc-900 border border-zinc-700 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter URL to preview"
            />
            <button 
              onClick={() => setUrl(window.location.origin)}
              className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        
        <MobileSimulator url={url} />
      </div>
    </div>
  );
}
