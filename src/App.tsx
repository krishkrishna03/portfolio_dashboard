import { RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { usePortfolio } from './hooks/usePortfolio';
import { PortfolioSummaryCard } from './components/PortfolioSummaryCard';
import { SectorGroup } from './components/SectorGroup';
import { useState, useEffect } from 'react';

function App() {
  const {
    sectorSummaries,
    portfolioSummary,
    loading,
    error,
    refreshData
  } = usePortfolio(15000);

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Update display time every second
    const displayInterval = setInterval(() => {
      setLastUpdated(new Date(lastUpdated.getTime() + 1000));
    }, 1000);
    return () => clearInterval(displayInterval);
  }, [lastUpdated]);

  // Update timestamp when data refreshes
  useEffect(() => {
    setLastUpdated(new Date());
  }, [portfolioSummary]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setLastUpdated(new Date());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error Loading Portfolio</h3>
          <p className="text-red-600">{error}</p>
          <button
            onClick={handleManualRefresh}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <TrendingUp className="w-10 h-10 text-blue-600" />
                Portfolio Dashboard
              </h1>
              <p className="text-gray-600">Real-time tracking of your investment portfolio</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                <Clock className="w-4 h-4" />
                <span>Updated {getTimeSinceUpdate()}</span>
              </div>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          <PortfolioSummaryCard summary={portfolioSummary} />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Holdings by Sector</h2>
          {sectorSummaries.map((sectorSummary) => (
            <SectorGroup
              key={sectorSummary.sector_name}
              sectorSummary={sectorSummary}
              totalInvestment={portfolioSummary.total_investment}
            />
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Note:</span> Prices update automatically every 15 seconds.
            Stock data is fetched from financial APIs. P/E Ratios and earnings data are provided for reference.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
