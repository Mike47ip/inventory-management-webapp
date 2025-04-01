export const CURRENCY_SYMBOLS: { [key: string]: string } = {
  'GHC': '₵',   // Ghanaian Cedi
  'USD': '$',   // US Dollar
  'EUR': '€',   // Euro
  'GBP': '£',   // British Pound
  'JPY': '¥',   // Japanese Yen
  'CAD': 'C$',  // Canadian Dollar
  'AUD': 'A$',  // Australian Dollar
  'CHF': 'Fr.', // Swiss Franc
  'CNY': '¥',   // Chinese Yuan
  'INR': '₹',   // Indian Rupee
  'BRL': 'R$',  // Brazilian Real
  'RUB': '₽',   // Russian Ruble
  'KRW': '₩',   // South Korean Won
  'SGD': 'S$',  // Singapore Dollar
};

/**
 * Get the currency symbol for a given currency code
 * @param currencyCode - The currency code (e.g., 'USD', 'EUR')
 * @returns The currency symbol or the original code if not found
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
};

/**
 * Format price with currency symbol
 * @param price - The numeric price value
 * @param currencyCode - The currency code
 * @param options - Optional formatting options
 * @returns Formatted price string with currency symbol
 */
export const formatPrice = (
  price: number, 
  currencyCode: string = 'USD', 
  options: { 
    minimumFractionDigits?: number, 
    maximumFractionDigits?: number 
  } = {}
): string => {
  const symbol = getCurrencySymbol(currencyCode);
  const { 
    minimumFractionDigits = 2, 
    maximumFractionDigits = 2 
  } = options;

  return `${symbol}${price.toFixed(maximumFractionDigits)}`;
};

/**
 * Get a list of supported currencies
 * @returns Array of supported currency codes
 */
export const getSupportedCurrencies = (): string[] => {
  return Object.keys(CURRENCY_SYMBOLS);
};

/**
 * Convert currency (placeholder - would typically involve real-time exchange rates)
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount (currently just returns the original amount)
 */
export const convertCurrency = (
  amount: number, 
  fromCurrency: string, 
  toCurrency: string
): number => {
  // TODO: Implement actual currency conversion logic
  // This is a placeholder that returns the original amount
  console.warn('Currency conversion is not implemented');
  return amount;
};