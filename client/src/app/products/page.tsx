"use client";

import { useState } from "react";
import { 
  Modal, 
  Box, 
  Typography, 
  Backdrop, 
  Fade,
  Button
} from "@mui/material";
import { 
  useCreateProductMutation, 
  useGetProductsQuery, 
  useUpdateProductMutation
} from "@/state/api";
import { PlusCircleIcon, SearchIcon, MoreHorizontal, ArchiveIcon } from "lucide-react";
import Header from "@/app/(components)/Header";
import Rating from "@/app/(components)/Rating";
import CreateProductModal from "./CreateProductModal";
import Image from "next/image";
import ProductEditModal from "./ProductEditModal";
import { archiveProduct, unarchiveProduct, getArchivedProducts } from "@/utils/archive";
import Link from "next/link";


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
  product,
}: {
  open: boolean;
  handleClose: () => void;
  product: Product | null;
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
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '90%', sm: '80%', md: '70%', lg: '60%' },
            maxWidth: '800px',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            p: { xs: 3, sm: 4 },
            overflow: 'auto'
          }}
        >
          <Typography variant="h5" component="h2" sx={{ 
            mb: 3, 
            fontWeight: 600, 
            color: 'text.primary',
            textAlign: { xs: 'center', md: 'left' } 
          }}>
            Product Details
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 3, md: 4 },
            alignItems: 'center',
            mb: 3
          }}>
            {/* Product Image */}
            <Box sx={{ 
              width: { xs: '100%', md: '40%' }, 
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Box
                sx={{
                  position: 'relative',
                  width: { xs: 200, sm: 250, md: 300 },
                  height: { xs: 200, sm: 250, md: 300 },
                  borderRadius: 2,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <Image
                  src={
                    product.image
                      ? `http://localhost:8000${product.image}`
                      : "/assets/default-image.png"
                  }
                  alt={product.name}
                  fill
                  style={{ objectFit: "contain" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/assets/default-image.png";
                  }}
                />
              </Box>
            </Box>

            {/* Product Info */}
            <Box sx={{ 
              width: { xs: '100%', md: '60%' },
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}>
              {/* Product Name */}
              <Typography variant="h4" component="h3" sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                textAlign: { xs: 'center', md: 'left' }
              }}>
                {product.name}
              </Typography>

              {/* Price */}
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 500,
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                ${product.price.toFixed(2)}
              </Typography>

              {/* Rating */}
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                justifyContent: { xs: 'center', md: 'flex-start' }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: { xs: 'center', md: 'flex-start' } 
                }}>
                  <Rating rating={product.rating ?? 0} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  ({product.rating?.toFixed(1) || '0.0'}/5)
                </Typography>
              </Box>

              {/* Divider */}
              <Box sx={{ 
                height: '1px', 
                width: '100%', 
                bgcolor: 'divider', 
                my: 1 
              }} />

              {/* Details */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {/* Stock Info */}
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Stock Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: product.stockQuantity >= 100 ? 'success.light' : 'error.light',
                        color: product.stockQuantity >= 100 ? 'success.dark' : 'error.dark',
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}
                    >
                      {product.stockQuantity >= 100 ? 'In Stock' : 'Low Stock'}
                    </Box>
                    <Typography variant="body1">
                      {product.stockQuantity} units
                    </Typography>
                  </Box>
                </Box>

                {/* Category */}
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {product.category || 'Uncategorized'}
                  </Typography>
                </Box>
              </Box>

              {/* Product ID */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Product ID
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: 'monospace',
                    bgcolor: 'background.default',
                    p: 1,
                    borderRadius: 1,
                    display: 'inline-block'
                  }}
                >
                  {product.productId}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Close Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleClose}
              sx={{ minWidth: '120px' }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};

const Products = () => {
 const [searchTerm, setSearchTerm] = useState("");
 const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
 const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
 const [isViewModalOpen, setIsViewModalOpen] = useState(false);
 const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [archivedIds, setArchivedIds] = useState<string[]>(getArchivedProducts());

 const handleArchiveProduct = (productId: string) => {
  archiveProduct(productId);
  setArchivedIds([...archivedIds, productId]);
};

 const handleUnarchiveProduct = (productId: string) => {
  unarchiveProduct(productId);
  setArchivedIds(archivedIds.filter(id => id !== productId));
};

const { data: products, isLoading, isError, refetch } = useGetProductsQuery(searchTerm);
// Filter products in your render
const activeProducts = products?.filter(product => !archivedIds.includes(product.productId));
const archivedProducts = products?.filter(product => 
  archivedIds.includes(product.productId)
) || []; // Fallback to empty array


 const [createProduct] = useCreateProductMutation();
 const [updateProduct] = useUpdateProductMutation();

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
   setIsCreateModalOpen(false);
   refetch();
  } catch (error) {
   console.error("Failed to create product", error);
  }
 };

const handleUpdateProduct = async ({ 
  productId, 
  formData 
}: { 
  productId: string; 
  formData: FormData 
}) => {
  try {
    await updateProduct({ productId,updateData: formData }).unwrap();
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
   <div className="flex justify-between items-center mb-6">
        <Header name="Products" />
        <div className="flex gap-2">
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
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-between">
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
      onClick={() => archivedIds.includes(product.productId) 
        ? handleUnarchiveProduct(product.productId)
        : handleArchiveProduct(product.productId)
      }
    >
      {archivedIds.includes(product.productId) ? 'Unarchive' : 'Archive'}
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
       <div className="flex flex-row justify-center">
        <Rating rating={product.rating ?? 0} />
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

   {/* PRODUCT VIEW MODAL */}
   <ProductViewModal
    open={isViewModalOpen}
    handleClose={() => setIsViewModalOpen(false)}
    product={selectedProduct}
   />

   {/* PRODUCT EDIT MODAL */}
   <ProductEditModal
    open={isEditModalOpen}
    handleClose={() => {
     setIsEditModalOpen(false);
     setSelectedProduct(null);
    }}
    product={selectedProduct}
    onUpdate={handleUpdateProduct}
   />
  </div>
 );
};

export default Products;