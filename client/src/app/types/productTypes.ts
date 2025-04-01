import { Product } from "@/state/api";

// Constants for product units
export const LOCAL_STORAGE_UNITS_KEY = "productStockUnits";

// ProductUnitsMap type definition
export type ProductUnitsMap = {
  [productId: string]: string;
};

// types/ProductFormTypes.ts
export type ProductFormData = {
  name: string;
  price: number;
  currency: string;
  stockQuantity: number;
  stockUnit: string;
  rating: number;
  category: string;
  image: File | null;
};

export type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateProduct: (product: ProductFormData) => void;
  onCreate: (formData: ProductFormData) => Promise<void>;
};

// Get default units by category
export const getCategoryDefaultUnit = (category?: string): string => {
  if (!category) return "Units";
  
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes("food") || categoryLower.includes("beverage")) {
    return "Kg";
  } else if (categoryLower.includes("clothing")) {
    return "Pieces";
  } else if (categoryLower.includes("electronics")) {
    return "Units";
  }
  
  return "Units"; // Default fallback
};

// Helper for formatting stock display with unit
export const formatStockDisplay = (product: Product, productUnit: string): string => {
  return `${product.stockQuantity} ${productUnit}`;
};

// Selected product type for restock modal
export type SelectedProductInfo = {
  id: string;
  name: string;
  currentStock: number;
  restockQuantity: number;
  unit: string;
};

// Map of currency codes to symbols for reference
export const currencySymbols: { [key: string]: string } = {
  'GHC': '₵',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
};

// Helper function to get a currency symbol
export const getCurrencySymbol = (currencyCode: string): string => {
  return currencySymbols[currencyCode] || '$';
};

// Helper function to format price with currency symbol only
export const formatPrice = (product: Product): string => {
  const currencyCode = product.currency || 'GHC';
  const symbol = currencySymbols[currencyCode] || '$';
  return `${symbol}${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}`;
};