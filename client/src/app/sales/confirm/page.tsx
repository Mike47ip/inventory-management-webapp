"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  Box, 
  Button, 
  Typography, 
  Paper,
  TextField,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  IconButton
} from "@mui/material";
import { 
  ArrowLeft, 
  Receipt, 
  CheckCircle,
  CreditCard,
  XCircle,
  X
} from "lucide-react";
import Header from "@/app/(components)/Header";
import SalesGrid from "./SalesGrid";

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

export default function SalesConfirmPage(): React.ReactElement {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState<boolean>(false);
  const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false);
  const [productViewModal, setProductViewModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Get cart data from localStorage with added console logging
  const [saleData, setSaleData] = useState<SaleData>(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('pendingSale');
      const parsedData: SaleData = storedData ? JSON.parse(storedData) : {
        customer: null,
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        total: 0,
        paymentMethod: 'cash',
        note: ''
      };
      
      // Debug logging
      console.log('Stored Sale Data:', parsedData);
      if (parsedData.items && parsedData.items.length > 0) {
        console.log('First item price:', parsedData.items[0].product.price);
        console.log('First item quantity:', parsedData.items[0].quantity);
        console.log('All items:', parsedData.items.map((item: CartItem) => ({
          id: item.product.productId,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          total: item.product.price * item.quantity
        })));
      }
      
      return parsedData;
    }
    return {
      customer: null,
      items: [],
      subtotal: 0,
      discount: 0,
      tax: 0,
      total: 0,
      paymentMethod: 'cash',
      note: ''
    };
  });

  // Handle editing the note field
  const [editedNote, setEditedNote] = useState<string>(saleData.note || '');

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

  // Handle going back to sales page
  const handleBack = (): void => {
    router.back();
  };

  // Handle view product details
  const handleViewProduct = (product: Product): void => {
    setSelectedProduct(product);
    setProductViewModal(true);
  };

  // Close product view modal
  const closeProductViewModal = (): void => {
    setProductViewModal(false);
    setSelectedProduct(null);
  };

  // Handle final sale confirmation
  const handleConfirm = async (): Promise<void> => {
    setIsSubmitting(true);
    
    try {
      // Update note in case it was edited
      const updatedSaleData = {
        ...saleData,
        note: editedNote
      };
      
      // This would be an API call in production
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      console.log('Confirming sale:', updatedSaleData);
      
      // Clear the pending sale data
      localStorage.removeItem('pendingSale');
      
      // Show success dialog
      setOpenSuccessDialog(true);
    } catch (error) {
      console.error('Error confirming sale:', error);
      // Would show error notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel confirmation
  const handleCancelSale = (): void => {
    setOpenCancelDialog(true);
  };

  // Handle confirming cancel
  const handleConfirmCancel = (): void => {
    localStorage.removeItem('pendingSale');
    router.back();
  };

  // Handle closing success dialog and navigating back to sales
  const handleSuccessDialogClose = (): void => {
    setOpenSuccessDialog(false);
    router.push('/sales'); // Navigate back to sales page
  };

  // Check data on component mount
  useEffect(() => {
    console.log('Component mounted, checking sale data');
    console.log('Items count:', saleData.items.length);
    
    if (saleData.items.length > 0) {
      saleData.items.forEach((item: CartItem, index: number) => {
        console.log(`Item ${index + 1}:`, {
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          calculated: item.product.price * item.quantity
        });
      });
    }
  }, [saleData.items]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header name="Confirm Sale" />
      
      <div className="container mx-auto p-4 md:p-6 flex-1">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4">
          <Button 
            startIcon={<ArrowLeft className="h-5 w-5" />}
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Sales
          </Button>
          
          <div className="flex items-center space-x-4">
            {/* Payment Method */}
            <Chip 
              icon={<CreditCard className="h-4 w-4" />} 
              label={getPaymentMethodDisplay(saleData.paymentMethod)}
              color="primary"
              variant="outlined"
            />
            
            {/* Customer Info (if available) */}
            {saleData.customer && (
              <Chip 
                label={`Customer: ${saleData.customer.name}`}
                color="default"
                variant="outlined"
              />
            )}
          </div>
        </div>
        
        <Paper elevation={3} className="mb-6">
          {/* Order Items Table - Using the extracted SalesGrid component */}
          <SalesGrid 
      
            saleData={saleData} 
            onViewProduct={handleViewProduct} 
          />
          
          {/* Order Summary */}
          <Box className="p-4 border-t font-mono">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <Typography variant="subtitle2" className="text-gray-600 mb-1">
                  Subtotal
                </Typography>
                <Typography variant="h6">
                  {formatPrice(saleData.subtotal)}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  ({saleData.items.length} items)
                </Typography>
              </div>
              
              <div>
                <Typography variant="subtitle2" className="text-gray-600 mb-1">
                  Discount ({saleData.discount > 0 ? `${(saleData.discount / saleData.subtotal * 100).toFixed(1)}%` : '0%'})
                </Typography>
                <Typography variant="h6" className="text-green-600">
                  -{formatPrice(saleData.discount)}
                </Typography>
              </div>
              
              <div>
                <Typography variant="subtitle2" className="text-gray-600 mb-1">
                  Tax (10%)
                </Typography>
                <Typography variant="h6">
                  {formatPrice(saleData.tax)}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  Applied after discount
                </Typography>
              </div>
              
              <div>
                <Typography variant="subtitle2" className="text-gray-600 mb-1">
                  Grand Total
                </Typography>
                <Typography variant="h6" className="text-blue-700 font-bold">
                  {formatPrice(saleData.total)}
                </Typography>
                <Typography variant="caption" className="text-blue-600 font-medium">
                  {getPaymentMethodDisplay(saleData.paymentMethod)}
                </Typography>
              </div>
            </div>
          </Box>
        </Paper>
        
        {/* Notes and Actions */}
        <Paper elevation={2} className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Typography variant="subtitle1" className="text-gray-700 mb-2 font-medium">
                Order Notes
              </Typography>
              <TextField
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                placeholder="Add any additional notes about this order..."
                value={editedNote}
                onChange={(e) => setEditedNote(e.target.value)}
                className="bg-white"
              />
            </div>
            
            <div className="flex flex-col justify-end space-y-4">
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<CheckCircle className="h-5 w-5" />}
                onClick={handleConfirm}
                disabled={isSubmitting || saleData.items.length === 0}
                className="py-3"
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" className="mr-2" />
                ) : (
                  'Confirm Sale'
                )}
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<XCircle className="h-5 w-5" />}
                onClick={handleCancelSale}
                disabled={isSubmitting}
              >
                Cancel Sale
              </Button>
            </div>
          </div>
        </Paper>
      </div>
      
      {/* Product View Modal */}
      <Dialog
        open={productViewModal}
        onClose={closeProductViewModal}
        maxWidth="sm"
        fullWidth
      >
        {selectedProduct && (
          <>
            <DialogTitle className="border-b pb-3">
              <div className="flex justify-between items-center">
                <Typography variant="h6">Product Details</Typography>
                <IconButton edge="end" color="inherit" onClick={closeProductViewModal} aria-label="close">
                  <X />
                </IconButton>
              </div>
            </DialogTitle>
            <DialogContent className="pt-4">
              <div className="flex flex-col items-center mb-4">
                <div className="h-48 w-48 relative mb-3">
                  <Image
                    src={
                      selectedProduct.image
                        ? `http://localhost:8000${selectedProduct.image}`
                        : "/assets/default-image.png"
                    }
                    alt={selectedProduct.name}
                    fill
                    className="object-contain rounded-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/default-image.png";
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="border-b pb-2">
                  <Typography variant="subtitle2" color="textSecondary">Name</Typography>
                  <Typography variant="body1">{selectedProduct.name}</Typography>
                </div>

                <div className="border-b pb-2">
                  <Typography variant="subtitle2" color="textSecondary">Price</Typography>
                  <Typography variant="body1">
                    {formatPrice(selectedProduct.price, selectedProduct.currency || 'GHC')}
                  </Typography>
                </div>

                <div className="border-b pb-2">
                  <Typography variant="subtitle2" color="textSecondary">Stock</Typography>
                  <Typography variant="body1">
                    {selectedProduct.stockQuantity} {selectedProduct.stockUnit || 'Units'}
                  </Typography>
                </div>

                {selectedProduct.category && (
                  <div className="border-b pb-2">
                    <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                    <Typography variant="body1">{selectedProduct.category}</Typography>
                  </div>
                )}

                {selectedProduct.rating !== undefined && (
                  <div className="border-b pb-2">
                    <Typography variant="subtitle2" color="textSecondary">Rating</Typography>
                    <Typography variant="body1">{selectedProduct.rating} / 5</Typography>
                  </div>
                )}
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog
        open={openSuccessDialog}
        onClose={handleSuccessDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <div className="p-2 bg-green-50">
          <DialogTitle id="alert-dialog-title" className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            <span>Sale Completed Successfully!</span>
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              The sale has been processed and recorded successfully.
              {saleData.customer && (
                <span> A receipt has been sent to {saleData.customer.email}.</span>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleSuccessDialogClose}
              autoFocus
              startIcon={<Receipt className="h-5 w-5" />}
            >
              Back to Sales
            </Button>
          </DialogActions>
        </div>
      </Dialog>
      
      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title" className="text-red-600">
          <span>Cancel This Sale?</span>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Are you sure you want to cancel this sale? All items will be returned to inventory and this order will be discarded.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)} color="primary">
            Go Back
          </Button>
          <Button 
            onClick={handleConfirmCancel} 
            color="error" 
            autoFocus
            variant="contained"
          >
            Yes, Cancel Sale
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}