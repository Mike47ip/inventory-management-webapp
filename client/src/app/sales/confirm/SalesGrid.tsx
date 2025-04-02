"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { Box, Button, Chip } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { CreditCard, Eye } from "lucide-react";

// Define types
type Product = {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  currency?: string;
  stockUnit?: string;
  category?: string;
  image?: string;
  rating?: number;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

type SaleData = {
  customer: Customer | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  note: string;
};

type GridRowData = {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stockUnit?: string;
  currency?: string;
  lineTotal: number;
  image?: string;
  product: Product;
  paymentMethod: string;
};

interface SalesGridProps {
  saleData: SaleData;
  onViewProduct: (product: Product) => void;
}

const SalesGrid: React.FC<SalesGridProps> = ({ saleData, onViewProduct }) => {
  // Currency symbols mapping
  const currencySymbols: Record<string, string> = {
    GHC: "₵",
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "C$",
  };

  // Format price with currency
  const formatPrice = (price: number | undefined | null, currency: string = 'GHC'): string => {
    // Handle undefined or null price values
    const safePrice = price !== undefined && price !== null ? price : 0;
    
    // Get symbol directly from the currencySymbols object
    const symbol = currencySymbols[currency as keyof typeof currencySymbols] || currency;
    
    return `${symbol}${safePrice.toFixed(2)}`;
  };

  // Get payment method display name
  const getPaymentMethodDisplay = (method: string): string => {
    switch(method) {
      case 'cash': return 'Cash';
      case 'card': return 'Card Payment';
      case 'other': return 'Other Payment Method';
      default: return method;
    }
  };

  // Define grid columns
  const columns = useMemo<GridColDef[]>(() => [
    { 
      field: 'image', 
      headerName: 'Image', 
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <div className="h-12 w-12 relative">
          <Image
            src={
              params.row.image
                ? `http://localhost:8000${params.row.image}`
                : "/assets/default-image.png"
            }
            alt={params.row.name}
            fill
            className="object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/default-image.png";
            }}
          />
        </div>
      )
    },
    { 
      field: 'name', 
      headerName: 'Product', 
      flex: 2,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex flex-col">
          <span className="font-medium">{params.row.name}</span>
          <span className="text-xs text-gray-500">{params.row.productId}</span>
        </div>
      )
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
        <Chip 
          label={`${params.value} ${params.row.stockUnit || 'units'}`}
          color="primary" 
          variant="outlined"
          size="small"
          className="w-full justify-center"
        />
      )
    },
    { 
      field: 'price', 
      headerName: 'Unit Price', 
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => {
        const price = params.row.price || 0;
        const currency = params.row.currency || 'GHC';
        const symbol = currencySymbols[currency as keyof typeof currencySymbols] || currency;
        
        return (
          <div className="text-right font-medium">
            {`${symbol}${Number(price).toFixed(2)}`}
          </div>
        );
      }
    },
    { 
      field: 'lineTotal', 
      headerName: 'Total', 
      width: 120,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params: GridRenderCellParams) => {
        const price = params.row.price || 0;
        const quantity = params.row.quantity || 0;
        const lineTotal = price * quantity;
        const currency = params.row.currency || 'GHC';
        const symbol = currencySymbols[currency as keyof typeof currencySymbols] || currency;
        
        return (
          <div className="text-right font-medium">
            {`${symbol}${lineTotal.toFixed(2)}`}
          </div>
        );
      }
    },
    {
      field: 'paymentMethod',
      headerName: 'Payment Method',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      valueGetter: (params) => saleData.paymentMethod,
      renderCell: (params) => {
        const method = params.value || 'cash';
        const icon = method === 'cash' 
          ? <span className="mr-1">💵</span> 
          : method === 'card' 
            ? <CreditCard className="h-4 w-4 mr-1" /> 
            : <span className="mr-1">📄</span>;
        
        return (
          <div className="flex items-center justify-center">
            {icon}
            <span>{getPaymentMethodDisplay(method)}</span>
          </div>
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="text"
          color="primary"
          size="small"
          startIcon={<Eye className="h-4 w-4" />}
          onClick={() => onViewProduct(params.row.product)}
        >
          View
        </Button>
      )
    }
  ], [saleData.paymentMethod, currencySymbols]);

  // Format grid rows from sale items
  const rows = useMemo<GridRowData[]>(() => {
    return saleData.items.map((item) => {
      // Calculate line total explicitly
      const lineTotal = item.product.price * item.quantity;
      
      return {
        id: item.product.productId,
        productId: item.product.productId,
        name: item.product.name,
        price: item.product.price, // Ensure price is included
        quantity: item.quantity,
        stockUnit: item.product.stockUnit,
        currency: item.product.currency || 'GHC',
        image: item.product.image,
        product: item.product,
        lineTotal: lineTotal, // Explicitly set the line total
        paymentMethod: saleData.paymentMethod
      };
    });
  }, [saleData.items, saleData.paymentMethod]);

  return (
    <Box sx={{ height: 'calc(100vh - 380px)', minHeight: '400px', width: '100%' }}>
      <DataGrid
      className="font-nunito font-extrabold"
        rows={rows}
        columns={columns}
        disableRowSelectionOnClick
        getRowClassName={(params) => 
          params.indexRelativeToCurrentPage % 2 === 0 ? 'bg-gray-50' : 'bg-white'
        }
        hideFooterSelectedRowCount
        initialState={{
          pagination: { paginationModel: { pageSize: 50 } },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        onRowClick={(params) => {
          console.log('Row clicked:', params.row);
        }}
      />
    </Box>
  );
};

export default SalesGrid;