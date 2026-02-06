// Portfolio API configuration
// Using real Yahoo Finance and Google Finance APIs for stock data
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://portfolio-dashboard-2pyx.onrender.com/api';

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export async function fetchFromAPI<T>(endpoint: string, options?: FetchOptions): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log('Fetching from:', url);

  try {
    const response = await fetch(url, {
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
  } catch (error) {
    console.error('Fetch error:', error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error(`Cannot connect to API at ${url}. Please check if the backend server is running and CORS is configured correctly.`);
    }
    throw error;
  }
}

