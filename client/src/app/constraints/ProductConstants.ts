// constants/ProductConstants.ts
import { getSupportedCurrencies } from '@/utils/currencyUtils';

const LOCAL_STORAGE_STOCK_UNITS_KEY = "productStockUnits";

// Default stock units
const DEFAULT_STOCK_UNITS: string[] = [
  "Units",
  "Pieces",
  "Kg",
  "g",
  "L",
  "mL",
  "Boxes",
  "Pairs"
];

// Function to load stock units from localStorage
const loadStockUnitsFromStorage = (): string[] => {
  try {
    const storedUnits = localStorage.getItem(LOCAL_STORAGE_STOCK_UNITS_KEY);
    if (storedUnits) {
      const parsedUnits: string[] = JSON.parse(storedUnits);
      // Create a unique array of units
      const uniqueUnits = Array.from(new Set([
        ...DEFAULT_STOCK_UNITS, 
        ...parsedUnits
      ])).filter(Boolean) as string[];
      return uniqueUnits;
    }
    return DEFAULT_STOCK_UNITS;
  } catch (error) {
    console.error("Error loading stock units from localStorage:", error);
    return DEFAULT_STOCK_UNITS;
  }
};

// Save custom stock units to localStorage
const saveCustomStockUnit = (newUnit: string): void => {
  try {
    const currentUnits = loadStockUnitsFromStorage();
    
    // Only save if it's a new unit and not in default units
    if (!DEFAULT_STOCK_UNITS.includes(newUnit) && !currentUnits.includes(newUnit)) {
      const updatedUnits = [...currentUnits, newUnit];
      localStorage.setItem(
        LOCAL_STORAGE_STOCK_UNITS_KEY, 
        JSON.stringify(updatedUnits.filter(unit => !DEFAULT_STOCK_UNITS.includes(unit)))
      );
    }
  } catch (error) {
    console.error("Error saving custom stock unit:", error);
  }
};

// Export stock units with localStorage support
export const INITIAL_STOCK_UNITS = loadStockUnitsFromStorage();

// Use existing function for currencies
export const INITIAL_CURRENCIES = getSupportedCurrencies();

// Initial form data
export const INITIAL_FORM_DATA = {
  name: "",
  price: 0,
  currency: "GHC", // Default to GHC
  stockQuantity: 0,
  stockUnit: "Units",
  rating: 0,
  category: "",
  image: null,
};

// Form styles
export const FORM_STYLES = {
  labelClass: "block text-sm font-medium text-gray-700 mb-1",
  inputClass: "w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
  errorClass: "text-red-500 text-xs mt-1",
  helpTextClass: "text-gray-500 text-xs mt-1",
};

// Export the save function for use in components
export { saveCustomStockUnit };