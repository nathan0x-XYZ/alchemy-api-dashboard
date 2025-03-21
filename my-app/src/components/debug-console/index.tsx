'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import { API_ENDPOINTS } from '@/config/api-endpoints';
import { sendApiRequest, ApiResponse, ApiError, ApiEndpoint, addErrorToRecentList } from '@/services/api';
import { saveApiKey, getApiKey } from '@/services/api-key';

export function DebugConsole() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint>(API_ENDPOINTS[0].value);
  const [params, setParams] = useState<string>(API_ENDPOINTS[0].defaultParams);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFormatted, setIsFormatted] = useState<boolean>(true);
  const [bodyCopied, setBodyCopied] = useState<boolean>(false);
  const [headersCopied, setHeadersCopied] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [expandedResponse, setExpandedResponse] = useState<boolean>(false);
  const [expandedHeaders, setExpandedHeaders] = useState<boolean>(false);
  const version = "AlchemyDC-2025.03.2-Stable";

  // No longer automatically load saved API key
  useEffect(() => {
    // Other initialization operations (if needed)
  }, []);

  const handleEndpointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const endpoint = API_ENDPOINTS.find(ep => ep.value === e.target.value as ApiEndpoint);
    if (endpoint) {
      setSelectedEndpoint(endpoint.value);
      setParams(endpoint.defaultParams);
    }
  };

  const handleParamsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setParams(e.target.value);
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    // Save API key to local storage
    saveApiKey(newApiKey);
    
    // Trigger a custom event to notify other components that the API key has changed
    const event = new CustomEvent('api-key-changed', { detail: { apiKey: newApiKey } });
    window.dispatchEvent(event);
  };

  // Format JSON for better readability
  const formatJson = (jsonString: string): string => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  };

  // Attempt to fix malformed JSON
  const tryFixJson = (jsonString: string): string => {
    // Remove comments
    let fixed = jsonString.replace(/\/\/.*$/gm, '');
    
    // Remove trailing commas
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    
    // Ensure property names have quotes
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');
    
    return fixed;
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setBodyCopied(false);
    setHeadersCopied(false);

    try {
      // Parse parameters
      let parsedParams;
      try {
        // Try to parse JSON
        parsedParams = JSON.parse(params);
      } catch (err) {
        // If parsing fails, try to fix JSON
        console.log('Invalid JSON, trying to fix...');
        const fixedJson = tryFixJson(params);
        try {
          parsedParams = JSON.parse(fixedJson);
          console.log('Fixed JSON:', fixedJson);
        } catch (fixErr) {
          throw new Error(`Invalid JSON in parameters: ${(err as Error).message}`);
        }
      }

      if (!apiKey) {
        throw new Error('API key is required');
      }

      // Send API request
      console.log('Sending request with params:', parsedParams);
      const response = await sendApiRequest({
        endpoint: selectedEndpoint,
        apiKey,
        params: parsedParams,
      });

      console.log('Response received:', response);
      setResponse(response);
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while making the request';
      setError(errorMessage);
      console.error('Request error:', err);
      
      // Add error to recent errors list
      const errorDetails = err.details || err;
      addErrorToRecentList(
        { 
          message: errorMessage, 
          details: errorDetails,
          status: err.status || 400,
          endpoint: selectedEndpoint // Add endpoint information
        }, 
        `/${selectedEndpoint}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatToggle = () => {
    setIsFormatted(!isFormatted);
  };

  const handleCopyBody = () => {
    if (response) {
      let textToCopy;
      if (response.data === null) {
        textToCopy = "null (No transaction receipt found for this hash)";
      } else {
        textToCopy = isFormatted
          ? JSON.stringify(response.data, null, 2)
          : JSON.stringify(response.data);
      }
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        setBodyCopied(true);
        setTimeout(() => setBodyCopied(false), 2000);
      });
    }
  };

  const handleCopyHeaders = () => {
    if (response) {
      const textToCopy = isFormatted
        ? JSON.stringify(response.headers, null, 2)
        : JSON.stringify(response.headers);
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        setHeadersCopied(true);
        setTimeout(() => setHeadersCopied(false), 2000);
      });
    }
  };

  // Format parameters button handler
  const handleFormatParams = () => {
    try {
      const formatted = formatJson(params);
      setParams(formatted);
    } catch (err) {
      // If formatting fails, keep original value
    }
  };

  // Get response preview
  const getResponsePreview = (data: any) => {
    if (data === null) {
      return "null (No transaction receipt found for this hash)";
    }
    
    const json = JSON.stringify(data, null, 2);
    if (json.length <= 300) return json;
    
    // Display first 150 characters and last 100 characters
    return `${json.substring(0, 150)}
...
${json.substring(json.length - 100)}`;
  };

  // Get response headers preview
  const getHeadersPreview = (headers: Record<string, string>): string => {
    if (!headers || Object.keys(headers).length === 0) return '';
    
    const stringified = JSON.stringify(headers, null, 2);
    
    // If response headers are short, return directly
    if (stringified.length < 200) return stringified;
    
    // Otherwise return first 150 characters of preview
    return stringified.substring(0, 150) + '...\n(Click "Show More" to view all headers)';
  };

  return (
    <div className="device-frame w-full h-full">
      <div className="h-full overflow-auto">
        <div className="gradient-bg p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-xl font-bold text-white">Debug Console</h1>
              <p className="text-sm text-zinc-400">Troubleshoot API Issues</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
              </svg>
            </div>
          </div>

          {/* Request Builder */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">Request Builder</h2>
            
            {/* API Endpoint */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-400 mb-1">API Endpoint</label>
              <select 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white"
                value={selectedEndpoint}
                onChange={handleEndpointChange}
              >
                {API_ENDPOINTS.map((endpoint) => (
                  <option key={endpoint.value} value={endpoint.value}>
                    {endpoint.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* API Key */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-400 mb-1">API Key</label>
              <div className="relative">
                <input 
                  type={showApiKey ? "text" : "password"} 
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white pr-10"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={handleApiKeyChange}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-300"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {/* Parameters */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-zinc-400">Parameters</label>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={handleFormatParams}
                >
                  <Code className="h-3 w-3 mr-1" />
                  Format
                </Button>
              </div>
              <textarea 
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md p-2 text-white font-mono text-sm h-32"
                value={params}
                onChange={handleParamsChange}
              />
            </div>
            
            {/* Send Button */}
            <div className="mt-4">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSendRequest}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {isLoading ? 'Sending...' : 'Send Request'}
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-6">
                <div className="bg-red-900/50 border border-red-800 rounded-md p-4">
                  <h3 className="text-lg font-medium text-red-300 mb-2">Error</h3>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Response */}
          {response && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-white mb-2">Response</h3>
              
              {/* Response Headers */}
              <div className="mb-4 bg-zinc-800 rounded-md overflow-hidden">
                <div className="flex justify-between items-center p-3 border-b border-zinc-700">
                  <h4 className="text-sm font-medium text-zinc-300">Headers</h4>
                  <div className="flex space-x-2">
                    <button 
                      className="text-zinc-400 hover:text-zinc-300"
                      onClick={() => setExpandedHeaders(!expandedHeaders)}
                    >
                      {expandedHeaders ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button 
                      className="text-zinc-400 hover:text-zinc-300"
                      onClick={handleCopyHeaders}
                    >
                      {headersCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <pre className="p-3 text-xs text-zinc-300 overflow-auto max-h-40">
                  {expandedHeaders 
                    ? JSON.stringify(response.headers, null, 2)
                    : getHeadersPreview(response.headers)
                  }
                </pre>
              </div>
              
              {/* Response Body */}
              <div className="bg-zinc-800 rounded-md overflow-hidden">
                <div className="flex justify-between items-center p-3 border-b border-zinc-700">
                  <h4 className="text-sm font-medium text-zinc-300">Body</h4>
                  <div className="flex space-x-2">
                    <button 
                      className="text-zinc-400 hover:text-zinc-300"
                      onClick={handleFormatToggle}
                    >
                      <Code className="w-4 h-4" />
                    </button>
                    <button 
                      className="text-zinc-400 hover:text-zinc-300"
                      onClick={() => setExpandedResponse(!expandedResponse)}
                    >
                      {expandedResponse ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button 
                      className="text-zinc-400 hover:text-zinc-300"
                      onClick={handleCopyBody}
                    >
                      {bodyCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <pre className={`p-3 text-xs text-zinc-300 overflow-auto ${expandedResponse ? 'max-h-[600px]' : 'max-h-60'}`}>
                  {isFormatted 
                    ? (expandedResponse 
                        ? (response.data === null 
                            ? "null (No transaction receipt found for this hash)" 
                            : JSON.stringify(response.data, null, 2))
                        : (response.data === null 
                            ? "null (No transaction receipt found for this hash)" 
                            : getResponsePreview(response.data)))
                    : (response.data === null 
                        ? "null (No transaction receipt found for this hash)" 
                        : JSON.stringify(response.data))
                  }
                </pre>
                {!expandedResponse && response.data && JSON.stringify(response.data).length > 300 && (
                  <div className="p-2 text-center border-t border-zinc-700">
                    <button 
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center w-full"
                      onClick={() => setExpandedResponse(true)}
                    >
                      <MoreHorizontal className="w-3 h-3 mr-1" />
                      Show Complete Response
                    </button>
                  </div>
                )}
              </div>
              
              {/* Response Status */}
              <div className="mt-2 flex justify-between text-xs text-zinc-500">
                <span>Status: {response.status} {response.statusText}</span>
                <span>Size: {JSON.stringify(response.data).length} bytes</span>
              </div>
            </div>
          )}
          
          {!response && !error && !isLoading && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-md p-4 text-center">
              <p className="text-zinc-400 text-sm">Send a request to see the response</p>
            </div>
          )}
          
          {isLoading && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-md p-4 text-center">
              <div className="animate-pulse flex space-x-4 justify-center">
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
              </div>
              <p className="text-zinc-400 text-sm mt-2">Loading response...</p>
            </div>
          )}
        </div>
      </div>
      <div className="text-xs text-zinc-500 text-right mt-2">
        {version}
      </div>
    </div>
  );
}
