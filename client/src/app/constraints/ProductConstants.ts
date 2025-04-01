// constants/ProductConstants.ts

import { getSupportedCurrencies } from '@/utils/currencyUtils';

// Stock units (no change needed)
export const INITIAL_STOCK_UNITS = [
  "Units",
  "Pieces",
  "Kg",
  "g",
  "L",
  "mL",
  "Boxes",
  "Pairs"
];

// Use your existing function instead of hard-coding currencies
export const INITIAL_CURRENCIES = getSupportedCurrencies();

// Form initial data
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

// Form styles (no change needed)
export const FORM_STYLES = {
  labelClass: "block text-sm font-medium text-gray-700 mb-1",
  inputClass: "w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500",
  errorClass: "text-red-500 text-xs mt-1",
  helpTextClass: "text-gray-500 text-xs mt-1",
};