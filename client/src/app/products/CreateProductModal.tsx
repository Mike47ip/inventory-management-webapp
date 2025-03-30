import React, { ChangeEvent, FormEvent, useState, useRef } from "react";
import { XCircle, Upload, Plus } from "lucide-react";
import Image from "next/image";

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
  category: string;
  image: File | null;
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: ProductFormData) => Promise<void>;
  // Optional prop to allow the parent component to receive the updated categories
  onCategoriesUpdate?: (categories: string[]) => void;
};

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
  "Other"
];

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
  onCategoriesUpdate
}: CreateProductModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for category management
  const [categoryOptions, setCategoryOptions] = useState<string[]>(initialCategoryOptions);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [categoryError, setCategoryError] = useState("");
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: 0,
    stockQuantity: 0,
    rating: 0,
    category: "",
    image: null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
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
    // Validate new category
    if (!newCategory.trim()) {
      setCategoryError("Category name cannot be empty");
      return;
    }

    // Check if category already exists (case-insensitive)
    if (categoryOptions.some(cat => cat.toLowerCase() === newCategory.trim().toLowerCase())) {
      setCategoryError("This category already exists");
      return;
    }

    // Add the new category to options
    const updatedCategories = [...categoryOptions, newCategory.trim()];
    setCategoryOptions(updatedCategories);
    
    // Set the new category as the selected one
    setFormData({
      ...formData,
      category: newCategory.trim()
    });
    
    // Reset the new category input and hide the add form
    setNewCategory("");
    setShowAddCategory(false);
    setCategoryError("");
    
    // Notify parent component if callback exists
    if (onCategoriesUpdate) {
      onCategoriesUpdate(updatedCategories);
    }
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
      await onCreate(formData);
      
      // Reset form
      setFormData({
        name: "",
        price: 0,
        stockQuantity: 0,
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
      stockQuantity: 0,
      rating: 0,
      category: "",
      image: null,
    });
    setImagePreview(null);
    setErrors({});
    setShowAddCategory(false);
    setNewCategory("");
    setCategoryError("");
    
    onClose();
  };

  if (!isOpen) return null;

  // Tailwind classes for form elements
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const inputClass = "w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500";
  const errorClass = "text-red-500 text-xs mt-1";
  const helpTextClass = "text-gray-500 text-xs mt-1";

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

              {/* Price and Stock Quantity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className={labelClass}>
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      $
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

                <div>
                  <label htmlFor="stockQuantity" className={labelClass}>
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
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
                  <p className={helpTextClass}>0 means product is out of stock</p>
                </div>
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
                        {categoryOptions.map((option) => (
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