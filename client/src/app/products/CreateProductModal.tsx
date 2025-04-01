// components/CreateProductModal.tsx
import React, { useState, useEffect } from "react";
import { useCategories } from "../(context)/CategoryContext";
import { ProductFormData } from "../types/productTypes";
import { CreateProductModalProps } from "../types/productTypes";
import {
  FORM_STYLES,
  INITIAL_FORM_DATA,
  INITIAL_STOCK_UNITS,
  INITIAL_CURRENCIES
} from "../constraints/ProductConstants";

// Import components
import ImageUploader from "./ImageUploader";
import CategoryInput from "./CategoryInput";
import PriceInput from "./PriceInput";
import CurrencyInput from "./CurrencyInput";
import StockQuantityInput from "./StockQuantityInput";
import RatingInput from "./RatingInput";
import Snackbar from "./Snackbar";

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  console.log('CreateProductModal rendered, isOpen:', isOpen);
  // Get categories from context
  const { categories, addCategory } = useCategories();
  
  // Form state
  const [formData, setFormData] = useState<ProductFormData>({...INITIAL_FORM_DATA as ProductFormData});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Local state for custom items
  const [stockUnits, setStockUnits] = useState<string[]>(INITIAL_STOCK_UNITS);
  const [currencies, setCurrencies] = useState<string[]>(INITIAL_CURRENCIES);

  // Snackbar state that persists even when modal is closed
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    variant: "success" as "success" | "error", // or us
    productName: "" // Store product name for reference
  });

  // Track if we should keep the snackbar after modal closes
  const [shouldKeepSnackbar, setShouldKeepSnackbar] = useState(false);

  useEffect(() => {
    console.log("Current form data:", formData);
  }, [formData]);

  useEffect(() => {
    console.log('Snackbar state changed:', snackbar);
  }, [snackbar]);

  // Generic change handler for form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let newValue: any = value;
    
    // Handle numeric inputs
    if (name === 'price') {
      const numValue = parseFloat(value);
      newValue = isNaN(numValue) ? 0 : numValue;
    } else if (name === 'stockQuantity') {
      const numValue = parseInt(value);
      newValue = isNaN(numValue) ? 0 : Math.max(0, numValue);
    } else if (name === 'rating') {
      const numValue = parseFloat(value);
      newValue = isNaN(numValue) ? 0 : numValue;
    }
    
    // Update form data
    setFormData({
      ...formData,
      [name]: newValue,
    });
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // Handle image changes
  const handleImageChange = (file: File | null) => {
    setFormData({
      ...formData,
      image: file,
    });
    
    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      // Clean up existing preview
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
    }
    
    if (errors.image) {
      setErrors({
        ...errors,
        image: "",
      });
    }
  };

  // Handle adding a new category
  const handleAddCategory = (newCategory: string) => {
    addCategory(newCategory);
    setFormData({
      ...formData,
      category: newCategory
    });
  };

  // Handle adding a new stock unit
  const handleAddStockUnit = (newUnit: string) => {
    setStockUnits(prev => [...prev, newUnit]);
    setFormData({
      ...formData,
      stockUnit: newUnit
    });
  };

  // Handle adding a new currency
  const handleAddCurrency = (newCurrency: string) => {
    setCurrencies(prev => [...prev, newCurrency]);
    setFormData({
      ...formData,
      currency: newCurrency
    });
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (!formData.currency) {
      newErrors.currency = "Please select a currency";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Show success snackbar
  const showSuccessSnackbar = (message: string, productName: string) => {
    setShouldKeepSnackbar(true);
    setSnackbar({
      open: true,
      message,
      variant: "success",
      productName
    });
  };

  // Show error snackbar
  const showErrorSnackbar = (message: string) => {
    setSnackbar({
      open: true,
      message,
      variant: "error" as const,
      productName: ""
    });
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
    setShouldKeepSnackbar(false);
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save the product name before it gets reset
      const productName = formData.name;
      
      await onCreate(formData);


      
      // Show success message with stored product name
      showSuccessSnackbar(`Product "${productName}" created successfully!`, productName);
      
      // Close the modal after successful creation
      handleModalCloseAfterSuccess();
      
    } catch (error) {
      console.error("Error creating product:", error);
      showErrorSnackbar("Failed to create product. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Handle modal close after successful creation
  const handleModalCloseAfterSuccess = () => {
    // Reset the form data
    resetFormOnly();
    // Close the modal but keep the snackbar visible
    onClose();
  };

  // Reset form data only (not snackbar)
  const resetFormOnly = () => {
    // Clean up image preview URL if exists
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    // Reset form data
    setFormData({...INITIAL_FORM_DATA as ProductFormData});
    setImagePreview(null);
    setErrors({});
    setIsSubmitting(false);
  };

  // Close modal handler
  const handleClose = () => {
    // Only reset the snackbar if we're not showing a success message
    if (!shouldKeepSnackbar) {
      setSnackbar({
        open: false,
        message: "",
        variant: "success",
        productName: ""
      });
    }
    
    resetFormOnly();
    onClose();
  };

  if (!isOpen) {
    // When modal is closed but we still want to show snackbar
    if (shouldKeepSnackbar && snackbar.open) {
      return (
        <Snackbar
          open={snackbar.open}
          message={snackbar.message}
          variant={snackbar.variant}
          onClose={handleSnackbarClose}
          duration={6000}
        />
      );
    }
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white py-3 px-4 rounded-t-lg">
          <h2 className="text-xl font-semibold">Create New Product</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column - Form fields */}
            <div className="w-full md:w-7/12 space-y-4">
              {/* Product Name */}
              <div>
                <label htmlFor="name" className={FORM_STYLES.labelClass}>
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`${FORM_STYLES.inputClass} ${errors.name ? 'border-red-500' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <p className={FORM_STYLES.errorClass}>{errors.name}</p>}
              </div>

              {/* Price and Currency */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <PriceInput
                  price={formData.price}
                  currency={formData.currency}
                  error={errors.price}
                  onChange={handleChange}
                />

                <CurrencyInput 
                  currency={formData.currency}
                  currencies={currencies}
                  error={errors.currency}
                  onCurrencyChange={(value) => setFormData({...formData, currency: value})}
                  onAddCurrency={handleAddCurrency}
                />
              </div>

              {/* Stock Quantity and Units */}
              <StockQuantityInput
                quantity={formData.stockQuantity}
                unit={formData.stockUnit}
                units={stockUnits}
                onQuantityChange={handleChange}
                onUnitChange={(value) => setFormData({...formData, stockUnit: value})}
                onAddUnit={handleAddStockUnit}
              />

              {/* Category */}
              <CategoryInput
                category={formData.category}
                categories={categories}
                error={errors.category}
                onCategoryChange={(value) => setFormData({...formData, category: value})}
                onAddCategory={handleAddCategory}
              />

              {/* Rating */}
              <RatingInput
                rating={formData.rating}
                onChange={handleChange}
              />
            </div>

            {/* Right column - Image upload */}
            <div className="w-full md:w-5/12 mt-4 md:mt-0">
              <ImageUploader
                imagePreview={imagePreview}
                onImageChange={handleImageChange}
              />
            </div>
          </div>

          {/* Form buttons */}
          <div className="border-t border-gray-200 mt-6 pt-6 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 font-medium"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>
          </div>
        </form>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          message={snackbar.message}
          variant={snackbar.variant}
          onClose={handleSnackbarClose}
          duration={6000}
        />
      </div>
    </div>
  );
};

export default CreateProductModal;