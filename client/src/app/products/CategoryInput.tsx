// components/CategoryInput.tsx
import React from "react";
import AddItemField from "./AddItemField";
import { FORM_STYLES } from "../constraints/ProductConstants";

interface CategoryInputProps {
  category: string;
  categories: string[];
  error?: string;
  onCategoryChange: (category: string) => void;
  onAddCategory: (category: string) => void;
}

const CategoryInput: React.FC<CategoryInputProps> = ({
  category,
  categories,
  error,
  onCategoryChange,
  onAddCategory
}) => {
  const categoriesWithDefault = category ? categories : ["", ...categories];
  
  return (
    <div>
      <label htmlFor="category" className={FORM_STYLES.labelClass}>
        Category <span className="text-red-500">*</span>
      </label>
      
      <AddItemField
        items={categoriesWithDefault}
        selectedValue={category || ""}
        onValueChange={onCategoryChange}
        onAddItem={onAddCategory}
        placeholder="Enter new category"
      />
      
      {error && <p className={FORM_STYLES.errorClass}>{error}</p>}
    </div>
  );
};

export default CategoryInput;