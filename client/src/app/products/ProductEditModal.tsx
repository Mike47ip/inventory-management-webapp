import { useState, useEffect } from "react";
import { Modal, Box, TextField, Button, Typography } from "@mui/material";
import Image from "next/image";

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
  onUpdate
}: {
  open: boolean;
  handleClose: () => void;
  product: Product | null;
  onUpdate: (formData: FormData) => Promise<void>;
}) => {
  const [editedProduct, setEditedProduct] = useState<Partial<Product>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      setEditedProduct({ ...product });
      setImagePreview(product.image || null);
      setImageFile(null);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({
      ...prev,
      [name]: ['price', 'stockQuantity', 'rating'].includes(name) 
        ? value === '' ? undefined : Number(value)
        : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSubmit = async () => {
    if (!editedProduct.name || editedProduct.price === undefined) {
      alert('Name and price are required');
      return;
    }

    try {
      const formData = new FormData();
      
      // Type-safe number handling
      const getNumberValue = (value: unknown, fieldName: string): number => {
        const num = Number(value);
        if (isNaN(num)) throw new Error(`Invalid ${fieldName} value`);
        return num;
      };

      formData.append("name", editedProduct.name);
      formData.append("price", getNumberValue(editedProduct.price, 'price').toString());
      formData.append("stockQuantity", 
        getNumberValue(editedProduct.stockQuantity, 'stock quantity').toString());
      
      if (editedProduct.rating !== undefined) {
        formData.append("rating", getNumberValue(editedProduct.rating, 'rating').toString());
      }
      
      if (editedProduct.category) {
        formData.append("category", editedProduct.category);
      }

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await onUpdate(formData);
      handleClose();
    } catch (error) {
      console.error('Update failed:', error);
      alert(error instanceof Error ? error.message : 'Update failed');
    }
  };

  if (!product) return null;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="edit-product-modal"
      aria-describedby="modal-to-edit-product-details"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: 500,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        borderRadius: 1,
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <Typography variant="h6" component="h2" sx={{ textAlign: 'center', mb: 3 }}>
          Edit Product
        </Typography>
        
        <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            fullWidth
            required
            label="Product Name"
            name="name"
            value={editedProduct.name || ''}
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
            value={editedProduct.price ?? ''}
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
            value={editedProduct.stockQuantity ?? ''}
            onChange={handleChange}
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Category"
            name="category"
            value={editedProduct.category || ''}
            onChange={handleChange}
            variant="outlined"
          />
          
          <TextField
            fullWidth
            label="Rating"
            name="rating"
            type="number"
            inputProps={{ min: 0, max: 5, step: "0.1" }}
            value={editedProduct.rating ?? ''}
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
              style={{ width: '100%' }}
            />
            {imagePreview && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Image
                  src={imagePreview}
                  alt="Product Preview"
                  width={150}
                  height={150}
                  style={{ objectFit: 'contain' }}
                />
              </Box>
            )}
          </div>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSubmit}
              disabled={!editedProduct.name || editedProduct.price === undefined}
            >
              Update Product
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleClose}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ProductEditModal;