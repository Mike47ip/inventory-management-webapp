// components/inventory/ProductDetailModal.tsx
import React from 'react';
import Image from "next/image";
import {
  Box,
  Button,
  Modal,
  Typography,
  Paper,
  Chip,
  Rating as MuiRating,
} from "@mui/material";
import { Star, StarBorder } from "@mui/icons-material";
import { Product } from "@/state/api";
import { formatStockDisplay } from '../types/productTypes';

interface ProductDetailModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
  featuredProducts: Set<string>;
  toggleFeatured: (productId: string) => void;
  getProductUnit: (product: Product) => string;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  open,
  onClose,
  product,
  featuredProducts,
  toggleFeatured,
  getProductUnit,
}) => {
  if (!product) return null;
  
  const productUnit = getProductUnit(product);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="product-details-modal"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 600 },
          maxHeight: "90vh",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          overflow: "auto",
        }}
      >
        <Typography
          id="product-details-modal"
          variant="h5"
          component="h2"
          gutterBottom
        >
          Product Details
          {featuredProducts.has(product.productId) && (
            <Star sx={{ ml: 1, color: "gold", verticalAlign: "middle" }} />
          )}
        </Typography>

        <Paper elevation={0} sx={{ mt: 2, p: 2, bgcolor: "background.default" }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            {/* Product Image */}
            <Box
              sx={{
                flex: { md: '0 0 40%' },
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                m: 2,
              }}
            >
              <Image
                src={
                  product.image
                  ? `http://localhost:8000${product.image}`
                  : "/assets/default-image.png"
                }
                alt={product.name}
                width={200}
                height={200}
                style={{
                  objectFit: "contain",
                  borderRadius: "8px",
                  maxWidth: "100%",
                  height: "auto",
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/default-image.png";
                }}
              />
            </Box>

            {/* Product Details */}
            <Box sx={{ flex: '1 1 auto' }}>
              <Typography
                variant="h6"
                component="h3"
                gutterBottom
                fontWeight="bold"
              >
                {product.name}
              </Typography>

              <Box sx={{ mt: 2, mb: 3 }}>
                <MuiRating
                  value={product.rating || 0}
                  precision={0.5}
                  readOnly
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Rating: {product.rating || 0} / 5
                </Typography>
              </Box>

              <Typography
                variant="h6"
                color="primary"
                fontWeight="medium"
                sx={{ mb: 2 }}
              >
                ${product.price.toFixed(2)}
              </Typography>

              {/* Category and Stock Side by Side */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2, gap: 2 }}>
                <Box sx={{ flex: '1 1 40%', minWidth: '120px' }}>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {product.category || "Uncategorized"}
                  </Typography>
                </Box>
                <Box sx={{ flex: '1 1 40%', minWidth: '120px' }}>
                  <Typography variant="body2" color="text.secondary">
                    Stock Quantity
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color:
                          product.stockQuantity >= 50
                            ? "success.main"
                            : "error.main",
                        fontWeight: "medium",
                      }}
                    >
                      {formatStockDisplay(product, productUnit)}
                    </Typography>
                    <Chip
                      label={
                        product.stockQuantity >= 50
                          ? "In Stock"
                          : "Low Stock"
                      }
                      color={
                        product.stockQuantity >= 100 ? "success" : "error"
                      }
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Box>
              </Box>
              
              {/* Stock Unit section */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Stock Unit
                </Typography>
                <Typography variant="body1">
                  {productUnit}
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Product ID
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                {product.productId}
              </Typography>

              {/* Featured toggle in product view */}
              <Box sx={{ mt: 3, display: "flex", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Featured Status:
                </Typography>
                <Button
                  startIcon={
                    featuredProducts.has(product.productId) ? (
                      <Star sx={{ color: "gold" }} />
                    ) : (
                      <StarBorder />
                    )
                  }
                  variant="outlined"
                  size="small"
                  onClick={() => toggleFeatured(product.productId)}
                  sx={{ ml: 2 }}
                >
                  {featuredProducts.has(product.productId)
                    ? "Remove Featured"
                    : "Mark as Featured"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ProductDetailModal;