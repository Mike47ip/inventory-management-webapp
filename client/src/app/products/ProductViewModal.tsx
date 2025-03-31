"use client";

import { 
  Modal, 
  Box, 
  Typography, 
  Backdrop, 
  Fade,
  Button
} from "@mui/material";
import Image from "next/image";
import Rating from "@/app/(components)/Rating";

// Product type definition
export type Product = {
  productId: string;
  name: string;
  price: number;
  currency?: string;
  stockQuantity: number;
  stockUnit?: string;
  rating?: number;
  category?: string;
  image?: string;
};

// Product Units stored in localStorage
export type ProductUnitsMap = {
  [productId: string]: string;
};

// Currency symbols mapping
export const currencySymbols: { [key: string]: string } = {
  'GHC': '₵',
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CAD': 'C$',
  // Add more as needed
};

// Get default unit by category
export const getCategoryDefaultUnit = (category?: string): string => {
  if (!category) return "Units";
  
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes("food") || categoryLower.includes("beverage")) {
    return "Kg";
  } else if (categoryLower.includes("clothing")) {
    return "Pieces";
  } else if (categoryLower.includes("electronics")) {
    return "Units";
  }
  
  return "Units"; // Default fallback
};

interface ProductViewModalProps {
  open: boolean;
  handleClose: () => void;
  product: Product | null;
  productUnits: ProductUnitsMap;
}

const ProductViewModal: React.FC<ProductViewModalProps> = ({
  open,
  handleClose,
  product,
  productUnits,
}) => {
  if (!product) return null;

  // Function to get unit for a product (prefer database value, fallback to localStorage or category default)
  const getProductUnit = (product: Product): string => {
    return product.stockUnit || productUnits[product.productId] || getCategoryDefaultUnit(product.category);
  };

  // Format stock display with unit
  const formatStockDisplay = (product: Product): string => {
    const unit = getProductUnit(product);
    return `${product.stockQuantity} ${unit}`;
  };

  // Format price with currency (prefer database value, fallback to USD)
  const formatPrice = (product: Product): string => {
    const currency = product.currency || 'USD';
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${product.price.toFixed(2)}`;
  };

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

              {/* Price with Currency */}
              <Typography 
                variant="h5" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 500,
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                {formatPrice(product)}
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
                        bgcolor: product.stockQuantity >= 50 ? 'success.light' : 'error.light',
                        color: product.stockQuantity >= 50 ? 'success.dark' : 'error.dark',
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}
                    >
                      {product.stockQuantity >= 100 ? 'In Stock' : 'Low Stock'}
                    </Box>
                    <Typography variant="body1">
                      {formatStockDisplay(product)}
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

              {/* Currency */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Currency
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {product.currency || 'USD'}
                </Typography>
              </Box>

              {/* Stock Unit */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Stock Unit
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {getProductUnit(product)}
                </Typography>
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

export default ProductViewModal;