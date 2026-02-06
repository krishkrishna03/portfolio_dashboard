import * as xlsx from 'node-xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let holdings = [];

export function loadHoldingsFromExcel() {
  try {
    const excelPath = path.join(__dirname, './data.xlsx');
    
    const workSheetsFromFile = xlsx.parse(excelPath);
    const sheet = workSheetsFromFile[0];
    
    if (!sheet.data || sheet.data.length === 0) {
      throw new Error('No data found in Excel file');
    }

    // Log header to help debug
    console.log('📋 Excel columns:', sheet.data[0]);

    // Skip header row and parse data
    // Expected columns: Symbol, Quantity, Purchase Price, Sector
    // Note: Current Price is now fetched from Yahoo Finance in real-time
    const parsedHoldings = sheet.data.slice(1).map((row, index) => {
      const symbol = (row[0] || '').toString().toUpperCase();
      const quantity = parseFloat(row[1]) || 0;
      const purchasePrice = parseFloat(row[2]) || 0;
      const sector = (row[3] || 'Unknown').toString();
      
      return {
        id: `holding-${index}`,
        symbol,
        quantity,
        purchase_price: purchasePrice,
        sector_name: sector,
      };
    }).filter(h => h.symbol && h.quantity > 0);

    if (parsedHoldings.length === 0) {
      throw new Error('No valid holdings found in Excel file');
    }

    holdings = parsedHoldings;
    console.log(`✓ Loaded ${holdings.length} holdings from Excel`);
    console.log('📊 Current prices will be fetched from Yahoo Finance API');
    return holdings;
  } catch (error) {
    console.error('❌ Error loading Excel file:', error);
    console.error('📁 Please add your portfolio data to: server/data.xlsx');
    console.error('📋 Expected columns: Symbol | Quantity | Purchase Price | Sector');
    throw error;
  }
}

export function getHoldings() {
  if (holdings.length === 0) {
    return loadHoldingsFromExcel();
  }
  return holdings;
}

export function getHoldingsBySymbols(symbols) {
  const upperSymbols = symbols.map(s => s.toUpperCase());
  return holdings.filter(h => upperSymbols.includes(h.symbol));
}
