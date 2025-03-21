// API Service, used for communication with Alchemy API
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { getApiKey } from '@/services/api-key';
import { addRequestAnalytics } from '@/services/api-analytics';

// Alchemy API base URL
const ALCHEMY_BASE_URL = 'https://eth-mainnet.g.alchemy.com/v2';

// Define API response type
export interface ApiResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: T;
  timestamp: number;
}

// Define API error type
export interface ApiError {
  status?: number;
  message: string;
  details?: any;
  endpoint?: string;
}

// Store recent errors
let recentErrorsList: {
  type: 'error' | 'warning';
  message: string;
  endpoint: string;
  timestamp: number;
  details?: string;
  id?: string; // Add unique ID to prevent duplicates
}[] = [];

// Add error to recent error list
export function addErrorToRecentList(error: ApiError, endpoint: string): void {
  // Generate unique ID
  const errorId = `${endpoint}-${error.message}-${Date.now()}`;
  
  // Check if the same error already exists (prevent duplicates)
  const isDuplicate = recentErrorsList.some(item => 
    item.message === error.message && 
    (item.endpoint === endpoint || item.endpoint === error.endpoint) &&
    // If there's the same error within the last 5 seconds, consider it a duplicate
    (new Date().getTime() - new Date(item.timestamp).getTime() < 5000)
  );
  
  if (isDuplicate) {
    console.log('Duplicate error, not adding to list:', error.message);
    return;
  }
  
  // Use error.endpoint if it exists, otherwise use the provided endpoint
  const finalEndpoint = error.endpoint || endpoint;
  
  const newError = {
    type: error.status && error.status >= 500 ? 'error' as const : 'warning' as const,
    message: error.message || 'Unknown Error',
    endpoint: finalEndpoint,
    timestamp: Date.now(),
    details: error.details ? JSON.stringify(error.details) : undefined,
    id: errorId
  };
  
  // Add the new error to the beginning of the list and keep only the latest 5 records
  recentErrorsList = [newError, ...recentErrorsList].slice(0, 5);
  console.log('Added error to recent list:', newError);
  
  // Trigger event to notify the page to update the error list
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('api-error-occurred'));
  }
}

// Handle API response
export function handleApiResponse<T = any>(response: Response, data: any): ApiResponse<T> {
  // Check if it's a JSON-RPC response
  if (data && typeof data === 'object' && 'jsonrpc' in data) {
    console.log('Handling JSON-RPC response:', data);
    
    // Check if there's an error
    if ('error' in data) {
      throw new Error(
        data.error.message || 'JSON-RPC error'
      );
    }
    
    // Handle the case where result might be null
    const result = 'result' in data ? data.result : null;
    
    // Return the result
    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: result as T,
      timestamp: Date.now(),
    };
  }
  
  // Return regular response
  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    data: data as T,
    timestamp: Date.now(),
  };
}

// Define supported API endpoints
export enum ApiEndpoint {
  GET_NFTS = 'getNFTs',
  GET_ASSET_TRANSFERS = 'getAssetTransfers',
  GET_TOKEN_BALANCES = 'getTokenBalances',
  GET_TOKEN_METADATA = 'getTokenMetadata',
  GET_TRANSACTION_RECEIPTS = 'getTransactionReceipts',
  GET_TRANSACTION_RECEIPT = 'getTransactionReceipt',
}

// Define API request options
export interface ApiRequestOptions {
  endpoint: ApiEndpoint;
  apiKey: string;
  params: any;
}

/**
 * Send API request to Alchemy
 * @param options API request options
 * @returns Promise resolving to API response
 */
