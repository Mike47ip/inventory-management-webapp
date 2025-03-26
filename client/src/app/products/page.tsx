"use client";

import { useState } from "react";
import { 
  Modal, 
  Box, 
  Typography, 
  Backdrop, 
  Fade 
} from "@mui/material";
import { useCreateProductMutation, useGetProductsQuery } from "@/state/api";
import { PlusCircleIcon, SearchIcon, MoreHorizontal } from "lucide-react";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";
import Image from "next/image";

type ProductFormData = {
 name: string;
 price: number;
 stockQuantity: number;
 rating: number;
 category: string;
 image: File | null;
};

type Product = {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  rating?: number;
  category?: string;
  image?: string;
};

const ProductViewModal = ({ 
  open, 
  handleClose, 
  product 
}: { 
  open: boolean, 
  handleClose: () => void, 
  product: Product | null 
}) => {
  if (!product) return null;

  return (
    <Modal
      open={open}

      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={open}>
        <Box className="
        fixed 
        lg:flex
        lg:!items-center
        lg:!justify-center
        top-1/2 
        left-1/2 
        transform 
        -translate-x-1/2 
        -translate-y-1/2 
        w-[90%] 
        md:w-full
        max-w-lg 
        md:max-w-2xl
        lg:max-w-4xl
        xl:max-w-6xl
        h-auto
        max-h-[80vh]
        lg:min-h-[450px]
        xl:min-h-[550px]
        bg-white 
        border-2 
        border-black 
        shadow-lg 
        p-4 
        rounded-md
        overflow-y-auto
  ">
          <div className="flex h-full w-full flex-col lg:flex-row justify-center items-center">
            <div className="flex justify-center rounded-2xl w-[50%] md:w-[60%] lg:w-[80%] object-contain">

            <Image
              src={
                product.image
                  ? `http://localhost:8000${product.image}`
                  : "/assets/default-image.png"
                }
                alt={product.name}
                width={200}
                height={200}
                className="max-w-full max-h-full object-contain w-full h-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/default-image.png";
                }}
                />
                </div>
                <div className="lg:flex lg:flex-col lg:gap-2 justify-end h-full">

            <Typography variant="h5" component="h2" className="text-center !text-4xl !font-semibold font-b mb-4">
              {product.name} 
            </Typography>
            <div className="text-center">
              <p className="text-xl font-semibold text-gray-800">
                ${product.price.toFixed(2)}
              </p>
              <div className="text-sm text-gray-600 mt-1">
                Stock: {product.stockQuantity}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Category: {product.category}
              </div>
            </div>
              <div className="flex flex-row justify-center  mt-2">
                <Rating rating={product.rating ?? 0} />
              </div>
              <span>{product.productId}</span>
                </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
};

const Products = () => {
 const [searchTerm, setSearchTerm] = useState("");
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

 const { data: products, isLoading, isError } = useGetProductsQuery(searchTerm);

 const [createProduct] = useCreateProductMutation();

 const handleCreateProduct = async (productData: ProductFormData) => {
  try {
   const formData = new FormData();
   formData.append("name", productData.name);
   formData.append("price", productData.price.toString());
   formData.append("stockQuantity", productData.stockQuantity.toString());
   formData.append("rating", productData.rating.toString());
   formData.append("category", productData.category);

   if (productData.image) {
    formData.append("image", productData.image);
   }

   await createProduct(formData);
   setIsModalOpen(false);
  } catch (error) {
   console.error("Failed to create product", error);
  }
 };

 const handleViewProduct = (product: Product) => {
  setSelectedProduct(product);
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
   <div className="flex justify-between items-center mb-6">
    <Header name="Products" />
    <button
     className="flex items-center bg-blue-500 hover:bg-blue-700 text-gray-200 font-bold py-2 px-4 rounded"
     onClick={() => setIsModalOpen(true)}
    >
     <PlusCircleIcon className="w-5 h-5 mr-2 !text-gray-200" /> Create Product
    </button>
   </div>

   {/* BODY PRODUCTS LIST */}
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-between">
    {products?.map((product, index) => (
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
        <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
         Edit
        </button>
        <button className="w-full px-4 py-2 text-sm text-red-500 hover:bg-red-100">
         Archive
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
       <p className="text-gray-800">${product.price.toFixed(2)}</p>
       <div className="text-sm text-gray-600 mt-1">
        Stock: {product.stockQuantity}
       </div>
       <Rating rating={product.rating ?? 0} />
      </div>
     </div>
    ))}
   </div>

   {/* CREATE PRODUCT MODAL */}
   <CreateProductModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onCreate={handleCreateProduct}
   />

   {/* PRODUCT VIEW MODAL */}
   <ProductViewModal
    open={!!selectedProduct}
    handleClose={() => setSelectedProduct(null)}
    product={selectedProduct}
   />
  </div>
 );
};

export default Products;