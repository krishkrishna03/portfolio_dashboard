import type { EnrichedHolding } from '../types/portfolio';

interface PortfolioTableProps {
  holdings: EnrichedHolding[];
  totalInvestment: number;
}

export function PortfolioTable({ holdings, totalInvestment }: PortfolioTableProps) {
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
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const calculatePortfolioPercentage = (investment: number) => {
    return totalInvestment > 0 ? (investment / totalInvestment) * 100 : 0;
  };

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full bg-white">
        <thead className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
              Particulars
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
              Purchase Price
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
              Qty
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
              Investment
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
              Portfolio %
            </th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
              Exchange
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
              CMP
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
              Present Value
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
              Gain/Loss
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
              P/E Ratio
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
              Latest Earnings
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {holdings.map((holding, index) => (
            <tr
              key={holding.id}
              className={`${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              } hover:bg-blue-50 transition-colors duration-150`}
            >
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900">
                    {holding.stock_name}
                  </span>
                  <span className="text-xs text-gray-500">{holding.symbol}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-700">
                {formatCurrency(holding.purchase_price)}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-700 font-medium">
                {holding.quantity}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 font-semibold">
                {formatCurrency(holding.investment)}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-700">
                {calculatePortfolioPercentage(holding.investment).toFixed(2)}%
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {holding.exchange}
                </span>
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 font-semibold">
                {formatCurrency(holding.current_price)}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-900 font-semibold">
                {formatCurrency(holding.present_value)}
              </td>
              <td className={`px-4 py-3 text-right text-sm font-bold ${getGainLossColor(holding.gain_loss)}`}>
                <div className="flex flex-col items-end">
                  <span>{formatCurrency(holding.gain_loss)}</span>
                  <span className="text-xs">
                    ({formatPercentage(holding.gain_loss_percentage)})
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-700">
                {holding.pe_ratio.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-right text-sm text-gray-700">
                {formatCurrency(holding.latest_earnings)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
