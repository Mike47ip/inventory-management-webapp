// components/inventory/GridColumns.tsx
import React from 'react';
import Image from "next/image";
import { GridColDef, GridRenderCellParams  } from "@mui/x-data-grid";
import {
  Box,
  IconButton,
  Chip,
  Tooltip,
  Rating as MuiRating,
} from "@mui/material";
import {
  Visibility,
  Star,
  StarBorder,
} from "@mui/icons-material";
import { Product } from "@/state/api";
import { formatStockDisplay } from '../types/productTypes';

type GetGridColumnsProps = {
  isDarkMode: boolean;
  featuredProducts: Set<string>;
  toggleFeatured: (productId: string) => void;
  getProductUnit: (product: Product) => string;
  handleViewProduct: (product: Product) => void;
};

export const getGridColumns = ({
  isDarkMode,
  featuredProducts,
  toggleFeatured,
  getProductUnit,
  handleViewProduct,
}: GetGridColumnsProps): GridColDef[] => {
  // Star rating renderer
  const renderStarRating = (rating: number = 0) => {
    return (
      <div className="flex justify-center">
        <MuiRating
          value={rating}
          readOnly
          precision={0.5}
          size="small"
          sx={{
            color: isDarkMode ? "#FFD700" : "#FFA000",
          }}
        />
      </div>
    );
  };

  return [
    {
      field: "featured",
      headerName: "⭐",
      width: 60,
      sortable: true,
      filterable: false,
      renderCell: (params) => {
        const isFeatured = featuredProducts.has(params.row.productId);
        return (
          <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                toggleFeatured(params.row.productId);
              }}
              size="small"
              sx={{
                color: isFeatured ? "gold" : "gray",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                "&:hover": {
                  bgcolor: "rgba(255, 215, 0, 0.1)",
                },
              }}
            >
              {isFeatured ? (
                <Star fontSize="small" />
              ) : (
                <StarBorder fontSize="small" />
              )}
            </IconButton>
          </Box>
        );
      },
      valueGetter: (value, row) => {
        if (!row) return 0;
        const id = row.productId?.toString() || '';
        return featuredProducts.has(id) ? 1 : 0;
      },
    },
    {
      field: "image",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Image
            src={
              params.row.image
                ? `http://localhost:8000${params.row.image}`
                : "/assets/default-image.png"
            }
            alt={params.row.name}
            width={50}
            height={50}
            style={{ objectFit: "contain", borderRadius: "4px" }}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/default-image.png";
            }}
          />
        </div>
      ),
      sortable: false,
      filterable: false,
    },
    { field: "productId", headerName: "ID", width: 120 },
    { field: "name", headerName: "Name", flex: 0.5 },
// Fix for the price column in GridColumns.tsx
{
  field: "price",
  headerName: "Price",
  flex: 0.4,
  headerAlign: "left",
  renderCell: (params) => {
    const product = params.row;
    // Get the currency symbol instead of the currency code
    const currencyCode = product.currency || 'GHC';
    const currencySymbols: Record<string, string> = {
      'GHC': '₵',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'JPY': '¥',
      'CAD': 'C$',
      'AUD': 'A$',
    };
    const symbol = currencySymbols[currencyCode] || '$';
    const price = typeof product.price === 'number' 
      ? product.price.toFixed(2) 
      : product.price;
    
    return (
      <div style={{ display: "flex", width: "100%" }}>
        {`${symbol} ${price}`}
      </div>
    );
  },
  // Keep valueGetter for sorting purposes
  valueGetter: (value, row) => {
    return row?.price || 0;
  },
},
    // Category column
    {
      field: "category",
      headerName: "Category",
      flex: 0.4,
      renderCell: (params) => {
        const category = params.value || "Uncategorized";
        
        return (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Chip 
              label={category} 
              size="small"
              variant="outlined"
              sx={{ 
                borderRadius: '4px',
                bgcolor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              }}
            />
          </div>
        );
      },
    },
    {
      field: "rating",
      headerName: "Rating",
      type: "number",
      flex: 0.4,
      renderCell: (params) => renderStarRating(params.value),
    },
    {
      field: "stockQuantity",
      headerName: "Stock Quantity",
      flex: 0.4,
      headerAlign: "right",
      renderCell: (params) => {
        // Determine style based on stock quantity
        const isHighStock = params.value >= 100;
        const product = params.row;
        const productUnit = getProductUnit(product);

        // Color values for light and dark mode
        const colors = isDarkMode
          ? {
              highBg: "rgba(46, 204, 113, 0.25)",
              highText: "#2ecc71",
              lowBg: "rgba(231, 76, 60, 0.25)",
              lowText: "#e74c3c",
            }
          : {
              highBg: "rgba(46, 204, 113, 0.15)",
              highText: "#27ae60",
              lowBg: "rgba(231, 76, 60, 0.15)",
              lowText: "#c0392b",
            };

        return (
          <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <Tooltip title={`${params.value} ${productUnit}`}>
              <span
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: isHighStock ? colors.highBg : colors.lowBg,
                  color: isHighStock ? colors.highText : colors.lowText,
                  fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: "16px",
                  fontFamily:
                    '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                  minWidth: "40px",
                  textAlign: "center",
                  height: "30px",
                }}
              >
                {formatStockDisplay(product, productUnit)}
              </span>
            </Tooltip>
          </div>
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Tooltip title="View Details">
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleViewProduct(params.row);
              }}
              size="small"
              sx={{
                color: "primary.main",
                "&:hover": {
                  bgcolor: "rgba(40, 100, 150, 0.08)",
                },
              }}
            >
              <Visibility />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
};