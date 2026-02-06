import { useState, useEffect, useCallback } from 'react';
import { fetchFromAPI } from '../lib/supabase';
import type { EnrichedHolding, SectorSummary, PortfolioSummary } from '../types/portfolio';

interface UsePortfolioReturn {
  holdings: EnrichedHolding[];
  sectorSummaries: SectorSummary[];
  portfolioSummary: PortfolioSummary;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

export function usePortfolio(autoRefreshInterval = 15000): UsePortfolioReturn {
  const [holdings, setHoldings] = useState<EnrichedHolding[]>([]);
  const [sectorSummaries, setSectorSummaries] = useState<SectorSummary[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary>({
    total_investment: 0,
    total_present_value: 0,
    total_gain_loss: 0,
    gain_loss_percentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const enrichHoldings = useCallback(async () => {
    try {
      setError(null);

      console.log('Fetching portfolio data...');

      // Fetch enriched holdings data
      const enrichedHoldings = await fetchFromAPI<EnrichedHolding[]>('/holdings');
      console.log('Holdings fetched:', enrichedHoldings.length);
      setHoldings(enrichedHoldings);

      // Fetch sector summaries
      const summaries = await fetchFromAPI<SectorSummary[]>('/sector-summaries');
      console.log('Sector summaries fetched:', summaries.length);
      setSectorSummaries(summaries);

      // Fetch portfolio summary
      const summary = await fetchFromAPI<PortfolioSummary>('/portfolio-summary');
      console.log('Portfolio summary fetched:', summary);
      setPortfolioSummary(summary);
    } catch (err) {
      console.error('Error enriching holdings:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load portfolio data';
      console.error('Detailed error:', errorMessage);
      setError(`Unable to connect to API server. Please ensure the backend is running. Error: ${errorMessage}`);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setError(null);
    await enrichHoldings();
  }, [enrichHoldings]);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };

    loadInitialData();
  }, [refreshData]);

  useEffect(() => {
    if (autoRefreshInterval > 0) {
      const interval = setInterval(() => {
        refreshData();
      }, autoRefreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, refreshData]);

  return {
    holdings,
    sectorSummaries,
    portfolioSummary,
    loading,
    error,
    refreshData,
  };
}
