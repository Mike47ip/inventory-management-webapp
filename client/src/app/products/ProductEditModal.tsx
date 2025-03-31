import { useState, useEffect } from "react";
import { 
  Modal, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Chip,
  Snackbar,
  Alert
} from "@mui/material";
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
  currency?: string;
  stockUnit?: string;
  rating?: number;
  category?: string;
  image?: string;
};

// Define currency and stock unit options
const CURRENCY_OPTIONS = [
  { value: 'GHC', label: 'Ghanaian Cedi (₵)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'CAD', label: 'Canadian Dollar (C$)' },
];

const STOCK_UNIT_OPTIONS = [
  { value: 'Units', label: 'Units' },
  { value: 'Kg', label: 'Kilograms' },
  { value: 'Liters', label: 'Liters' },
  { value: 'Meters', label: 'Meters' },
  { value: 'Pieces', label: 'Pieces' },
];

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
  
  // State for loading indicator
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for success notification - moved to document level
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      // Deep copy of product to avoid direct mutation
      setEditedProduct({
        ...product,
        price: product.price,
        stockQuantity: product.stockQuantity,
        currency: product.currency || 'GHC',
        stockUnit: product.stockUnit || 'Units',
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

  // Handle Snackbar close
  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSuccessSnackbar(false);
  };

  // Custom close handler to ensure snackbar remains visible
  const handleModalClose = () => {
    // Only close if we're not in the middle of submitting
    if (!isSubmitting) {
      handleClose();
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    // Validate required fields
    if (!product?.productId) {
      console.error("[ERROR] Missing productId");
      alert("Product not properly loaded");
      return;
    }

    // Validate required fields
    if (!editedProduct.name || editedProduct.price === undefined) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create FormData for submission
      const formData = new FormData();

      // Append all edited fields
      formData.append("name", editedProduct.name);
      formData.append("price", String(editedProduct.price));
      formData.append("stockQuantity", String(editedProduct.stockQuantity));
      formData.append("currency", editedProduct.currency || 'GHC');
      formData.append("stockUnit", editedProduct.stockUnit || 'Units');

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

      // Prepare success message before API call
      const productName = editedProduct.name || 'Product';
      
      // Call update with productId and formData
      await onUpdate({
        productId: product.productId,
        formData,
      });

      // Show success message
      setSuccessMessage(`Product "${productName}" successfully updated!`);
      setOpenSuccessSnackbar(true);
      
      // Reset form state after successful update
      setEditedProduct({});
      setImageFile(null);
      setImagePreview(null);
      setShowAddCategory(false);
      setNewCategory("");
      setCategoryError("");

      // Add delay before closing modal to ensure snackbar is displayed
      setTimeout(() => {
        handleClose();
        setIsSubmitting(false);
      }, 100);
      
    } catch (error) {
      console.error("[ERROR] Update failed:", error);
      alert("Failed to update product");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* The success snackbar is elevated to the document level, outside the modal */}
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ 
          zIndex: 9999, // Ensure it's above everything else
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Edit form */}
      <Modal 
        open={open} 
        onClose={handleModalClose} 
        aria-labelledby="edit-product-modal"
        disableAutoFocus
        disableEnforceFocus
      >
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
            {/* Product Name */}
            <TextField
              fullWidth
              required
              label="Product Name"
              name="name"
              value={editedProduct.name || ""}
              onChange={handleChange}
              variant="outlined"
            />

            {/* Price and Currency */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                required
                label="Price"
                name="price"
                type="number"
                value={editedProduct.price === undefined ? "" : editedProduct.price}
                onChange={handleChange}
                variant="outlined"
                sx={{ flex: 2 }}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 }
                }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="currency-label">Currency</InputLabel>
                <Select
                  labelId="currency-label"
                  name="currency"
                  value={editedProduct.currency || "GHC"}
                  onChange={handleSelectChange}
                  label="Currency"
                >
                  {CURRENCY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Stock Quantity and Unit */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                required
                label="Stock Quantity"
                name="stockQuantity"
                type="number"
                value={editedProduct.stockQuantity === undefined ? "" : editedProduct.stockQuantity}
                onChange={handleChange}
                variant="outlined"
                sx={{ flex: 2 }}
                InputProps={{
                  inputProps: { min: 0, step: 1 }
                }}
              />
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="stock-unit-label">Unit</InputLabel>
                <Select
                  labelId="stock-unit-label"
                  name="stockUnit"
                  value={editedProduct.stockUnit || "Units"}
                  onChange={handleSelectChange}
                  label="Unit"
                >
                  {STOCK_UNIT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Rating */}
            <TextField
              label="Rating (0-5)"
              name="rating"
              type="number"
              value={editedProduct.rating === undefined ? "" : editedProduct.rating}
              onChange={handleChange}
              variant="outlined"
              InputProps={{
                inputProps: { min: 0, max: 5, step: 0.1 }
              }}
            />

            {/* Category Selection */}
            <FormControl>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={editedProduct.category || ""}
                onChange={handleSelectChange}
                label="Category"
                endAdornment={
                  <Button
                    size="small"
                    onClick={() => setShowAddCategory(true)}
                    sx={{ minWidth: 'auto', mr: 1 }}
                  >
                    <AddIcon fontSize="small" />
                  </Button>
                }
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Add New Category Form */}
            {showAddCategory && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <TextField
                  label="New Category Name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  error={!!categoryError}
                  helperText={categoryError}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleAddNewCategory}
                  >
                    Add Category
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

            {/* Image Upload */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Product Image
              </Typography>
              
              {imagePreview && (
                <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
                  <Box
                    sx={{
                      position: "relative",
                      width: 200,
                      height: 200,
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={imagePreview}
                      alt={editedProduct.name || "Product image"}
                      layout="fill"
                      objectFit="contain"
                    />
                  </Box>
                </Box>
              )}
              
              <Button
                variant="outlined"
                component="label"
                fullWidth
              >
                {imagePreview ? "Change Image" : "Upload Image"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !editedProduct.name || editedProduct.price === undefined}
              >
                {isSubmitting ? "Updating..." : "Update Product"}
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleModalClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ProductEditModal;