'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Activity, Clock, CheckCircle, XCircle, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { getRequestAnalytics, getRequestPerformanceMetrics, RequestAnalytics } from '@/services/api-analytics';

// Color configuration
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Define types
interface DayData {
  name: string;
  value: number;
}

interface EndpointData {
  name: string;
  requests: number;
  avgTime: number;
  successRate: number;
}

interface MethodData {
  name: string;
  value: number;
}

interface RecentRequestData {
  id: number;
  endpoint: string;
  method: string;
  status: string;
  time: number;
  timestamp: number;
}

interface AnalyticsData {
  totalRequests: number;
  avgResponseTime: number;
  successRate: number;
  errorRate: number;
  requestsPerDay: DayData[];
  responseTimeHistory: DayData[];
}

export function ApiAnalytics() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalRequests: 0,
    avgResponseTime: 0,
    successRate: 0,
    errorRate: 0,
    requestsPerDay: [],
    responseTimeHistory: []
  });
  const [endpointData, setEndpointData] = useState<EndpointData[]>([]);
  const [methodData, setMethodData] = useState<MethodData[]>([]);
  const [recentRequestsData, setRecentRequestsData] = useState<RecentRequestData[]>([]);

  // Detect mobile screen
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Load real analytics data
  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        const analytics = await getRequestAnalytics();
        const metrics = await getRequestPerformanceMetrics();
        
        // Process overview data
        const requestsByDay = processRequestsByDay(analytics);
        const responseTimeByDay = processResponseTimeByDay(analytics);
        
        setAnalyticsData({
          totalRequests: analytics.length,
          avgResponseTime: metrics.avgResponseTime || 0,
          successRate: metrics.successRate || 0,
          errorRate: 100 - (metrics.successRate || 0),
          requestsPerDay: requestsByDay,
          responseTimeHistory: responseTimeByDay
        });
        
        // Process endpoint data
        const endpoints = processEndpointData(metrics.endpointStats || {});
        setEndpointData(endpoints);
        
        // Process method data
        const methods = processMethodData(metrics.methodStats || {});
        setMethodData(methods);
        
        // Recent requests
        setRecentRequestsData(analytics.slice(0, 5).map((item, index) => ({
          id: index + 1,
          endpoint: item.endpoint,
          method: item.method,
          status: item.success ? 'success' : 'error',
          time: item.responseTime,
          timestamp: item.timestamp
        })));
      } catch (error) {
        console.error('Failed to load analytics data:', error);
      }
    };
    
    loadAnalyticsData();
    
    // Set up event listener for analytics updates
    const handleAnalyticsUpdate = () => {
      loadAnalyticsData();
    };
    
    window.addEventListener('requestAnalyticsUpdated', handleAnalyticsUpdate);
    
    return () => {
      window.removeEventListener('requestAnalyticsUpdated', handleAnalyticsUpdate);
    };
  }, []);

  // Helper functions to process data
  const processRequestsByDay = (analytics: RequestAnalytics[]): DayData[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const requestsByDay = Array(7).fill(0).map((_, i) => ({ name: days[i], value: 0 }));
    
    analytics.forEach((item: RequestAnalytics) => {
      const date = new Date(item.timestamp);
      const dayIndex = date.getDay();
      requestsByDay[dayIndex].value += 1;
    });
    
    return requestsByDay;
  };
  
  const processResponseTimeByDay = (analytics: RequestAnalytics[]): DayData[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const timesByDay = Array(7).fill(0).map((_, i) => ({ name: days[i], count: 0, total: 0 }));
    
    analytics.forEach((item: RequestAnalytics) => {
      const date = new Date(item.timestamp);
      const dayIndex = date.getDay();
      timesByDay[dayIndex].count += 1;
      timesByDay[dayIndex].total += item.responseTime;
    });
    
    return timesByDay.map(day => ({
      name: day.name,
      value: day.count > 0 ? Math.round(day.total / day.count) : 0
    }));
  };
  
  const processEndpointData = (endpointStats: Record<string, any>): EndpointData[] => {
    return Object.entries(endpointStats).map(([name, data]) => ({
      name,
      requests: data.count,
      avgTime: Math.round(data.avgTime),
      successRate: Math.round(data.successRate * 10) / 10
    }));
  };
  
  const processMethodData = (methodStats: Record<string, any>): MethodData[] => {
    return Object.entries(methodStats).map(([name, data]) => ({
      name,
      value: data.count
    }));
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-zinc-900 rounded-lg overflow-hidden">
      <div className="p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-white mb-4">API Analytics</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex overflow-x-auto md:overflow-visible bg-zinc-800">
            <TabsTrigger 
              value="overview" 
              className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-zinc-700"
            >
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Overview</span>
              <span className="sm:hidden">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="endpoints" 
              className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-zinc-700"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Endpoint Analysis</span>
              <span className="sm:hidden">Endpoints</span>
            </TabsTrigger>
            <TabsTrigger 
              value="methods" 
              className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-zinc-700"
            >
              <PieChartIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Method Distribution</span>
              <span className="sm:hidden">Methods</span>
            </TabsTrigger>
            <TabsTrigger 
              value="recent" 
              className="text-xs md:text-sm whitespace-nowrap data-[state=active]:bg-zinc-700"
            >
              <Clock className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Recent Requests</span>
              <span className="sm:hidden">Recent</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Activity className="w-5 h-5 text-blue-400 mr-2" />
                  <h3 className="text-sm font-medium text-zinc-300">Total Requests</h3>
                </div>
                <p className="text-2xl font-bold text-white">{analyticsData.totalRequests}</p>
                <p className="text-xs text-zinc-500 mt-1">Last 7 days</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Clock className="w-5 h-5 text-green-400 mr-2" />
                  <h3 className="text-sm font-medium text-zinc-300">Average Response Time</h3>
                </div>
                <p className="text-2xl font-bold text-white">{analyticsData.avgResponseTime.toFixed(2)} ms</p>
                <p className="text-xs text-zinc-500 mt-1">Last 7 days</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                  <h3 className="text-sm font-medium text-zinc-300">Success Rate</h3>
                </div>
                <p className="text-2xl font-bold text-white">{analyticsData.successRate.toFixed(2)}%</p>
                <p className="text-xs text-zinc-500 mt-1">Last 7 days</p>
              </div>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-zinc-300 mb-4">Requests per Day</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.requestsPerDay}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#9ca3af' }} 
                      tickLine={{ stroke: '#444' }}
                      axisLine={{ stroke: '#444' }}
                      height={30}
                      tickMargin={8}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af' }} 
                      tickLine={{ stroke: '#444' }}
                      axisLine={{ stroke: '#444' }}
                      width={isMobile ? 30 : 40}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#27272a', borderColor: '#444', borderRadius: '4px' }}
                      itemStyle={{ color: '#e4e4e7' }}
                      labelStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
                    />
                    {!isMobile && <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />}
                    <Bar dataKey="value" name="Requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-sm font-medium text-zinc-300 mb-4">Response Time History</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.responseTimeHistory}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: '#9ca3af' }} 
                      tickLine={{ stroke: '#444' }}
                      axisLine={{ stroke: '#444' }}
                      height={30}
                      tickMargin={8}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af' }} 
                      tickLine={{ stroke: '#444' }}
                      axisLine={{ stroke: '#444' }}
                      width={isMobile ? 30 : 40}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#27272a', borderColor: '#444', borderRadius: '4px' }}
                      itemStyle={{ color: '#e4e4e7' }}
                      labelStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
                    />
                    {!isMobile && <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />}
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      name="Response Time (ms)" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      dot={{ r: 4, fill: '#10b981', stroke: '#10b981' }}
                      activeDot={{ r: 6, fill: '#10b981', stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>
          
          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="p-3 text-xs font-medium text-zinc-400">Endpoint</th>
                    <th className="p-3 text-xs font-medium text-zinc-400">Requests</th>
                    <th className="p-3 text-xs font-medium text-zinc-400">Average Time</th>
                    <th className="p-3 text-xs font-medium text-zinc-400 text-right">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {endpointData.length > 0 ? (
                    endpointData.map((endpoint, i) => (
                      <tr key={i} className="border-b border-zinc-800">
                        <td className="p-3 text-sm text-zinc-300">{endpoint.name}</td>
                        <td className="p-3 text-sm text-zinc-300">{endpoint.requests}</td>
                        <td className="p-3 text-sm text-zinc-300">{endpoint.avgTime.toFixed(2)} ms</td>
                        <td className="p-3 text-sm text-zinc-300 text-right">{endpoint.successRate.toFixed(2)}%</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-zinc-500">
                        No endpoint data available. Make some API requests to see analytics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {endpointData.length > 0 && (
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-4">Endpoint Requests Distribution</h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={endpointData}
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: isMobile ? 80 : 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis 
                        type="number"
                        tick={{ fill: '#9ca3af' }} 
                        tickLine={{ stroke: '#444' }}
                        axisLine={{ stroke: '#444' }}
                      />
                      <YAxis 
                        dataKey="name" 
                        type="category"
                        tick={{ fill: '#9ca3af' }} 
                        tickLine={{ stroke: '#444' }}
                        axisLine={{ stroke: '#444' }}
                        width={isMobile ? 80 : 120}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#27272a', borderColor: '#444', borderRadius: '4px' }}
                        itemStyle={{ color: '#e4e4e7' }}
                        labelStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
                      />
                      {!isMobile && <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />}
                      <Bar dataKey="requests" name="Requests" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Methods Tab */}
          <TabsContent value="methods" className="space-y-6">
            {methodData.length > 0 ? (
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-300 mb-4">Method Distribution</h3>
                <div className="h-80 flex flex-col sm:flex-row items-center justify-center">
                  <div className="w-full sm:w-1/2 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={methodData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => isMobile ? 
                            `${(percent * 100).toFixed(0)}%` : 
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {methodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#27272a', borderColor: '#444', borderRadius: '4px' }}
                          itemStyle={{ color: '#e4e4e7' }}
                          labelStyle={{ color: '#e4e4e7', fontWeight: 'bold' }}
                          formatter={(value, name) => [`${value} requests`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="w-full sm:w-1/2 mt-4 sm:mt-0">
                    <div className="grid grid-cols-1 gap-2">
                      {methodData.map((method, index) => (
                        <div key={index} className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-xs text-zinc-300">{method.name}</span>
                          <span className="text-xs text-zinc-500 ml-auto">{method.value} requests</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-800 rounded-lg p-8 text-center">
                <p className="text-zinc-500">No method data available. Make some API requests to see analytics.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Recent Requests Tab */}
          <TabsContent value="recent" className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="p-3 text-xs font-medium text-zinc-400">Endpoint</th>
                    <th className="p-3 text-xs font-medium text-zinc-400">Method</th>
                    <th className="p-3 text-xs font-medium text-zinc-400">Status</th>
                    <th className="p-3 text-xs font-medium text-zinc-400 text-right">Time</th>
                    <th className="p-3 text-xs font-medium text-zinc-400 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequestsData.length > 0 ? (
                    recentRequestsData.map((request) => (
                      <tr key={request.id} className="border-b border-zinc-800">
                        <td className="p-3 text-sm text-zinc-300">{request.endpoint}</td>
                        <td className="p-3 text-sm text-zinc-300">{request.method}</td>
                        <td className="p-3">
                          {request.status === 'success' ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-900/30 text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Success
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-900/30 text-red-400">
                              <XCircle className="w-3 h-3 mr-1" />
                              Error
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-sm text-zinc-300 text-right">{request.time.toFixed(2)} ms</td>
                        <td className="p-3 text-sm text-zinc-300 text-right">{formatTimestamp(request.timestamp)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-zinc-500">
                        No recent requests available. Make some API requests to see analytics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
