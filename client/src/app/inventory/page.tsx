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
  useCreateProductMutation,
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

// Type for product form data
type ProductFormData = {
  name: string;
  price: number;
  currency: string;
  stockQuantity: number;
  stockUnit: string;
  rating: number;
  category: string;
  image: File | null;
};

const Inventory = () => {
  // Get dark mode state from Redux
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // State declarations
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [openRestockModal, setOpenRestockModal] = useState<boolean>(false);
  const [viewProductModal, setViewProductModal] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedViewProduct, setSelectedViewProduct] = useState<Product | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Set<string>>(new Set());
  const [localProducts, setLocalProducts] = useState<Product[]>([]);

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
  const [createProduct] = useCreateProductMutation();
  const [updateProductFields] = useUpdateProductFieldsMutation();

  // Update local products when fetched products change
  useEffect(() => {
    if (products && products.length > 0) {
      // Log a sample product to check structure
      console.log("Sample product from API:", products[0]);
      
      // Set local products, ensuring each has a currency
      const productsWithDefaults = products.map(product => ({
        ...product,
        currency: product.currency || 'GHC'  // Default if missing
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

      await Promise.all(
        productsToUpdate.map(async ({ id: productId, qty }) => {
          const product = localProducts.find((p) => p.productId === productId);
          if (!product) {
            console.warn(`Product ${productId} not found`);
            return;
          }

          const newStock = product.stockQuantity + qty;

          console.log("Updating product:", {
            id: productId,
            name: product.name,
            from: product.stockQuantity,
            to: newStock,
            addedQuantity: qty,
          });

          // Use the dedicated fields update mutation
          await updateProductFields({
            productId,
            updateData: { stockQuantity: newStock },
          }).unwrap();
        })
      );

      await refetch();
      console.log("Restock completed successfully");

      // Clear selection after successful restock
      setSelectedProductIds([]);
    } catch (error) {
      console.error("Restock failed:", error);
    } finally {
      handleCloseRestockModal();
      console.groupEnd();
    }
  }, [productRestockQuantities, localProducts, updateProductFields, refetch, handleCloseRestockModal]);

  // Handle API product creation
  const handleApiCreateProduct = useCallback(async (formData: ProductFormData) => {
    try {

      // Prepare FormData for API
      const apiFormData = new FormData();
      apiFormData.append("name", formData.name);
      apiFormData.append("price", formData.price.toString());
      apiFormData.append("currency", formData.currency || "GHC"); // Add default
      apiFormData.append("stockQuantity", formData.stockQuantity.toString());
      apiFormData.append("stockUnit", formData.stockUnit || "Units"); // Add default
      apiFormData.append("rating", (formData.rating || 0).toString());
      apiFormData.append("category", formData.category);

      if (formData.image) {
        apiFormData.append("image", formData.image);
      }

      // Create product via API
      const createdProduct = await createProduct(apiFormData).unwrap();
      console.log("Created product response:", createdProduct);

      // After creating the product, manually add it to local state 
      // to ensure we have the currency until the next refetch
      setLocalProducts(prevProducts => [
        ...prevProducts,
        {
          ...createdProduct,
          currency: formData.currency || "GHC", // Ensure currency is present
          stockUnit: formData.stockUnit || "Units" // Ensure stockUnit is present
        }
      ]);

      // Refetch to ensure we have the most up-to-date product list
      await refetch();

      // Close the modal
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create product", error);
      // TODO: Add error handling (e.g., show error toast)
    }
  }, [createProduct, refetch]);

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
    <Box m="1.5rem 2.5rem">
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