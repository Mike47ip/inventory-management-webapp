"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Initial category options
const initialCategoryOptions: string[] = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Sports & Outdoors",
  "Books",
  "Toys & Games",
  "Health & Wellness",
  "Automotive",
  "Office Supplies",
  "Food & Beverage",
  "Other"
];

const LOCAL_STORAGE_CATEGORIES_KEY = "productCategories";

type CategoryContextType = {
  categories: string[];
  updateCategories: (newCategories: string[]) => void;
  addCategory: (category: string) => void;
};

// Create context with default values
const CategoryContext = createContext<CategoryContextType>({
  categories: initialCategoryOptions,
  updateCategories: () => {
    console.warn("updateCategories called outside provider");
  },
  addCategory: () => {
    console.warn("addCategory called outside provider");
  },
});

// Custom hook to use category context
export const useCategories = () => {
  const context = useContext(CategoryContext);
  
  if (!context) {
    console.error("useCategories must be used within a CategoryProvider");
  }
  
  return context;
};

// Provider component
export const CategoryProvider = ({ children }: { children: ReactNode }) => {
  // Load categories from localStorage on initial render
  const loadCategoriesFromStorage = () => {
    try {
      const storedCategories = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
      if (storedCategories) {
        const parsedCategories: string[] = JSON.parse(storedCategories);
        // Create a unique array of categories
        const uniqueCategories = Array.from(new Set([
          ...initialCategoryOptions, 
          ...parsedCategories
        ])).filter(Boolean) as string[];
        return uniqueCategories;
      }
      return initialCategoryOptions;
    } catch (error) {
      console.error("Error loading categories from localStorage:", error);
      return initialCategoryOptions;
    }
  };

  const [categories, setCategories] = useState<string[]>(() => loadCategoriesFromStorage());
  
  // Save categories to localStorage whenever they change
  useEffect(() => {
    try {
      // Filter out initial categories to only save newly added ones
      const categoriesToStore = categories.filter(
        category => !initialCategoryOptions.includes(category)
      );
      
      localStorage.setItem(
        LOCAL_STORAGE_CATEGORIES_KEY, 
        JSON.stringify(categoriesToStore)
      );
    } catch (error) {
      console.error("Error saving categories to localStorage:", error);
    }
  }, [categories]);

  const updateCategories = (newCategories: string[]) => {
    console.log("updateCategories called with:", newCategories);
    setCategories([...initialCategoryOptions, ...newCategories]);
  };

  const addCategory = (category: string) => {
    console.log("addCategory called with:", category);
    
    if (!category) {
      console.warn("Attempted to add empty category");
      return;
    }
    
    if (categories.includes(category)) {
      console.warn("Category already exists:", category);
      return;
    }
    
    setCategories(prev => {
      console.log("Adding category to state:", category);
      return [...prev, category];
    });
  };

  const contextValue = {
    categories,
    updateCategories,
    addCategory
  };

  return (
    <CategoryContext.Provider value={contextValue}>
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryContext;