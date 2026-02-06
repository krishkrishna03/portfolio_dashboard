import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { PortfolioTable } from './PortfolioTable';
import type { SectorSummary } from '../types/portfolio';

interface SectorGroupProps {
  sectorSummary: SectorSummary;
  totalInvestment: number;
}

export function SectorGroup({ sectorSummary, totalInvestment }: SectorGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getGainLossColor = (value: number) => {
    if (value > 0) return 'text-green-600 bg-green-50';
    if (value < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getGainLossTextColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
          getGainLossColor(sectorSummary.total_gain_loss)
        } hover:opacity-80`}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
          <h3 className="text-lg font-bold text-gray-900">
            {sectorSummary.sector_name}
          </h3>
          <span className="text-sm text-gray-600">
            ({sectorSummary.holdings.length} {sectorSummary.holdings.length === 1 ? 'stock' : 'stocks'})
          </span>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <div className="text-xs text-gray-600 mb-1">Investment</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatCurrency(sectorSummary.total_investment)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-600 mb-1">Present Value</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatCurrency(sectorSummary.total_present_value)}
            </div>
          </div>
          <div className="text-right min-w-[140px]">
            <div className="text-xs text-gray-600 mb-1">Gain/Loss</div>
            <div className={`text-sm font-bold ${getGainLossTextColor(sectorSummary.total_gain_loss)}`}>
              {formatCurrency(sectorSummary.total_gain_loss)}
              <span className="ml-2 text-xs">
                ({formatPercentage(sectorSummary.gain_loss_percentage)})
              </span>
            </div>
          </div>
        </div>
      </button>
      {isExpanded && (
        <div className="p-4 bg-gray-50">
          <PortfolioTable
            holdings={sectorSummary.holdings}
            totalInvestment={totalInvestment}
          />
        </div>
      )}
    </div>
  );
}
