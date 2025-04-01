const LOCAL_STORAGE_CURRENCIES_KEY = "customCurrencies";

// Default currency symbols
export const DEFAULT_CURRENCY_SYMBOLS: { [key: string]: string } = {
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
 * Load currencies from localStorage
 * @returns Merged dictionary of default and custom currencies
 */
const loadCurrenciesFromStorage = (): { [key: string]: string } => {
  try {
    const storedCurrencies = localStorage.getItem(LOCAL_STORAGE_CURRENCIES_KEY);
    if (storedCurrencies) {
      const parsedCurrencies: { [key: string]: string } = JSON.parse(storedCurrencies);
      // Merge default and stored currencies, with defaults taking precedence
      return { 
        ...parsedCurrencies, 
        ...DEFAULT_CURRENCY_SYMBOLS 
      };
    }
    return DEFAULT_CURRENCY_SYMBOLS;
  } catch (error) {
    console.error("Error loading currencies from localStorage:", error);
    return DEFAULT_CURRENCY_SYMBOLS;
  }
};

// Dynamically loaded currency symbols
export const CURRENCY_SYMBOLS = loadCurrenciesFromStorage();

/**
 * Save a new custom currency to localStorage
 * @param currencyCode - Currency code to add
 * @param symbol - Currency symbol
 */
export const saveCustomCurrency = (currencyCode: string, symbol: string): void => {
  try {
    // Prevent overwriting default currencies
    if (DEFAULT_CURRENCY_SYMBOLS[currencyCode]) {
      console.warn(`Cannot override default currency: ${currencyCode}`);
      return;
    }

    // Load existing custom currencies
    const currentCurrencies = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_CURRENCIES_KEY) || '{}'
    );

    // Add or update the custom currency
    const updatedCurrencies = {
      ...currentCurrencies,
      [currencyCode]: symbol
    };

    // Save to localStorage
    localStorage.setItem(
      LOCAL_STORAGE_CURRENCIES_KEY, 
      JSON.stringify(updatedCurrencies)
    );

    // Update the runtime CURRENCY_SYMBOLS
    CURRENCY_SYMBOLS[currencyCode] = symbol;
  } catch (error) {
    console.error("Error saving custom currency:", error);
  }
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