export async function sendApiRequest<T = any>(options: ApiRequestOptions): Promise<ApiResponse<T>> {
  const { endpoint, apiKey, params } = options;
  
  // Get endpoint configuration
  const endpointConfig = API_ENDPOINTS.find(ep => ep.value === endpoint);
  
  if (!endpointConfig) {
    throw new Error(`Unknown endpoint: ${endpoint}`);
  }
  
  try {
    let url: string;
    let requestOptions: RequestInit | undefined;
    
    if (endpointConfig.useJsonRpc) {
      // Use JSON-RPC format
      url = `${ALCHEMY_BASE_URL}/${apiKey}`;
      
      // Handle JSON-RPC request
      if (params && typeof params === 'object' && params.jsonrpc && params.method && params.params) {
        // If it's already a complete JSON-RPC request format, use it directly
        console.log('Using complete JSON-RPC request:', params);
        requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(params),
        };
      } else {
        // Otherwise, construct JSON-RPC request
        let jsonRpcMethod = '';
        let jsonRpcParams = params;
        
        if (endpoint === ApiEndpoint.GET_TRANSACTION_RECEIPT) {
          jsonRpcMethod = 'eth_getTransactionReceipt';
          // Ensure parameters are in array format
          if (!Array.isArray(jsonRpcParams)) {
            // If parameters are an object, check if it has a hash property
            if (typeof jsonRpcParams === 'object' && jsonRpcParams !== null && 'hash' in jsonRpcParams) {
              jsonRpcParams = [jsonRpcParams.hash];
            } 
            // If parameters are a string, wrap it directly as an array
            else if (typeof jsonRpcParams === 'string') {
              jsonRpcParams = [jsonRpcParams];
            }
            // If there are no parameters or the format is incorrect, use an empty array
            else if (!jsonRpcParams) {
              jsonRpcParams = [];
            }
          }
        } else {
          jsonRpcMethod = `alchemy_${endpoint}`;
        }
        
        console.log('JSON-RPC method:', jsonRpcMethod);
        console.log('JSON-RPC params:', jsonRpcParams);
        
        // If a complete JSON-RPC request body is passed directly, use it
        if (typeof jsonRpcParams === 'object' && 
            jsonRpcParams !== null && 
            'jsonrpc' in jsonRpcParams && 
            'method' in jsonRpcParams && 
            'params' in jsonRpcParams) {
          requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(jsonRpcParams),
          };
        } else {
          // Otherwise, construct a standard JSON-RPC request
          requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: Date.now(),
              method: jsonRpcMethod,
              params: jsonRpcParams,
            }),
          };
        }
      }
    } else {
      // Use REST API format
      // Construct query parameters
      const queryParams = new URLSearchParams();
      
      // Handle parameters, flatten objects into query parameters
      const flattenParams = (obj: any, prefix = '') => {
        for (const [key, value] of Object.entries(obj)) {
          const paramKey = prefix ? `${prefix}.${key}` : key;
          
          if (value === null || value === undefined) {
            continue;
          } else if (Array.isArray(value)) {
            // Handle arrays
            if (value.length === 0) continue;
            
            // Check if it's a simple array
            const isSimpleArray = value.every(item => 
              typeof item === 'string' || 
              typeof item === 'number' || 
              typeof item === 'boolean'
            );
            
            if (isSimpleArray) {
              // Simple arrays as multiple parameters with the same name
              value.forEach(item => {
                queryParams.append(paramKey, String(item));
              });
            } else {
              // Complex arrays as JSON strings
              queryParams.append(paramKey, JSON.stringify(value));
            }
          } else if (typeof value === 'object') {
            // Recursively handle nested objects
            flattenParams(value, paramKey);
          } else {
            // Basic types directly added
            queryParams.append(paramKey, String(value));
          }
        }
      };
      
      // Flatten parameters
      flattenParams(params);
      
      // Construct URL
      const queryString = queryParams.toString();
      url = `${ALCHEMY_BASE_URL}/${apiKey}${endpointConfig.path}${queryString ? `?${queryString}` : ''}`;
      
      console.log('Request URL:', url);
      
      requestOptions = {
        method: endpointConfig.method,
        headers: {
          'Accept': 'application/json',
        },
      };
    }
    
    // Record start time for performance tracking
    const startTime = performance.now();
    
    // Send the request
    const response = await fetch(url, requestOptions);
    
    // Calculate response time
    const responseTime = performance.now() - startTime;
    
    // Check response status
    if (!response.ok && response.status !== 200) {
      throw new Error(
        `HTTP error: ${response.status} ${response.statusText}`
      );
    }
    
    // Parse response
    const contentType = response.headers.get('content-type');
    let data: any;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Handle response
    const apiResponse = handleApiResponse<T>(response, data);
    
    // Add request analytics
    addRequestAnalytics({
      endpoint,
      method: requestOptions?.method || 'GET',
      url,
      status: response.status,
      responseTime,
      success: true,
      timestamp: Date.now(),
    });
    
    return apiResponse;
  } catch (error: any) {
    console.error('API request error:', error);
    // Handle error
    const apiError: ApiError = {
      message: error.message || 'An error occurred while making the request',
      details: error,
    };
    addErrorToRecentList(apiError, options.endpoint);
    
    // Add request analytics data
    addRequestAnalytics({
      endpoint: options.endpoint,
      method: 'POST', // Use the method from the endpoint configuration or default to POST
      responseTime: 0,
      status: error.status || 500,
      timestamp: Date.now(),
      success: false,
    });
    
    throw apiError;
  }
}

