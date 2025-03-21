// API Key Service

// Local storage key for storing the API key
const API_KEY_STORAGE_KEY = 'alchemy-api-key';

/**
 * Get the saved API key
 * @returns The saved API key or empty string
 */
export function getApiKey(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
  return savedKey || '';
}

/**
 * Save API key to local storage
 * @param apiKey The API key to save
 */
export function saveApiKey(apiKey: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
}

/**
 * Clear the saved API key
 */
export function clearApiKey(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

/**
 * Check if an API key is saved
 * @returns Boolean indicating whether an API key is saved
 */
export function hasApiKey(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem(API_KEY_STORAGE_KEY);
  }
  return false;
}

/**
 * Obfuscate the API key for display
 * @param apiKey The API key to obfuscate
 * @returns The obfuscated API key
 */
export function obfuscateApiKey(apiKey: string): string {
  if (!apiKey) return '';
  
  // Only show the first 4 and last 4 characters, replacing the middle with asterisks
  const prefix = apiKey.substring(0, 4);
  const suffix = apiKey.substring(apiKey.length - 4);
  const stars = '*'.repeat(Math.min(apiKey.length - 8, 8));
  
  return `${prefix}${stars}${suffix}`;
}
