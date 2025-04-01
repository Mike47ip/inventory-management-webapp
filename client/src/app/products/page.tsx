"use client";

import { useState, useEffect } from "react";
import {
 useCreateProductMutation,
 useGetProductsQuery,
 useUpdateProductMutation,
} from "@/state/api";
import {
 PlusCircleIcon,
 SearchIcon,
 MoreHorizontal,
 ArchiveIcon,
} from "lucide-react";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";
import Image from "next/image";
import ProductEditModal from "./ProductEditModal";
import {
 archiveProduct,
 unarchiveProduct,
 getArchivedProducts,
} from "@/utils/archive";
import Link from "next/link";
// Import the extracted ProductViewModal component
import ProductViewModal, {
 Product,
 ProductUnitsMap,
 getCategoryDefaultUnit,
 currencySymbols,
} from "./ProductViewModal";

// Updated type definition to include currency and stockUnit
type ProductFormData = {
 name: string;
 price: number;
 currency: string;
 stockQuantity: number;
 stockUnit: string;
 rating: number;
 category: string;
 image: File | null;
};

const LOCAL_STORAGE_UNITS_KEY = "productStockUnits";

const Products = () => {
 const [searchTerm, setSearchTerm] = useState("");
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
 const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
 const [isViewModalOpen, setIsViewModalOpen] = useState(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [archivedIds, setArchivedIds] = useState<string[]>(
  getArchivedProducts()
 );

 // Store product units in local state and localStorage (for backward compatibility)
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

 // Save product unit to localStorage (for backward compatibility)
 const saveProductUnit = (productId: string, unit: string) => {
  const updatedUnits = { ...productUnits, [productId]: unit };
  setProductUnits(updatedUnits);

  try {
   localStorage.setItem(LOCAL_STORAGE_UNITS_KEY, JSON.stringify(updatedUnits));
  } catch (error) {
   console.error("Error saving product units to localStorage:", error);
  }
 };

 // Get unit for a product (prefer database value, fallback to localStorage or default)
 const getProductUnit = (product: Product): string => {
  return (
   product.stockUnit ||
   productUnits[product.productId] ||
   getCategoryDefaultUnit(product.category)
  );
 };

 // Format stock display with unit
 const formatStockDisplay = (product: Product): string => {
  const unit = getProductUnit(product);
  return `${product.stockQuantity} ${unit}`;
 };

 // Format price with currency
 const formatPrice = (product: Product): string => {
  const currency = product.currency || "GHC";
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${product.price.toFixed(2)}`;
 };

 const handleArchiveProduct = (productId: string) => {
  archiveProduct(productId);
  setArchivedIds([...archivedIds, productId]);
 };

 const handleUnarchiveProduct = (productId: string) => {
  unarchiveProduct(productId);
  setArchivedIds(archivedIds.filter((id) => id !== productId));
 };

 const {
  data: products,
  isLoading,
  isError,
  refetch,
 } = useGetProductsQuery(searchTerm);
 // Filter products in your render
 const activeProducts = products?.filter(
  (product) => !archivedIds.includes(product.productId)
 );
 const archivedProducts =
  products?.filter((product) => archivedIds.includes(product.productId)) || []; // Fallback to empty array

 const [createProduct] = useCreateProductMutation();
 const [updateProduct] = useUpdateProductMutation();

 const handleCreateProduct = async (productData: ProductFormData) => {
  try {
   const formData = new FormData();
   formData.append("name", productData.name);
   formData.append("price", productData.price.toString());
   formData.append("currency", productData.currency || "GHC");
   formData.append("stockQuantity", productData.stockQuantity.toString());
   formData.append("stockUnit", productData.stockUnit || "Units");
   formData.append("rating", (productData.rating || 0).toString());
   formData.append("category", productData.category);

   if (productData.image) {
    formData.append("image", productData.image);
   }

   // Send the formData to the backend
   await createProduct(formData).unwrap();

   // Close the modal
   setIsCreateModalOpen(false);

   // Reset form state (moved to onClose logic in CreateProductModal)
  } catch (error) {
   console.error("Failed to create product", error);
   // Optionally, show an error toast or message to the user
   // You might want to add error handling UI in the modal
   throw error; // Re-throw to allow modal to handle error state
  }
 };

 const handleUpdateProduct = async ({
  productId,
  formData,
 }: {
  productId: string;
  formData: FormData;
 }) => {
  try {
   // Send the update to the backend
   await updateProduct({ productId, updateData: formData }).unwrap();
   refetch();
  } catch (error) {
   console.error("Failed to update product", error);
  } finally {
   setIsEditModalOpen(false);
   setSelectedProduct(null);
  }
 };

 const handleViewProduct = (product: Product) => {
  setSelectedProduct(product);
  setIsViewModalOpen(true);
  setDropdownVisible(null);
 };

 const handleEditProduct = (product: Product) => {
  setSelectedProduct(product);
  setIsEditModalOpen(true);
  setDropdownVisible(null);
 };

 if (isLoading) {
  return <div className="py-4">Loading...</div>;
 }

 if (isError || !products) {
  return (
   <div className="text-center text-red-500 py-4">Failed to fetch products</div>
  );
 }

 return (
  <div className="mx-auto pb-5 w-full">
   {/* SEARCH BAR */}
   <div className="mb-6">
    <div className="flex items-center border-2 border-gray-200 rounded">
     <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
     <input
      className="w-full py-2 px-4 rounded bg-white"
      placeholder="Search products..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
     />
    </div>
   </div>

   {/* HEADER BAR */}
   <div className="flex flex-col md:flex-row text-xs lg:text-base md:justify-between items-center mb-6">
    <Header name="Products" />
    <div className="flex justify-between items-center gap-2">
     <Link
      href="/products/archive"
      className="flex items-center bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded relative"
     >
      <ArchiveIcon className="w-5 h-5 mr-2" />
      View Archive
      {archivedProducts.length > 0 && (
       <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
        {archivedProducts.length}
       </span>
      )}
     </Link>
     <button
      className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
      onClick={() => setIsCreateModalOpen(true)}
     >
      <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Create Product
     </button>
    </div>
   </div>

   {/* BODY PRODUCTS LIST */}
   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 justify-between">
    {activeProducts?.map((product, index) => (
     <div
      key={product.productId}
      className="border shadow rounded-md p-4 max-w-full w-full mx-auto relative"
     >
      {/* More Options Icon positioned in top-right corner */}
      <MoreHorizontal
       className="absolute top-2 right-2 text-gray-400 cursor-pointer"
       onClick={() =>
        setDropdownVisible(dropdownVisible === index ? null : index)
       }
      />

      {/* Dropdown Menu */}
      {dropdownVisible === index && (
       <div className="absolute top-8 w-24 font-semibold right-2 bg-white shadow rounded-md z-10">
        <button
         className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
         onClick={() => handleViewProduct(product)}
        >
         View
        </button>
        <button
         className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
         onClick={() => handleEditProduct(product)}
        >
         Edit
        </button>
        <button
         className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-100"
         onClick={() =>
          archivedIds.includes(product.productId)
           ? handleUnarchiveProduct(product.productId)
           : handleArchiveProduct(product.productId)
         }
        >
         {archivedIds.includes(product.productId) ? "Unarchive" : "Archive"}
        </button>
       </div>
      )}

      <div className="flex flex-col items-center">
       <Image
        src={
         product.image
          ? `http://localhost:8000${product.image}`
          : "/assets/default-image.png"
        }
        alt={product.name}
        width={150}
        height={150}
        className="mb-3 rounded-2xl w-36 h-36 object-contain"
        onError={(e) => {
         (e.target as HTMLImageElement).src = "/assets/default-image.png";
        }}
       />
       <h3 className="text-lg text-gray-900 font-semibold">{product.name}</h3>
       <p className="text-gray-800">{formatPrice(product)}</p>
       <div className="text-sm flex flex-col gap-1 items-center text-gray-600 mt-1">
        Stock:{" "}
        <span
         className={`font-bold p-2 rounded-2xl ${
          product.stockQuantity < 50
           ? "bg-red-100 text-red-800"
           : "bg-green-100 text-green-800"
         }`}
        >
         {formatStockDisplay(product)}
        </span>
        <div className="flex flex-row justify-center">
        <Rating rating={product.rating ?? 0} />
       </div>
       </div>

      </div>
     </div>
    ))}
   </div>

   {/* CREATE PRODUCT MODAL */}
   <CreateProductModal
    isOpen={isCreateModalOpen}
    onClose={() => setIsCreateModalOpen(false)}
    onCreate={handleCreateProduct}
   />

   {/* PRODUCT VIEW MODAL - Now imported from separate file */}
   <ProductViewModal
    open={isViewModalOpen}
    handleClose={() => setIsViewModalOpen(false)}
    product={selectedProduct}
    productUnits={productUnits}
   />

   {/* PRODUCT EDIT MODAL */}
   <ProductEditModal
    open={isEditModalOpen}
    handleClose={() => {
     setIsEditModalOpen(false);
     setSelectedProduct(null);
    }}
    product={
     selectedProduct
      ? {
         ...selectedProduct,
         currency: selectedProduct.currency || "USD", // Use database value or default
         stockUnit:
          selectedProduct.stockUnit || getProductUnit(selectedProduct), // Use database value or fallback
        }
      : null
    }
    onUpdate={handleUpdateProduct}
   />
  </div>
 );
};

export default Products;