/**
 * Validate API key
 * @param apiKey API key to validate
 * @returns Promise resolving to a boolean indicating whether the key is valid
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    // Use a simple request to validate the API key
    const options: ApiRequestOptions = {
      endpoint: ApiEndpoint.GET_TOKEN_METADATA,
      apiKey,
      params: {
        contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH contract address
      },
    };
    
    const response = await sendApiRequest(options);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

/**
 * Get API usage statistics
 * @param apiKey API key
 * @returns Promise resolving to API usage statistics
 */
export async function getApiUsageStats(apiKey: string): Promise<{
  monthlyQuota: number;
  usedQuota: number;
  apiCalls: number;
  avgLatency: number;
  uptime: number;
}> {
  try {
    console.log('Fetching API usage stats with key:', apiKey);
    
    // Use Alchemy API to get usage statistics
    const response = await fetch(`https://dashboard.alchemy.com/api/stats?apiKey=${apiKey}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Alchemy-Token': apiKey
      }
    });

    console.log('API usage response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log('API usage data (raw):', JSON.stringify(data, null, 2));
    
    // Extract required data from API response
    const result = {
      monthlyQuota: parseInt(data.teams?.[0]?.computeUnitsLimit || '300000000'),
      usedQuota: parseInt(data.teams?.[0]?.computeUnitsUsed || '0'),
      apiCalls: parseInt(data.teams?.[0]?.totalRequests || '0'),
      avgLatency: parseFloat(data.performance?.averageLatency || '24'),
      uptime: parseFloat(data.performance?.uptime || '99.9'),
    };
    
    console.log('Processed API usage stats:', result);
    return result;
  } catch (error) {
    console.error('Error fetching API usage stats:', error);
    // Return empty data instead of mock data
    return {
      monthlyQuota: 0,
      usedQuota: 0,
      apiCalls: 0,
      avgLatency: 0,
      uptime: 0,
    };
  }
}

/**
 * Get recent API errors
 * @param apiKey API key
 * @returns Promise resolving to recent error list
 */
export async function getRecentErrors(apiKey: string): Promise<{
  type: 'error' | 'warning';
  message: string;
  endpoint: string;
  timestamp: number;
  details?: string;
}[]> {
  try {
    // First, check the locally stored error list
    if (recentErrorsList.length > 0) {
      return recentErrorsList;
    }
    
    // If there are no local errors, try to get them from Alchemy API
    try {
      const response = await fetch(`https://dashboard.alchemy.com/api/errors?apiKey=${apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Alchemy-Token': apiKey
        }
      });

      console.log('API errors response status:', response.status);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('API errors data (raw):', JSON.stringify(data, null, 2));
      
      // Extract required data from API response
      if (Array.isArray(data.errors)) {
        const apiErrors = data.errors.map((error: any) => ({
          type: error.severity === 'critical' ? 'error' as const : 'warning' as const,
          message: error.title || error.message || 'Unknown Error',
          endpoint: error.endpoint || error.path || 'Unknown Endpoint',
          timestamp: Date.now(),
          details: error.details || `${error.statusCode || ''} ${error.description || ''}`.trim(),
        }));
        
        // Update the locally stored error list, keeping only the latest 5 records
        recentErrorsList = [...apiErrors, ...recentErrorsList].slice(0, 5);
        return recentErrorsList;
      }
    } catch (fetchError) {
      console.error('Fetch error in getRecentErrors:', fetchError);
      // If the fetch fails, we don't throw an error, but continue using local data
    }
    
    // If there's no error data, return the local error list, or an empty array if it's empty
    return recentErrorsList.length > 0 ? recentErrorsList : [];
  } catch (error) {
    console.error('Error in getRecentErrors:', error);
    // If there's an error, return the local error list, or an empty array if it's empty
    return recentErrorsList.length > 0 ? recentErrorsList : [];
  }
}

