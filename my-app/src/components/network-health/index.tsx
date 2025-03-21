'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';

interface NetworkData {
  id: string;
  name: string;
  status: boolean;
  responseTime: number;
  successRate: number;
  load: 'Low' | 'Medium' | 'High';
  lastUpdated: number;
}

interface NetworkHealthProps {
  networks: NetworkData[];
  onNetworkClick?: (networkId: string) => void;
}

export default function NetworkHealth({ networks, onNetworkClick }: NetworkHealthProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>(networks[0]?.id || 'mainnet');
  const [isHovered, setIsHovered] = useState(false);
  
  const getLoadColor = (load: string) => {
    switch(load) {
      case 'Low': return 'text-green-400';
      case 'Medium': return 'text-yellow-400';
      case 'High': return 'text-red-400';
      default: return 'text-zinc-400';
    }
  };
  
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 98) return 'text-green-400';
    if (rate >= 90) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getResponseTimeColor = (time: number) => {
    if (time < 300) return 'text-green-400';
    if (time < 800) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const formatTimestamp = (timestamp: number) => {
    const now = new Date().getTime();
    const diff = now - timestamp;
    
    const diffMin = Math.floor(diff / (1000 * 60));
    const diffHour = Math.floor(diff / (1000 * 60 * 60));
    
    if (diffHour > 0) {
      return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  };
  
  const selectedNetworkData = networks.find(n => n.id === selectedNetwork) || networks[0];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-white">Network Health</h2>
        <span className="text-xs text-zinc-400">
          Last updated: {formatTimestamp(selectedNetworkData.lastUpdated)}
        </span>
      </div>
      
      {/* Network Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {networks.map((network) => (
          <motion.button
            key={network.id}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors ${
              selectedNetwork === network.id 
                ? 'bg-zinc-800 text-white' 
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300'
            }`}
            onClick={() => {
              setSelectedNetwork(network.id);
              if (onNetworkClick) onNetworkClick(network.id);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className={`w-2 h-2 rounded-full ${network.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
            {network.name}
          </motion.button>
        ))}
      </div>
      
      {/* Network Health Card */}
      <motion.div 
        className="card p-4 bg-zinc-900 rounded-lg border border-zinc-800"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        key={selectedNetwork}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <h3 className="font-medium text-white">{selectedNetworkData.name} Status</h3>
          </div>
          <div className={`px-2 py-0.5 rounded-full text-xs ${selectedNetworkData.status ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
            {selectedNetworkData.status ? 'Online' : 'Issues Detected'}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* Response Time */}
          <div className="p-2 rounded bg-zinc-800/50">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">Response Time</span>
            </div>
            <div className={`text-lg font-semibold ${getResponseTimeColor(selectedNetworkData.responseTime)}`}>
              {selectedNetworkData.responseTime.toFixed(2)} ms
            </div>
          </div>
          
          {/* Success Rate */}
          <div className="p-2 rounded bg-zinc-800/50">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle className="w-3 h-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">Success Rate</span>
            </div>
            <div className={`text-lg font-semibold ${getSuccessRateColor(selectedNetworkData.successRate)}`}>
              {selectedNetworkData.successRate.toFixed(1)}%
            </div>
          </div>
          
          {/* Current Load */}
          <div className="p-2 rounded bg-zinc-800/50">
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 className="w-3 h-3 text-zinc-400" />
              <span className="text-xs text-zinc-400">Current Load</span>
            </div>
            <div className={`text-lg font-semibold ${getLoadColor(selectedNetworkData.load)}`}>
              {selectedNetworkData.load}
            </div>
          </div>
        </div>
        
        {/* Health Indicator */}
        <div className="mt-3 pt-3 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs text-zinc-400">Health Status</span>
            </div>
            <div className="w-2/3 bg-zinc-800 rounded-full h-2">
              <motion.div 
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500"
                style={{ 
                  width: `${selectedNetworkData.successRate}%`,
                  maxWidth: '100%'
                }}
                initial={{ width: 0 }}
                animate={{ width: `${selectedNetworkData.successRate}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
