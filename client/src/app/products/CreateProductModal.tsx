import React, { ChangeEvent, FormEvent, useState } from "react";
import Header from "@/app/(components)/Header";

type ProductFormData = {
  name: string;
  price: number;
  stockQuantity: number;
  rating: number;
  category: string;
  image: File | null; // Ensure image is File or null
};

type CreateProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: ProductFormData) => void;
};

const CreateProductModal = ({
  isOpen,
  onClose,
  onCreate,
}: CreateProductModalProps) => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: 0,
    stockQuantity: 0,
    rating: 0,
    category: "",
    image: null, // Default to null
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        image: files[0], // Assign the first selected file
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "price" || name === "stockQuantity" || name === "rating"
            ? parseFloat(value)
            : value,
      }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreate(formData);
    onClose();
  };

  if (!isOpen) return null;

  const labelCssStyles = "block text-sm font-medium text-gray-700";
  const inputCssStyles =
    "block w-full mb-2 p-2 border-gray-500 border-2 rounded-md";

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-20">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <Header name="Create New Product" />
        <form onSubmit={handleSubmit} className="mt-5">
          {/* PRODUCT NAME */}
          <label htmlFor="name" className={labelCssStyles}>
            Product Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={formData.name}
            className={inputCssStyles}
            required
          />

          {/* PRICE */}
          <label htmlFor="price" className={labelCssStyles}>
            Price
          </label>
          <input
            type="number"
            name="price"
            placeholder="Price"
            onChange={handleChange}
            value={formData.price}
            className={inputCssStyles}
            required
          />

          {/* STOCK QUANTITY */}
          <label htmlFor="stockQuantity" className={labelCssStyles}>
            Stock Quantity
          </label>
          <input
            type="number"
            name="stockQuantity"
            placeholder="Stock Quantity"
            onChange={handleChange}
            value={formData.stockQuantity}
            className={inputCssStyles}
            required
          />

          {/* RATING */}
          <label htmlFor="rating" className={labelCssStyles}>
            Rating
          </label>
          <input
            type="number"
            name="rating"
            placeholder="Rating"
            onChange={handleChange}
            value={formData.rating}
            className={inputCssStyles}
            required
          />

          {/* CATEGORY */}
          <label htmlFor="category" className={labelCssStyles}>
            Category
          </label>
          <input
            type="text"
            name="category"
            placeholder="Category"
            onChange={handleChange}
            value={formData.category}
            className={inputCssStyles}
            required
          />

          {/* IMAGE */}
          <label htmlFor="image" className={labelCssStyles}>
            Product Image
          </label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            className={inputCssStyles}
            accept="image/*"
            required
          />

          {/* CREATE ACTIONS */}
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
          <button
            onClick={onClose}
            type="button"
            className="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProductModal;
