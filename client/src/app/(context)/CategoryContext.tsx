"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Initial category options
const initialCategoryOptions = [
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
  console.log("CategoryProvider rendering");
  
  const [categories, setCategories] = useState<string[]>(initialCategoryOptions);
  
  // Debug effect to track categories changes
  useEffect(() => {
    console.log("Categories updated:", categories);
  }, [categories]);

  const updateCategories = (newCategories: string[]) => {
    console.log("updateCategories called with:", newCategories);
    setCategories(newCategories);
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