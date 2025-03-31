import React, { ChangeEvent, FormEvent, useState, useRef, useEffect } from "react";
import { XCircle, Upload, Plus } from "lucide-react";
import Image from "next/image";
import { useCategories } from "../(context)/CategoryContext";

type ProductFormData = {
  name: string;
  price: number;
  currency: string; // Added currency field
  stockQuantity: number;
  stockUnit: string;
  rating: number;
  category: string;
  image: File | null;
};


// Updated type definition
type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateProduct: (product: ProductFormData) => void; // New prop added
  onCreate: (formData: ProductFormData) => Promise<void>;
};

// Initial stock unit options
const initialStockUnits = [
  "Units",
  "Pieces",
  "Kg",
  "g",
  "L",
  "mL",
  "Boxes",
  "Pairs"
];

// Initial currency options
const initialCurrencies = [
  "GHC",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "CAD",
  "AUD"
];

// Currency symbol map
const currencySymbols: { [key: string]: string } = {
  'GHC': '₵',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
};

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
  onCreateProduct // Add this line
}: CreateProductModalProps) => {

  console.log("Modal rendering, isOpen:", isOpen);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use the category context instead of local state
  const { categories, addCategory } = useCategories();
  console.log("Categories from context:", categories);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");
  
  // Stock unit state
  const [stockUnits, setStockUnits] = useState<string[]>(initialStockUnits);
  const [showAddStockUnit, setShowAddStockUnit] = useState(false);
  const [newStockUnit, setNewStockUnit] = useState("");
  const [stockUnitError, setStockUnitError] = useState("");
  
  // Currency state
  const [currencies, setCurrencies] = useState<string[]>(initialCurrencies);
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [newCurrency, setNewCurrency] = useState("");
  const [currencyError, setCurrencyError] = useState("");

  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: 0,
    currency: "GHC", // Default to GHC instead of USD
    stockQuantity: 0,
    stockUnit: "Units", // Default stock unit
    rating: 0,
    category: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Log form data changes
  useEffect(() => {
    console.log("Current form data:", formData);
  }, [formData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    console.log(`Form field change - ${name}:`, value);
    if (name === 'price') {
      const numValue = parseFloat(value);
      setFormData({
        ...formData,
        [name]: isNaN(numValue) ? 0 : numValue,
      });
    } else if (name === 'stockQuantity') {
      const numValue = parseInt(value);
      // Ensure stock quantity is never negative
      setFormData({
        ...formData,
        [name]: isNaN(numValue) ? 0 : Math.max(0, numValue),
      });
    } else if (name === 'rating') {
      const numValue = parseFloat(value);
      setFormData({
        ...formData,
        [name]: isNaN(numValue) ? 0 : numValue,
      });
    } else if (name === 'currency') {
      // Log when currency changes
      console.log(`Currency changed to: ${value}`);
      setFormData({
        ...formData,
        [name]: value,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleAddCategory = () => {
    console.log("Adding new category:", newCategory);
    // Validate new category
    if (!newCategory.trim()) {
      setCategoryError("Category name cannot be empty");
      return;
    }

    // Check if category already exists (case-insensitive)
    if (categories.some(cat => cat.toLowerCase() === newCategory.trim().toLowerCase())) {
      setCategoryError("This category already exists");
      console.log("Category error: already exists");
      return;
    }

    // Add the new category using the context
    addCategory(newCategory.trim());
    console.log("Category added successfully");
    
    // Set the new category as the selected one
    setFormData({
      ...formData,
      category: newCategory.trim()
    });
    
    // Reset the new category input and hide the add form
    setNewCategory("");
    setShowAddCategory(false);
    setCategoryError("");
  };

  const handleAddStockUnit = () => {
    console.log("Adding new stock unit:", newStockUnit);
    // Validate new stock unit
    if (!newStockUnit.trim()) {
      setStockUnitError("Unit name cannot be empty");
      return;
    }

    // Check if stock unit already exists (case-insensitive)
    if (stockUnits.some(unit => unit.toLowerCase() === newStockUnit.trim().toLowerCase())) {
      setStockUnitError("This unit already exists");
      console.log("Stock unit error: already exists");
      return;
    }

    // Add the new stock unit to the list
    const updatedUnits = [...stockUnits, newStockUnit.trim()];
    setStockUnits(updatedUnits);
    console.log("Stock unit added successfully");
    
    // Set the new stock unit as the selected one
    setFormData({
      ...formData,
      stockUnit: newStockUnit.trim()
    });
    
    // Reset the new stock unit input and hide the add form
    setNewStockUnit("");
    setShowAddStockUnit(false);
    setStockUnitError("");
  };

  const handleAddCurrency = () => {
    console.log("Adding new currency:", newCurrency);
    // Validate new currency
    if (!newCurrency.trim()) {
      setCurrencyError("Currency code cannot be empty");
      return;
    }

    // Check if currency already exists (case-insensitive)
    if (currencies.some(curr => curr.toLowerCase() === newCurrency.trim().toLowerCase())) {
      setCurrencyError("This currency already exists");
      console.log("Currency error: already exists");
      return;
    }

    // Add the new currency to the list
    const updatedCurrencies = [...currencies, newCurrency.trim().toUpperCase()];
    setCurrencies(updatedCurrencies);
    console.log("Currency added successfully");
    
    // Set the new currency as the selected one
    setFormData({
      ...formData,
      currency: newCurrency.trim().toUpperCase()
    });
    
    // Reset the new currency input and hide the add form
    setNewCurrency("");
    setShowAddCurrency(false);
    setCurrencyError("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file,
      });
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      
      if (errors.image) {
        setErrors({
          ...errors,
          image: "",
        });
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: null,
    });
    
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting form with data:", formData);
      // Log currency specifically to check its value
      console.log("Currency being submitted:", formData.currency);
      
      await onCreate(formData);

      // You can now call onCreateProduct if you want to update the local state
      if (onCreateProduct) {
        onCreateProduct(formData);
      }
      
      // Reset form
      setFormData({
        name: "",
        price: 0,
        currency: "GHC",
        stockQuantity: 0,
        stockUnit: "Units",
        rating: 0,
        category: "",
        image: null,
      });
      
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clean up image preview URL if exists
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    // Reset form
    setFormData({
      name: "",
      price: 0,
      currency: "GHC",
      stockQuantity: 0,
      stockUnit: "Units",
      rating: 0,
      category: "",
      image: null,
    });
    setImagePreview(null);
    setErrors({});
    setShowAddCategory(false);
    setNewCategory("");
    setCategoryError("");
    setShowAddStockUnit(false);
    setNewStockUnit("");
    setStockUnitError("");
    setShowAddCurrency(false);
    setNewCurrency("");
    setCurrencyError("");
    
    onClose();
  };

  if (!isOpen) return null;

  // Tailwind classes for form elements
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500";
  const errorClass = "text-red-500 text-xs mt-1";
  const helpTextClass = "text-gray-500 text-xs mt-1";

  // Get currency symbol for current currency
  const getCurrencySymbol = (currencyCode: string) => {
    return currencySymbols[currencyCode] || currencyCode;
  };

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
                <label htmlFor="name" className={labelClass}>
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <p className={errorClass}>{errors.name}</p>}
              </div>

              {/* Price and Currency - Changed to row layout */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                {/* Price */}
                <div className="flex-1">
                  <label htmlFor="price" className={labelClass}>
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      {getCurrencySymbol(formData.currency)}
                    </span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      min="0"
                      step="0.01"
                      className={`${inputClass} pl-6 ${errors.price ? 'border-red-500' : ''}`}
                      value={formData.price || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {errors.price && <p className={errorClass}>{errors.price}</p>}
                </div>

                {/* Currency */}
                <div className="flex-1">
                  <label htmlFor="currency" className={labelClass}>
                    Currency <span className="text-red-500">*</span>
                  </label>
                  {!showAddCurrency ? (
                    <div className="flex gap-2">
                      <select
                        id="currency"
                        name="currency"
                        className={`${inputClass} ${errors.currency ? 'border-red-500' : ''}`}
                        value={formData.currency}
                        onChange={handleChange}
                        required
                      >
                        {currencies.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency} ({getCurrencySymbol(currency)})
                          </option>
                        ))}
                      </select>
                      <button 
                        type="button"
                        className="bg-blue-100 text-blue-700 p-2 rounded-md hover:bg-blue-200 flex items-center justify-center"
                        onClick={() => setShowAddCurrency(true)}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="New currency code"
                        className={`${inputClass} ${currencyError ? 'border-red-500' : ''}`}
                        value={newCurrency}
                        onChange={(e) => {
                          setNewCurrency(e.target.value);
                          setCurrencyError("");
                        }}
                      />
                      <button
                        type="button"
                        className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                        onClick={handleAddCurrency}
                      >
                        <Plus size={20} />
                      </button>
                      <button
                        type="button"
                        className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 flex items-center justify-center"
                        onClick={() => {
                          setShowAddCurrency(false);
                          setNewCurrency("");
                          setCurrencyError("");
                        }}
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                  {currencyError && <p className={errorClass}>{currencyError}</p>}
                  {errors.currency && <p className={errorClass}>{errors.currency}</p>}
                </div>
              </div>

              {/* Stock Quantity and Units */}
              <div>
                <label htmlFor="stockQuantity" className={labelClass}>
                  Stock Quantity <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    id="stockQuantity"
                    name="stockQuantity"
                    min="0"
                    className={inputClass}
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    required
                  />
                  
                  {!showAddStockUnit ? (
                    <div className="flex gap-2 min-w-[150px]">
                      <select
                        id="stockUnit"
                        name="stockUnit"
                        className={`${inputClass}`}
                        value={formData.stockUnit}
                        onChange={handleChange}
                      >
                        {stockUnits.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                      <button 
                        type="button"
                        className="bg-blue-100 text-blue-700 p-2 rounded-md hover:bg-blue-200 flex items-center justify-center"
                        onClick={() => setShowAddStockUnit(true)}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 min-w-[150px]">
                      <input
                        type="text"
                        placeholder="New unit"
                        className={`${inputClass} ${stockUnitError ? 'border-red-500' : ''}`}
                        value={newStockUnit}
                        onChange={(e) => {
                          setNewStockUnit(e.target.value);
                          setStockUnitError("");
                        }}
                      />
                      <button
                        type="button"
                        className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                        onClick={handleAddStockUnit}
                      >
                        <Plus size={20} />
                      </button>
                      <button
                        type="button"
                        className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 flex items-center justify-center"
                        onClick={() => {
                          setShowAddStockUnit(false);
                          setNewStockUnit("");
                          setStockUnitError("");
                        }}
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  )}
                </div>
                {stockUnitError && <p className={errorClass}>{stockUnitError}</p>}
                <p className={helpTextClass}>0 means product is out of stock</p>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className={labelClass}>
                  Category <span className="text-red-500">*</span>
                </label>
                
                {!showAddCategory ? (
                  <>
                    <div className="flex gap-2">
                      <select
                        id="category"
                        name="category"
                        className={`${inputClass} flex-grow ${errors.category ? 'border-red-500' : ''}`}
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        <option value="" disabled>Select a category</option>
                        {categories.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <button 
                        type="button"
                        className="bg-blue-100 text-blue-700 p-2 rounded-md hover:bg-blue-200 flex items-center justify-center"
                        onClick={() => setShowAddCategory(true)}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                    {errors.category && <p className={errorClass}>{errors.category}</p>}
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter new category"
                        className={`${inputClass} flex-grow ${categoryError ? 'border-red-500' : ''}`}
                        value={newCategory}
                        onChange={(e) => {
                          setNewCategory(e.target.value);
                          setCategoryError("");
                        }}
                      />
                      <button
                        type="button"
                        className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 flex items-center justify-center"
                        onClick={handleAddCategory}
                      >
                        <Plus size={20} />
                      </button>
                      <button
                        type="button"
                        className="bg-gray-200 text-gray-700 p-2 rounded-md hover:bg-gray-300 flex items-center justify-center"
                        onClick={() => {
                          setShowAddCategory(false);
                          setNewCategory("");
                          setCategoryError("");
                        }}
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                    {categoryError && <p className={errorClass}>{categoryError}</p>}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div>
                <label htmlFor="rating" className={labelClass}>
                  Product Rating
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="rating"
                    name="rating"
                    min="0"
                    max="5"
                    step="0.5"
                    className={`${inputClass} w-20`}
                    value={formData.rating}
                    onChange={handleChange}
                  />
                  <div className="ml-3 flex text-yellow-400 text-lg">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star}>
                        {formData.rating >= star ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="ml-2 text-gray-500 text-sm">
                    ({formData.rating.toFixed(1)})
                  </span>
                </div>
              </div>
            </div>

            {/* Right column - Image upload */}
            <div className="w-full md:w-5/12 mt-4 md:mt-0">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700 font-medium mb-2">Product Image</p>

                {imagePreview ? (
                  <div className="relative w-full h-48 mb-3">
                    <Image
                      src={imagePreview}
                      alt="Product preview"
                      fill
                      className="object-contain"
                    />
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-black bg-opacity-20 hover:bg-opacity-50 text-white p-1 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-gray-100 mb-3"
                    onClick={triggerFileInput}
                  >
                    <Upload className="h-10 w-10 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      Click to upload product image
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                <button
                  type="button"
                  className={`w-full py-2 px-4 rounded-md text-sm font-medium ${
                    imagePreview
                      ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-300"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300"
                  }`}
                  onClick={imagePreview ? handleRemoveImage : triggerFileInput}
                >
                  <span className="flex items-center justify-center">
                    {imagePreview ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" /> Remove Image
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" /> Upload Image
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

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
      </div>
    </div>
  );
};

export default CreateProductModal;