export interface Sector {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface PortfolioHolding {
  id: string;
  stock_name: string;
  symbol: string;
  exchange: string;
  sector_id: string;
  purchase_price: number;
  quantity: number;
  purchase_date: string;
  created_at: string;
  updated_at: string;
}

export interface StockPrice {
  id: string;
  symbol: string;
  current_price: number;
  pe_ratio: number;
  latest_earnings: number;
  last_updated: string;
  created_at: string;
}

export interface EnrichedHolding extends PortfolioHolding {
  sector_name: string;
  current_price: number;
  pe_ratio: number;
  latest_earnings: number;
  investment: number;
  present_value: number;
  gain_loss: number;
  gain_loss_percentage: number;
}

export interface SectorSummary {
  sector_name: string;
  total_investment: number;
  total_present_value: number;
  total_gain_loss: number;
  gain_loss_percentage: number;
  holdings: EnrichedHolding[];
}

export interface PortfolioSummary {
  total_investment: number;
  total_present_value: number;
  total_gain_loss: number;
  gain_loss_percentage: number;
}
