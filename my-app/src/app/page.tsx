'use client';

import { useState, useEffect } from 'react';
import ScreenLayout from '@/layouts/screen-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { StatusIndicator } from '@/components/status-indicator'
import { APIKeyInput } from '@/components/api-key-input'
import { EndpointCard } from '@/components/endpoint-card'
import { DebugConsole } from '@/components/debug-console'
import { ApiAnalytics } from '@/components/api-analytics';
import { getApiKey, saveApiKey } from '@/services/api-key';
import { getApiStatus, getApiUsageStats, getRecentErrors, validateApiKey } from '@/services/api';
import { ErrorModal } from '@/components/error-modal';
import HeroSection from '@/components/hero-section';
import NetworkHealth from '@/components/network-health';

const mockEndpoints = [
  {
    name: 'Get NFT Metadata',
    method: 'GET' as const,
    path: '/v2/nft/{contract}/{tokenId}/metadata',
    description: 'Retrieve metadata for a specific NFT token',
    stats: {
      successRate: 99.8,
      avgResponseTime: 245,
      requestsPerMinute: 350,
      errorRate: 0.2,
    },
    isActive: true,
  },
  {
    name: 'Get Token Balances',
    method: 'POST' as const,
    path: '/v2/token/balances',
    description: 'Get token balances for multiple addresses',
    stats: {
      successRate: 95.5,
      avgResponseTime: 1200,
      requestsPerMinute: 180,
      errorRate: 4.5,
    },
    isActive: true,
  },
  {
    name: 'Submit Transaction',
    method: 'PUT' as const,
    path: '/v2/transaction/send',
    description: 'Submit a signed transaction to the network',
    stats: {
      successRate: 88.5,
      avgResponseTime: 850,
      requestsPerMinute: 75,
      errorRate: 11.5,
    },
    isActive: false,
  },
];

