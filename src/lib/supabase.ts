// Portfolio API configuration
// Using real Yahoo Finance and Google Finance APIs for stock data
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchFromAPI<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API request failed: ${response.statusText} - ${errorData}`);
  }

  return response.json();
}

