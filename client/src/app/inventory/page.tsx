"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  Box,
  Button,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  Product,
  useGetProductsQuery,
  useUpdateProductFieldsMutation,
} from "@/state/api";
import { GridToolbar } from "@mui/x-data-grid";
import { dataGridStyles } from "@/styles/dataGridStyles";
import { useAppSelector } from "@/app/redux";

// Import custom components and hooks
import RestockModal from "./RestockModal";
import { getGridColumns } from "./GridColumns";
import useProductUnits from "./useProductUnits";
import { SelectedProductInfo } from "../types/productTypes";
import ProductDetailModal from "./ProductDetailModal";
import { useNotificationHelpers } from "../common/NotificationManager";

// Add a constant for localStorage key
const LOCAL_STORAGE_FEATURED_PRODUCTS_KEY = "featuredProducts";

const Inventory = () => {
  // Get dark mode state from Redux
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // Get notifications methods from the updated hook
  const { showSuccess, showError, showInfo } = useNotificationHelpers();

  // State declarations
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [openRestockModal, setOpenRestockModal] = useState<boolean>(false);
  const [viewProductModal, setViewProductModal] = useState<boolean>(false);
  const [selectedViewProduct, setSelectedViewProduct] = useState<Product | null>(null);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);

  const [featuredProducts, setFeaturedProducts] = useState<Set<string>>(() => {
    try {
      const storedFeaturedProducts = localStorage.getItem(LOCAL_STORAGE_FEATURED_PRODUCTS_KEY);
      return storedFeaturedProducts 
        ? new Set(JSON.parse(storedFeaturedProducts)) 
        : new Set();
    } catch (error) {
      console.error("Error loading featured products from localStorage:", error);
      return new Set();
    }
  });

  // Save featured products to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_FEATURED_PRODUCTS_KEY, 
        JSON.stringify(Array.from(featuredProducts))
      );
    } catch (error) {
      console.error("Error saving featured products to localStorage:", error);
    }
  }, [featuredProducts]);

  // Filter mode: "all", "featured", "regular"
  const [filterMode, setFilterMode] = useState<string>("all");

  // State for individual product restock quantities
  const [productRestockQuantities, setProductRestockQuantities] = useState<{
    [key: string]: number;
  }>({});
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  // Custom hook for product units
  const { getProductUnit } = useProductUnits();

  // API hooks
  const { 
    data: products = [], 
    isLoading, 
    refetch 
  } = useGetProductsQuery();

  // Mutations
  const [updateProductFields] = useUpdateProductFieldsMutation();

  // Update local products when fetched products change
  useEffect(() => {
    if (products && products.length > 0) {
      const productsWithDefaults = products.map(product => ({
        ...product,
        currency: product.currency || 'GHC'
      }));
      
      setLocalProducts(productsWithDefaults);
    } else {
      setLocalProducts(products);
    }
  }, [products]);

  // View product handlers
  const handleViewProduct = useCallback((product: Product) => {
    setSelectedViewProduct(product);
    setViewProductModal(true);
  }, []);

  const toggleFeatured = useCallback((productId: string) => {
    const newFeaturedProducts = new Set(featuredProducts);
    if (newFeaturedProducts.has(productId)) {
      newFeaturedProducts.delete(productId);
    } else {
      newFeaturedProducts.add(productId);
    }
    setFeaturedProducts(newFeaturedProducts);
  }, [featuredProducts]);

  // Get DataGrid columns configuration
  const columns = useMemo(() => getGridColumns({
    isDarkMode,
    featuredProducts,
    toggleFeatured,
    getProductUnit,
    handleViewProduct,
  }), [isDarkMode, featuredProducts, toggleFeatured, getProductUnit, handleViewProduct]);

  // Function to get display list of selected products
  const getSelectedProductsInfo = useCallback((): SelectedProductInfo[] => {
    if (!selectedProductIds.length) return [];

    return selectedProductIds.map((id) => {
      const product = localProducts.find((p) => p.productId === id);
      return {
        id: product?.productId || "",
        name: product?.name || "Unknown product",
        currentStock: product?.stockQuantity || 0,
        // Get restock quantity from state or default to 0
        restockQuantity: productRestockQuantities[id] || 0,
        // Add unit information
        unit: product ? getProductUnit(product) : "Units",
      };
    });
  }, [selectedProductIds, localProducts, productRestockQuantities, getProductUnit]);

  // Modal handlers
  const handleOpenRestockModal = useCallback(() => {
    // Initialize the first selected product as active
    if (selectedProductIds.length > 0) {
      setActiveProductId(selectedProductIds[0]);
    }

    // Reset all restock quantities to 0
    const initialQuantities = selectedProductIds.reduce((acc, id) => {
      acc[id] = 0;
      return acc;
    }, {} as { [key: string]: number });

    setProductRestockQuantities(initialQuantities);
    setOpenRestockModal(true);
  }, [selectedProductIds]);

  const handleCloseRestockModal = useCallback(() => {
    setOpenRestockModal(false);
    setActiveProductId(null);
    setProductRestockQuantities({});
  }, []);

  const handleCloseViewProduct = useCallback(() => {
    setViewProductModal(false);
    setSelectedViewProduct(null);
  }, []);

  // Handle quantity change for a specific product
  const handleQuantityChange = useCallback((id: string, value: number) => {
    if (value >= 0) {
      setProductRestockQuantities((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  }, []);

  // Set active product
  const handleSetActiveProduct = useCallback((id: string) => {
    setActiveProductId(id);
  }, []);

  // Increment/decrement quantity
  const incrementQuantity = useCallback((id: string) => {
    const currentQty = productRestockQuantities[id] || 0;
    handleQuantityChange(id, currentQty + 1);
  }, [productRestockQuantities, handleQuantityChange]);

  const decrementQuantity = useCallback((id: string) => {
    const currentQty = productRestockQuantities[id] || 0;
    if (currentQty > 0) {
      handleQuantityChange(id, currentQty - 1);
    }
  }, [productRestockQuantities, handleQuantityChange]);

  // Handle filter change
  const handleFilterChange = useCallback((
    event: React.MouseEvent<HTMLElement>,
    newFilterMode: string
  ) => {
    if (newFilterMode !== null) {
      setFilterMode(newFilterMode);
    }
  }, []);

  // Format units with quantities (handles pluralization)
  const formatUnitsWithQuantity = useCallback((quantity: number, unit: string) => {
    // For default units, handle pluralization
    if (unit.toLowerCase() === 'units' || unit.toLowerCase() === 'pieces') {
      return `${quantity} ${quantity === 1 ? unit.slice(0, -1) : unit}`;
    }
    
    // For standard measurement units, don't pluralize
    const standardUnits = ['kg', 'g', 'l', 'ml', 'oz', 'lb'];
    if (standardUnits.includes(unit.toLowerCase())) {
      return `${quantity} ${unit}`;
    }
    
    // For other units, basic pluralization
    return `${quantity} ${quantity === 1 ? unit : unit + 's'}`;
  }, []);

  // Restock handler with individual quantities and auto-clear selection
  const handleRestockProducts = useCallback(async () => {
    try {
      console.group("Restock Process");

      // Filter out products with zero restock quantity
      const productsToUpdate = Object.entries(productRestockQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => ({ id, qty }));

      if (productsToUpdate.length === 0) {
        console.log("No products to update");
        return;
      }

      // Show "Starting restock" notification
      showInfo(`Restocking ${productsToUpdate.length} products...`);

      // Sequential notification delay (ms) to create a cascade effect
      const NOTIFICATION_DELAY = 400;

      // Process each product update sequentially for notifications
      for (let i = 0; i < productsToUpdate.length; i++) {
        const { id: productId, qty } = productsToUpdate[i];
        const product = localProducts.find((p) => p.productId === productId);
        
        if (!product) {
          console.warn(`Product ${productId} not found`);
          continue;
        }

        const newStock = product.stockQuantity + qty;
        const productUnit = getProductUnit(product);
        
        console.log("Updating product:", {
          id: productId,
          name: product.name,
          from: product.stockQuantity,
          to: newStock,
          addedQuantity: qty,
          unit: productUnit
        });

        // Use the dedicated fields update mutation
        await updateProductFields({
          productId,
          updateData: { stockQuantity: newStock },
        }).unwrap();

        // Show individual product restock notification with a staggered delay
        setTimeout(() => {
          showSuccess(
            `Restocked ${product.name} with ${formatUnitsWithQuantity(qty, productUnit)}`,
            5000 // Duration
          );
        }, i * NOTIFICATION_DELAY);
      }

      await refetch();
      console.log("Restock completed successfully");

      // Show a summary notification after individual notifications
      setTimeout(() => {
        const totalItems = productsToUpdate.reduce((sum, { qty }) => sum + qty, 0);
        showInfo(
          `Restock complete: ${productsToUpdate.length} products updated with ${totalItems} total items`, 
          6000
        );
      }, productsToUpdate.length * NOTIFICATION_DELAY + 500);

      // Clear selection after successful restock
      setSelectedProductIds([]);
    } catch (error) {
      console.error("Restock failed:", error);
      showError("Failed to restock products. Please try again.");
    } finally {
      handleCloseRestockModal();
      console.groupEnd();
    }
  }, [productRestockQuantities, localProducts, updateProductFields, refetch, handleCloseRestockModal, getProductUnit, formatUnitsWithQuantity, showSuccess, showError, showInfo]);

  // Check if any product has a restock quantity > 0
  const hasProductsToRestock = useMemo(() => {
    return Object.values(productRestockQuantities).some((qty) => qty > 0);
  }, [productRestockQuantities]);

  // Count products that will be restocked
  const productsToRestockCount = useMemo(() => {
    return Object.values(productRestockQuantities).filter((qty) => qty > 0).length;
  }, [productRestockQuantities]);

  // Filter products based on search query and featured status
  const filteredProducts = useMemo(() => {
    let filtered = localProducts.filter((product: Product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply featured filter if needed
    if (filterMode === "featured") {
      filtered = filtered.filter((product) =>
        featuredProducts.has(product.productId)
      );
    } else if (filterMode === "regular") {
      filtered = filtered.filter(
        (product) => !featuredProducts.has(product.productId)
      );
    }

    return filtered;
  }, [localProducts, searchQuery, featuredProducts, filterMode]);

  // Get selected products information for the modal
  const selectedProducts = getSelectedProductsInfo();

  // Count of featured products
  const featuredCount = useMemo(
    () => localProducts.filter((p) => featuredProducts.has(p.productId)).length,
    [localProducts, featuredProducts]
  );

  return (
    <Box className="m-4 sm:m-6 lg:m-10" >
      <Box display="flex" flexDirection="column" gap={2}>
        <Box className="flex justify-between items-center gap-4">
          <TextField
            label="Search Inventory"
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Box display="flex" gap={2}>
            <Button
              color="primary"
              variant="contained"
              onClick={handleOpenRestockModal}
              disabled={selectedProductIds.length === 0}
            >
              Restock <span className="hidden md:block"> Selected Products</span>
            </Button>
          </Box>
        </Box>

        {/* Featured filter toggle */}
        <Box display="flex" className="flex justify-between gap-3 items-center">
          <ToggleButtonGroup
            className="flex justify-between gap-3 items-center"
            value={filterMode}
            exclusive
            onChange={handleFilterChange}
            aria-label="product filter"
            size="small"
          >
            <ToggleButton value="all" aria-label="all products">
              <span className="text-[10px] font-medium md:text-base">All Products </span> 
            </ToggleButton>
            <ToggleButton value="featured" aria-label="featured products">
              <span className="text-[10px] font-medium md:text-base">Featured ({featuredCount}) </span>  
            </ToggleButton>
            <ToggleButton value="regular" aria-label="regular products">
              <span className="text-[10px] font-medium md:text-base">Regular </span> 
            </ToggleButton>
          </ToggleButtonGroup>

          <Typography variant="body2" color="text.secondary">
            <span className="hidden md:block rounded-full text-[10px] bg-green-100 text-green-800 md:text-base p-3">
              {filteredProducts.length} products found
            </span>
          </Typography>
        </Box>
      </Box>

      <Box
        mt="20px"
        height="75vh"
        sx={{ "& .MuiDataGrid-root": { border: "none" } }}
      >
        <DataGrid
          loading={isLoading}
          rows={filteredProducts}
          columns={columns}
          getRowId={(row) => row.productId}
          checkboxSelection
          onRowSelectionModelChange={(newSelection) => {
            setSelectedProductIds(newSelection as string[]);
          }}
          rowSelectionModel={selectedProductIds}
          slots={{ toolbar: GridToolbar }}
          sx={dataGridStyles}
        />
      </Box>

      {/* Restock Modal */}
      <RestockModal 
        open={openRestockModal}
        onClose={handleCloseRestockModal}
        selectedProducts={selectedProducts}
        activeProductId={activeProductId}
        handleSetActiveProduct={handleSetActiveProduct}
        incrementQuantity={incrementQuantity}
        decrementQuantity={decrementQuantity}
        handleQuantityChange={handleQuantityChange}
        productsToRestockCount={productsToRestockCount}
        hasProductsToRestock={hasProductsToRestock}
        handleRestockProducts={handleRestockProducts}
      />

      {/* View Product Modal */}
      <ProductDetailModal
        open={viewProductModal}
        onClose={handleCloseViewProduct}
        product={selectedViewProduct}
        featuredProducts={featuredProducts}
        toggleFeatured={toggleFeatured}
        getProductUnit={getProductUnit}
      />
    </Box>
  );
};

export default Inventory;