export default function Home() {
  const [isValidatingKey, setIsValidatingKey] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<{
    mainnet: boolean;
    sepolia: boolean;
    arbitrum: boolean;
    optimism: boolean;
    polygon: boolean;
    base: boolean;
    solana: boolean;
    lastUpdated: string;
  } | null>(null);
  const [apiUsage, setApiUsage] = useState<{
    monthlyQuota: number;
    usedQuota: number;
    apiCalls: number;
    avgLatency: number;
    uptime: number;
  } | null>(null);
  const [recentErrors, setRecentErrors] = useState<{
    type: 'error' | 'warning';
    message: string;
    endpoint: string;
    timestamp: number;
    details?: string;
  }[]>([]);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    // Get API Key from local storage
    const savedApiKey = getApiKey();
    
    // Only load dashboard data if API Key exists
    if (savedApiKey) {
      loadDashboardData(savedApiKey);
      
      // Set timer to refresh data every 30 seconds
      const intervalId = setInterval(() => {
        const currentApiKey = getApiKey(); // Get the latest API Key
        if (currentApiKey) {
          loadDashboardData(currentApiKey);
        }
      }, 30000);
      
      // Add error event listener
      const handleApiError = () => {
        // Reload error data
        const currentApiKey = getApiKey();
        if (currentApiKey) {
          getRecentErrors(currentApiKey).then(errors => {
            setRecentErrors(errors);
          }).catch(err => {
            console.error('Error refreshing error list:', err);
          });
        }
      };
      
      // Listen for API Key change events
      const handleApiKeyChanged = (event: CustomEvent) => {
        const { apiKey } = event.detail;
        if (apiKey) {
          loadDashboardData(apiKey);
        }
      };
      
      window.addEventListener('api-error-occurred', handleApiError);
      window.addEventListener('api-key-changed', handleApiKeyChanged as EventListener);
      
      // Cleanup function
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('api-error-occurred', handleApiError);
        window.removeEventListener('api-key-changed', handleApiKeyChanged as EventListener);
      };
    } else {
      // When no API Key exists, only listen for API Key change events
      const handleApiKeyChanged = (event: CustomEvent) => {
        const { apiKey } = event.detail;
        if (apiKey) {
          loadDashboardData(apiKey);
        }
      };
      
      window.addEventListener('api-key-changed', handleApiKeyChanged as EventListener);
      
      // Cleanup function
      return () => {
        window.removeEventListener('api-key-changed', handleApiKeyChanged as EventListener);
      };
    }
  }, []);

  const loadDashboardData = async (key: string) => {
    try {
      // Check if API Key exists
      if (!key) {
        console.log('No API key provided, skipping data loading');
        return;
      }
      
      // Use Promise.allSettled instead of Promise.all so one request failure doesn't affect others
      const results = await Promise.allSettled([
        getApiStatus(),
        getApiUsageStats(key),
        getRecentErrors(key)
      ]);
      
      // Process each request result
      if (results[0].status === 'fulfilled') {
        setApiStatus(results[0].value);
      } else {
        console.error('Error loading API status:', results[0].reason);
        setApiStatus({
          mainnet: false,
          sepolia: false,
          arbitrum: false,
          optimism: false,
          polygon: false,
          base: false,
          solana: false,
          lastUpdated: new Date().toISOString()
        });
      }
      
      if (results[1].status === 'fulfilled') {
        setApiUsage(results[1].value);
      } else {
        console.error('Error loading API usage stats:', results[1].reason);
        setApiUsage({
          monthlyQuota: 0,
          usedQuota: 0,
          apiCalls: 0,
          avgLatency: 0,
          uptime: 0,
        });
      }
      
      if (results[2].status === 'fulfilled') {
        setRecentErrors(results[2].value);
      } else {
        console.error('Error loading recent errors:', results[2].reason);
        // Keep existing error list, don't update
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values
      setApiStatus({
        mainnet: false,
        sepolia: false,
        arbitrum: false,
        optimism: false,
        polygon: false,
        base: false,
        solana: false,
        lastUpdated: new Date().toISOString()
      });
      setApiUsage({
        monthlyQuota: 0,
        usedQuota: 0,
        apiCalls: 0,
        avgLatency: 0,
        uptime: 0,
      });
    }
  };

  const handleTestApiKey = async (apiKey: string) => {
    setIsValidatingKey(true);
    try {
      const isValid = await validateApiKey(apiKey);
      return isValid;
    } catch (error) {
      console.error('Error validating API key:', error);
      return false;
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleSaveApiKey = (apiKey: string) => {
    saveApiKey(apiKey);
    loadDashboardData(apiKey);
  };

  // Format number with commas
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Format timestamp to readable date/time
  function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      return diffDay === 1 ? 'Yesterday' : `${diffDay} days ago`;
    } else if (diffHour > 0) {
      return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMin > 0) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  }

  // Calculate usage percentage
  const calculateUsagePercentage = (): number => {
    if (!apiUsage) return 0;
    return Math.round((apiUsage.usedQuota / apiUsage.monthlyQuota) * 100);
  };

  // Simulate network health data
  const networkHealthData = [
    {
      id: 'mainnet',
      name: 'Mainnet',
      status: true,
      responseTime: 245.32,
      successRate: 99.8,
      load: 'Medium' as const,
      lastUpdated: new Date().getTime() - 5 * 60 * 1000 // 5 minutes ago
    },
    {
      id: 'sepolia',
      name: 'Sepolia',
      status: true,
      responseTime: 189.75,
      successRate: 99.9,
      load: 'Low' as const,
      lastUpdated: new Date().getTime() - 3 * 60 * 1000 // 3 minutes ago
    },
    {
      id: 'arbitrum',
      name: 'Arbitrum',
      status: true,
      responseTime: 320.18,
      successRate: 98.5,
      load: 'Medium' as const,
      lastUpdated: new Date().getTime() - 7 * 60 * 1000 // 7 minutes ago
    },
    {
      id: 'optimism',
      name: 'Optimism',
      status: false,
      responseTime: 950.64,
      successRate: 85.2,
      load: 'High' as const,
      lastUpdated: new Date().getTime() - 2 * 60 * 1000 // 2 minutes ago
    },
    {
      id: 'polygon',
      name: 'Polygon',
      status: true,
      responseTime: 275.41,
      successRate: 97.6,
      load: 'Medium' as const,
      lastUpdated: new Date().getTime() - 10 * 60 * 1000 // 10 minutes ago
    },
    {
      id: 'base',
      name: 'Base',
      status: true,
      responseTime: 210.89,
      successRate: 99.2,
      load: 'Low' as const,
      lastUpdated: new Date().getTime() - 8 * 60 * 1000 // 8 minutes ago
    },
    {
      id: 'solana',
      name: 'Solana',
      status: true,
      responseTime: 156.23,
      successRate: 99.5,
      load: 'Low' as const,
      lastUpdated: new Date().getTime() - 6 * 60 * 1000 // 6 minutes ago
    }
  ];

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <HeroSection 
        title="Alchemy API Explorer" 
        subtitle="Powerful tools for blockchain developers"
      />
      
      <div id="main-content" className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="flex flex-col gap-8">
          {/* First Row: Dashboard and Debug Console */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Dashboard Panel */}
            <div className="w-full lg:w-1/2 order-1">
              <div className="device-frame w-full">
                <div className="h-full overflow-auto">
                  {/* Header */}
                  <div className="gradient-bg p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h1 className="text-xl font-bold text-white">Alchemy Dashboard</h1>
                        <p className="text-sm text-zinc-400">Welcome back, Developer</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                        <span className="text-white font-bold">A</span>
                      </div>
                    </div>

                    {!getApiKey() && (
                      <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800 rounded-md">
                        <div className="flex items-start gap-2">
                          <div className="text-blue-400 text-lg">ℹ️</div>
                          <div>
                            <p className="text-sm text-zinc-300">Please enter your Alchemy API Key in the Debug Console to load dashboard data.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Network Health */}
                    <NetworkHealth networks={networkHealthData} />
                    
                    {/* Recent Errors */}
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-semibold text-white">Recent Errors</h2>
                        <button 
                          onClick={() => setIsErrorModalOpen(true)}
                          className="text-xs text-blue-400 hover:text-blue-300"
                        >
                          View All
                        </button>
                      </div>
                      
                      {recentErrors.length > 0 ? (
                        <div className="space-y-3">
                          {recentErrors.slice(0, 2).map((error, index) => (
                            <div key={index} className="card p-3">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5"></div>
                                <div className="flex-1">
                                  <p className="text-sm text-zinc-300 mb-1">{error.message}</p>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-zinc-500">{error.endpoint}</span>
                                    <span className="text-xs text-zinc-500">{formatTimestamp(error.timestamp)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="card p-4 text-center">
                          <p className="text-sm text-zinc-500">No errors in the last 24 hours</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Debug Console */}
            <div className="w-full lg:w-1/2 order-2">
              <DebugConsole />
            </div>
          </div>

          {/* Second Row: API Analytics */}
          <div className="w-full order-3">
            <ApiAnalytics />
          </div>
        </div>
      </div>
      
      {/* Error Modal */}
      <ErrorModal 
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        errors={recentErrors}
      />
    </main>
  );
}
