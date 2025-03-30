import { useState, useEffect } from "react";
import { Modal, Box, TextField, Button, Typography, MenuItem, FormControl, InputLabel, Select, Chip } from "@mui/material";
import Image from "next/image";
import { useCategories } from "@/app/(context)/CategoryContext";
import { Add as AddIcon } from "@mui/icons-material";

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
 // Get categories from context
 const { categories, addCategory } = useCategories();

 // State for edited product details
 const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});

 // State for image handling
 const [imageFile, setImageFile] = useState<File | null>(null);
 const [imagePreview, setImagePreview] = useState<string | null>(null);

 // State for new category handling
 const [showAddCategory, setShowAddCategory] = useState(false);
 const [newCategory, setNewCategory] = useState("");
 const [categoryError, setCategoryError] = useState("");

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
   
   // Reset category states
   setShowAddCategory(false);
   setNewCategory("");
   setCategoryError("");
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

 // Handle select changes
 const handleSelectChange = (e: any) => {
  const { name, value } = e.target;
  
  setEditedProduct((prev) => ({
   ...prev,
   [name]: value,
  }));
 };

 // Handle new category addition
 const handleAddNewCategory = () => {
  // Validate new category
  if (!newCategory.trim()) {
   setCategoryError("Category name cannot be empty");
   return;
  }

  // Check if category already exists (case-insensitive)
  if (categories.some(cat => cat.toLowerCase() === newCategory.trim().toLowerCase())) {
   setCategoryError("This category already exists");
   return;
  }

  try {
   // Add the new category using the context
   addCategory(newCategory.trim());
   
   // Set the new category as the selected one
   setEditedProduct(prev => ({
    ...prev,
    category: newCategory.trim()
   }));
   
   // Reset the new category input and hide the add form
   setNewCategory("");
   setShowAddCategory(false);
   setCategoryError("");
  } catch (error) {
   console.error("Error adding category:", error);
   setCategoryError("Failed to add category");
  }
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

     {/* Category Selection with Add New Category Option */}
     {!showAddCategory ? (
       <FormControl fullWidth>
         <InputLabel id="category-select-label">Category</InputLabel>
         <Select
           labelId="category-select-label"
           id="category-select"
           name="category"
           value={editedProduct.category || ""}
           label="Category"
           onChange={handleSelectChange}
           endAdornment={
             <Button 
               size="small"
               sx={{ minWidth: 'auto', mr: 2 }}
               onClick={(e) => {
                 e.stopPropagation();
                 setShowAddCategory(true);
               }}
             >
               <AddIcon fontSize="small" />
             </Button>
           }
         >
           <MenuItem value="">
             <em>None</em>
           </MenuItem>
           {categories.map((category) => (
             <MenuItem key={category} value={category}>
               {category}
             </MenuItem>
           ))}
         </Select>
       </FormControl>
     ) : (
       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
         <Typography variant="body2">Add New Category</Typography>
         <Box sx={{ display: 'flex', gap: 1 }}>
           <TextField
             fullWidth
             size="small"
             placeholder="Enter new category name"
             value={newCategory}
             onChange={(e) => {
               setNewCategory(e.target.value);
               setCategoryError("");
             }}
             error={!!categoryError}
             helperText={categoryError}
           />
           <Button
             variant="contained"
             color="primary"
             size="small"
             onClick={handleAddNewCategory}
           >
             Add
           </Button>
           <Button
             variant="outlined"
             size="small"
             onClick={() => {
               setShowAddCategory(false);
               setNewCategory("");
               setCategoryError("");
             }}
           >
             Cancel
           </Button>
         </Box>
       </Box>
     )}

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