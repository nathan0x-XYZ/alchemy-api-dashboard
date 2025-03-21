// API Request Analytics Service
import { ApiEndpoint } from './api';

// Request analytics data structure
export interface RequestAnalytics {
  endpoint: string;
  method: string;
  responseTime: number;
  status: number;
  timestamp: number;
  success: boolean;
  network?: string;
  url?: string;
}

// Store request analytics data
let requestAnalyticsList: RequestAnalytics[] = [];

// Maximum number of records
const MAX_ANALYTICS_RECORDS = 100;

// Add request analytics data
export function addRequestAnalytics(analytics: RequestAnalytics): void {
  // Add to the top of the list
  requestAnalyticsList.unshift(analytics);
  
  // Keep the list size not exceeding the maximum records
  if (requestAnalyticsList.length > MAX_ANALYTICS_RECORDS) {
    requestAnalyticsList = requestAnalyticsList.slice(0, MAX_ANALYTICS_RECORDS);
  }
  
  // Trigger event to notify UI to update
  const event = new CustomEvent('requestAnalyticsUpdated', { detail: analytics });
  window.dispatchEvent(event);
}

// Get request analytics data
export function getRequestAnalytics(): RequestAnalytics[] {
  return requestAnalyticsList;
}

// Get request performance metrics
export function getRequestPerformanceMetrics() {
  if (requestAnalyticsList.length === 0) {
    return {
      avgResponseTime: 0,
      successRate: 0,
      totalRequests: 0,
      endpointStats: {},
      methodStats: {}
    };
  }

  // Calculate average response time
  const totalResponseTime = requestAnalyticsList.reduce((sum, item) => sum + item.responseTime, 0);
  const avgResponseTime = totalResponseTime / requestAnalyticsList.length;
  
  // Calculate success rate
  const successfulRequests = requestAnalyticsList.filter(item => item.success).length;
  const successRate = (successfulRequests / requestAnalyticsList.length) * 100;
  
  // Group statistics by endpoint
  const endpointStats: Record<string, { count: number, avgTime: number, successRate: number }> = {};
  
  // Group statistics by method
  const methodStats: Record<string, { count: number, avgTime: number, successRate: number }> = {};
  
  // Calculate statistics for each endpoint and method
  requestAnalyticsList.forEach(item => {
    // Endpoint statistics
    if (!endpointStats[item.endpoint]) {
      endpointStats[item.endpoint] = { count: 0, avgTime: 0, successRate: 0 };
    }
    endpointStats[item.endpoint].count++;
    endpointStats[item.endpoint].avgTime += item.responseTime;
    if (item.success) {
      endpointStats[item.endpoint].successRate++;
    }
    
    // Method statistics
    if (!methodStats[item.method]) {
      methodStats[item.method] = { count: 0, avgTime: 0, successRate: 0 };
    }
    methodStats[item.method].count++;
    methodStats[item.method].avgTime += item.responseTime;
    if (item.success) {
      methodStats[item.method].successRate++;
    }
  });
  
  // Calculate averages and percentages
  Object.keys(endpointStats).forEach(key => {
    const stat = endpointStats[key];
    stat.avgTime = stat.avgTime / stat.count;
    stat.successRate = (stat.successRate / stat.count) * 100;
  });
  
  Object.keys(methodStats).forEach(key => {
    const stat = methodStats[key];
    stat.avgTime = stat.avgTime / stat.count;
    stat.successRate = (stat.successRate / stat.count) * 100;
  });
  
  return {
    avgResponseTime,
    successRate,
    totalRequests: requestAnalyticsList.length,
    endpointStats,
    methodStats
  };
}

// Transaction simulation
export interface TransactionSimulationResult {
  hash: string;
  success: boolean;
  gasUsed: number;
  gasLimit: number;
  errorMessage?: string;
  timestamp: string;
}

// Store transaction simulation results
let transactionSimulations: TransactionSimulationResult[] = [];

// Add transaction simulation result
export function addTransactionSimulation(result: TransactionSimulationResult): void {
  transactionSimulations.unshift(result);
  
  if (transactionSimulations.length > MAX_ANALYTICS_RECORDS) {
    transactionSimulations = transactionSimulations.slice(0, MAX_ANALYTICS_RECORDS);
  }
  
  const event = new CustomEvent('transactionSimulationAdded', { detail: result });
  window.dispatchEvent(event);
}

// Get transaction simulation results
export function getTransactionSimulations(): TransactionSimulationResult[] {
  return transactionSimulations;
}

// Get transaction simulation statistics
export function getTransactionSimulationStats() {
  if (transactionSimulations.length === 0) {
    return {
      successRate: 0,
      avgGasUsed: 0,
      totalSimulations: 0,
      gasUtilization: 0
    };
  }
  
  const successfulSimulations = transactionSimulations.filter(item => item.success).length;
  const successRate = (successfulSimulations / transactionSimulations.length) * 100;
  
  const totalGasUsed = transactionSimulations.reduce((sum, item) => sum + item.gasUsed, 0);
  const avgGasUsed = totalGasUsed / transactionSimulations.length;
  
  const totalGasLimit = transactionSimulations.reduce((sum, item) => sum + item.gasLimit, 0);
  const gasUtilization = (totalGasUsed / totalGasLimit) * 100;
  
  return {
    successRate,
    avgGasUsed,
    totalSimulations: transactionSimulations.length,
    gasUtilization
  };
}