/**
 * Get API status
 * @returns Promise resolving to API status
 */
export async function getApiStatus(): Promise<{
  mainnet: boolean;
  sepolia: boolean;
  arbitrum: boolean;
  optimism: boolean;
  polygon: boolean;
  base: boolean;
  solana: boolean;
  lastUpdated: string;
}> {
  try {
    // Use Alchemy's health endpoint to check the status of each network
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('API key not found');
    }

    // Define the networks we want to check and their corresponding base URLs
    const networks = [
      { name: 'mainnet', url: `https://eth-mainnet.g.alchemy.com/v2/${apiKey}` },
      { name: 'sepolia', url: `https://eth-sepolia.g.alchemy.com/v2/${apiKey}` },
      { name: 'arbitrum', url: `https://arb-mainnet.g.alchemy.com/v2/${apiKey}` },
      { name: 'optimism', url: `https://opt-mainnet.g.alchemy.com/v2/${apiKey}` },
      { name: 'polygon', url: `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}` },
      { name: 'base', url: `https://base-mainnet.g.alchemy.com/v2/${apiKey}` },
      { name: 'solana', url: `https://solana-mainnet.g.alchemy.com/v2/${apiKey}` }
    ];

    // Check the status of all networks in parallel
    const results = await Promise.allSettled(
      networks.map(async (network) => {
        try {
          // Send a simple JSON-RPC request to check the network status
          const response = await fetch(network.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: Date.now(),
              method: network.name === 'solana' ? 'getBlockHeight' : 'eth_blockNumber',
              params: [],
            }),
          });

          // If the request is successful, consider the network healthy
          return { name: network.name, status: response.ok };
        } catch (error) {
          // If the request fails, consider the network unhealthy
          console.error(`Error checking ${network.name} status:`, error);
          return { name: network.name, status: false };
        }
      })
    );

    // Process the results
    const statusMap: Record<string, boolean> = {};
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        statusMap[result.value.name] = result.value.status;
      } else {
        statusMap[networks[index].name] = false;
      }
    });

    return {
      mainnet: statusMap.mainnet || false,
      sepolia: statusMap.sepolia || false,
      arbitrum: statusMap.arbitrum || false,
      optimism: statusMap.optimism || false,
      polygon: statusMap.polygon || false,
      base: statusMap.base || false,
      solana: statusMap.solana || false,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error getting API status:', error);
    // If there's an error, return all networks as unhealthy
    return {
      mainnet: false,
      sepolia: false,
      arbitrum: false,
      optimism: false,
      polygon: false,
      base: false,
      solana: false,
      lastUpdated: new Date().toISOString(),
    };
  }
}
