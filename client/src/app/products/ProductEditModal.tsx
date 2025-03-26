import { useState, useEffect } from "react";
import { Modal, Box, TextField, Button, Typography } from "@mui/material";
import Image from "next/image";

// Custom type for update parameters
type UpdateProductParams = {
 productId: string;
 formData: FormData;
};

// Product type (matching your API slice)
type Product = {
 productId: string;
 name: string;
 price: number;
 stockQuantity: number;
 rating?: number;
 category?: string;
 image?: string;
};

const ProductEditModal = ({
 open,
 handleClose,
 product,
 onUpdate,
}: {
 open: boolean;
 handleClose: () => void;
 product: Product | null;
 onUpdate: (params: UpdateProductParams) => Promise<void>; // Explicitly typed
}) => {
 // State for edited product details
 const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});

 // State for image handling
 const [imageFile, setImageFile] = useState<File | null>(null);
 const [imagePreview, setImagePreview] = useState<string | null>(null);

 // Initialize form when product changes
 useEffect(() => {
  if (product) {
   // Deep copy of product to avoid direct mutation
   setEditedProduct({
    ...product,
    price: product.price,
    stockQuantity: product.stockQuantity,
   });

   // Set image preview
   setImagePreview(
    product.image ? `http://localhost:8000${product.image}` : null
   );

   // Reset image file
   setImageFile(null);
  }
 }, [product, open]);

 // Clean up object URLs
 useEffect(() => {
  return () => {
   if (imagePreview && imagePreview.startsWith("blob:")) {
    URL.revokeObjectURL(imagePreview);
   }
  };
 }, [imagePreview]);

 // Handle input changes
 const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;

  setEditedProduct((prev) => ({
   ...prev,
   [name]: ["price", "stockQuantity", "rating"].includes(name)
    ? value === ""
      ? undefined
      : Number(value)
    : value,
  }));
 };

 // Handle image file selection
 const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files?.[0]) {
   const file = e.target.files[0];
   setImageFile(file);

   // Create preview URL
   const previewUrl = URL.createObjectURL(file);
   setImagePreview(previewUrl);
  }
 };

 // Submit handler
 const handleSubmit = async () => {
  // Validate required fields
  if (!product?.productId) {
   console.error("[ERROR] Missing productId");
   console.log("[DEBUG] handleSubmit triggered");
   console.log("[DEBUG] Current product:", product);
   alert("Product not properly loaded");
   return;
  }

  // Validate required fields
  if (!editedProduct.name || editedProduct.price === undefined) {
   alert("Please fill in all required fields");
   return;
  }

  try {
   // Create FormData for submission
   const formData = new FormData();

   // Append all edited fields
   formData.append("name", editedProduct.name);
   formData.append("price", String(editedProduct.price));
   formData.append("stockQuantity", String(editedProduct.stockQuantity));

   // Optional fields
   if (editedProduct.category) {
    formData.append("category", editedProduct.category);
   }

   if (editedProduct.rating !== undefined) {
    formData.append("rating", String(editedProduct.rating));
   }

   // Append image if a new file is selected
   if (imageFile) {
    formData.append("image", imageFile);
   }

   // Call update with productId and formData
   await onUpdate({
    productId: product.productId,
    formData,
   });

   // Close modal after successful update
   handleClose();
  } catch (error) {
   console.error("[ERROR] Update failed:", error);
   alert("Failed to update product");
  }
 };

 // Render nothing if no product is selected
 if (!product) return null;

 return (
  <Modal open={open} onClose={handleClose} aria-labelledby="edit-product-modal">
   <Box
    sx={{
     position: "absolute",
     top: "50%",
     left: "50%",
     transform: "translate(-50%, -50%)",
     width: "90%",
     maxWidth: 500,
     bgcolor: "background.paper",
     border: "2px solid #000",
     boxShadow: 24,
     p: 4,
     borderRadius: 1,
     maxHeight: "90vh",
     overflowY: "auto",
    }}
   >
    <Typography variant="h6" component="h2" sx={{ textAlign: "center", mb: 3 }}>
     Edit Product
    </Typography>

    <Box
     component="form"
     sx={{ display: "flex", flexDirection: "column", gap: 3 }}
    >
     <TextField
      fullWidth
      required
      label="Product Name"
      name="name"
      value={editedProduct.name || ""}
      onChange={handleChange}
      variant="outlined"
     />

     <TextField
      fullWidth
      required
      label="Price"
      name="price"
      type="number"
      inputProps={{ step: "0.01", min: 0 }}
      value={editedProduct.price ?? ""}
      onChange={handleChange}
      variant="outlined"
     />

     <TextField
      fullWidth
      required
      label="Stock Quantity"
      name="stockQuantity"
      type="number"
      inputProps={{ min: 0 }}
      value={editedProduct.stockQuantity ?? ""}
      onChange={handleChange}
      variant="outlined"
      disabled={true}
      className="cursor-not-allowed"
      sx={{
       "& .MuiInputBase-root.Mui-disabled": {
        cursor: "not-allowed", // This adds the disabled cursor
        "& .MuiInputBase-input": {
         color: "rgba(0, 0, 0, 0.6)",
         WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
        },
       },
      }}
     />

     <TextField
      fullWidth
      label="Category"
      name="category"
      value={editedProduct.category || ""}
      onChange={handleChange}
      variant="outlined"
     />

     <TextField
      fullWidth
      label="Rating"
      name="rating"
      type="number"
      inputProps={{ min: 0, max: 5, step: "0.1" }}
      value={editedProduct.rating ?? ""}
      onChange={handleChange}
      variant="outlined"
     />

     <div>
      <Typography component="label" variant="body2" display="block" mb={1}>
       Product Image
      </Typography>
      <input
       type="file"
       id="image-upload"
       accept="image/*"
       onChange={handleImageChange}
       style={{ width: "100%" }}
      />
      {imagePreview && (
       <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Image
         src={imagePreview}
         alt="Product Preview"
         width={150}
         height={150}
         style={{ objectFit: "contain" }}
        />
       </Box>
      )}
     </div>

     <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
      <Button
       variant="contained"
       color="primary"
       onClick={handleSubmit}
       disabled={!editedProduct.name || editedProduct.price === undefined}
      >
       Update Product
      </Button>
      <Button variant="outlined" color="secondary" onClick={handleClose}>
       Cancel
      </Button>
     </Box>
    </Box>
   </Box>
  </Modal>
 );
};

export default ProductEditModal;
