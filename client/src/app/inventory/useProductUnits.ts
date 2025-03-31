// hooks/useProductUnits.ts
import { useState, useEffect, useCallback } from "react";
import { Product } from "@/state/api";
import { 
  ProductUnitsMap, 
  LOCAL_STORAGE_UNITS_KEY,
  getCategoryDefaultUnit
} from "../types/productTypes";


export const useProductUnits = () => {
  const [productUnits, setProductUnits] = useState<ProductUnitsMap>({});

  // Load product units from localStorage on component mount
  useEffect(() => {
    try {
      const savedUnits = localStorage.getItem(LOCAL_STORAGE_UNITS_KEY);
      if (savedUnits) {
        setProductUnits(JSON.parse(savedUnits));
      }
    } catch (error) {
      console.error("Error loading product units from localStorage:", error);
    }
  }, []);

  // Function to get unit for a product (from local storage or default by category)
  const getProductUnit = useCallback((product: Product): string => {
    return productUnits[product.productId] || getCategoryDefaultUnit(product.category);
  }, [productUnits]);

  // Function to set/update unit for a product
  const setProductUnit = useCallback((productId: string, unit: string) => {
    setProductUnits(prev => {
      const newUnits = { ...prev, [productId]: unit };
      
      // Save to localStorage
      try {
        localStorage.setItem(LOCAL_STORAGE_UNITS_KEY, JSON.stringify(newUnits));
      } catch (error) {
        console.error("Error saving product units to localStorage:", error);
      }
      
      return newUnits;
    });
  }, []);

  return {
    productUnits,
    getProductUnit,
    setProductUnit
  };
};

export default useProductUnits;