import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';
import type { PortfolioSummary } from '../types/portfolio';

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary;
}

export function PortfolioSummaryCard({ summary }: PortfolioSummaryCardProps) {
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

  const isPositiveGain = summary.total_gain_loss >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Investment</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.total_investment)}
            </p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Present Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.total_present_value)}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div
        className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
          isPositiveGain ? 'border-green-500' : 'border-red-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Gain/Loss</p>
            <p
              className={`text-2xl font-bold ${
                isPositiveGain ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(summary.total_gain_loss)}
            </p>
          </div>
          <div
            className={`p-3 rounded-full ${
              isPositiveGain ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {isPositiveGain ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>
        </div>
      </div>

      <div
        className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
          isPositiveGain ? 'border-green-500' : 'border-red-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Return %</p>
            <p
              className={`text-2xl font-bold ${
                isPositiveGain ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPercentage(summary.gain_loss_percentage)}
            </p>
          </div>
          <div
            className={`p-3 rounded-full ${
              isPositiveGain ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            {isPositiveGain ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
