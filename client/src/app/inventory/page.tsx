"use client";

import React, { useState, useMemo } from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import {
 Box,
 Button,
 Modal,
 TextField,
 Typography,
 Alert,
 List,
 ListItem,
 Divider,
 IconButton,
 Chip,
 Tooltip,
 Paper,
 Grid,
 Rating as MuiRating,
} from "@mui/material";
import {
 Product,
 useGetProductsQuery,
 useUpdateProductFieldsMutation,
} from "@/state/api";
import { GridToolbar } from "@mui/x-data-grid";
import { dataGridStyles } from "@/styles/dataGridStyles";
import Image from "next/image";
import { useAppSelector } from "@/app/redux";
import { CheckCircle, Add, Remove, Visibility } from "@mui/icons-material";

const Inventory = () => {
 // Get dark mode state from Redux
 const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

 // State declarations
 const [searchQuery, setSearchQuery] = useState<string>("");
 const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
 const [openRestockModal, setOpenRestockModal] = useState<boolean>(false);
 const [viewProductModal, setViewProductModal] = useState<boolean>(false);
 const [selectedViewProduct, setSelectedViewProduct] = useState<Product | null>(
  null
 );

 // State for individual product restock quantities
 const [productRestockQuantities, setProductRestockQuantities] = useState<{
  [key: string]: number;
 }>({});
 const [activeProductId, setActiveProductId] = useState<string | null>(null);

 // API hooks
 const { data: products = [], isLoading, refetch } = useGetProductsQuery();
 const [updateProductFields] = useUpdateProductFieldsMutation();

 // Function to get display list of selected products
 const getSelectedProductsInfo = () => {
  if (!selectedProductIds.length) return [];

  return selectedProductIds.map((id) => {
   const product = products.find((p) => p.productId === id);
   return {
    id: product?.productId || "",
    name: product?.name || "Unknown product",
    currentStock: product?.stockQuantity || 0,
    // Get restock quantity from state or default to 0
    restockQuantity: productRestockQuantities[id] || 0,
   };
  });
 };

 // Modal handlers
 const handleOpenRestockModal = () => {
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
 };

 const handleCloseRestockModal = () => {
  setOpenRestockModal(false);
  setActiveProductId(null);
  setProductRestockQuantities({});
 };

 // View product handlers
 const handleViewProduct = (product: Product) => {
  setSelectedViewProduct(product);
  setViewProductModal(true);
 };

 const handleCloseViewProduct = () => {
  setViewProductModal(false);
  setSelectedViewProduct(null);
 };

 // Handle quantity change for a specific product
 const handleQuantityChange = (id: string, value: number) => {
  if (value >= 0) {
   setProductRestockQuantities((prev) => ({
    ...prev,
    [id]: value,
   }));
  }
 };

 // Set active product
 const handleSetActiveProduct = (id: string) => {
  setActiveProductId(id);
 };

 // Increment/decrement quantity
 const incrementQuantity = (id: string) => {
  const currentQty = productRestockQuantities[id] || 0;
  handleQuantityChange(id, currentQty + 1);
 };

 const decrementQuantity = (id: string) => {
  const currentQty = productRestockQuantities[id] || 0;
  if (currentQty > 0) {
   handleQuantityChange(id, currentQty - 1);
  }
 };

 // Restock handler with individual quantities and auto-clear selection
 const handleRestockProducts = async () => {
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
     const product = products.find((p) => p.productId === productId);
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
 };

 // Check if any product has a restock quantity > 0
 const hasProductsToRestock = useMemo(() => {
  return Object.values(productRestockQuantities).some((qty) => qty > 0);
 }, [productRestockQuantities]);

 // Count products that will be restocked
 const productsToRestockCount = useMemo(() => {
  return Object.values(productRestockQuantities).filter((qty) => qty > 0)
   .length;
 }, [productRestockQuantities]);

 // DataGrid columns
 const columns: GridColDef[] = useMemo(
  () => [
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
   {
    field: "price",
    headerName: "Price",
    type: "number",
    flex: 0.4,
    headerAlign: "left",
    valueGetter: (value, row) => `$${row.price}`,
   },
   { field: "rating", headerName: "Rating", type: "number", flex: 0.3 },
   {
    field: "stockQuantity",
    headerName: "Stock Quantity",
    flex: 0.4,
    headerAlign: "right",
    renderCell: (params) => {
     // Determine style based on stock quantity
     const isHighStock = params.value >= 100;

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
        {params.value}
       </span>
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
          bgcolor: "rgba(25, 118, 210, 0.08)",
         },
        }}
       >
        <Visibility />
       </IconButton>
      </Tooltip>
     </Box>
    ),
   },
  ],
  [isDarkMode] // Add isDarkMode as a dependency so the colors update when the theme changes
 );

 // Filter products based on search query
 const filteredProducts = useMemo(
  () =>
   products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
   ),
  [products, searchQuery]
 );

 // Get selected products information for the modal
 const selectedProducts = getSelectedProductsInfo();

 return (
  <Box m="1.5rem 2.5rem">
   <Box display="flex" justifyContent="space-between" alignItems="center">
    <TextField
     label="Search Inventory"
     variant="outlined"
     value={searchQuery}
     onChange={(e) => setSearchQuery(e.target.value)}
    />
    <Button
     color="primary"
     variant="contained"
     onClick={handleOpenRestockModal}
     disabled={selectedProductIds.length === 0}
    >
     Restock Selected Products
    </Button>
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
   <Modal open={openRestockModal} onClose={handleCloseRestockModal}>
    <Box
     sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      bgcolor: "background.paper",
      boxShadow: 24,
      p: 4,
      minWidth: 400,
      maxWidth: 600,
      maxHeight: "90vh",
      overflowY: "auto",
      borderRadius: "8px",
     }}
    >
     <Typography
      variant="h5"
      component="h2"
      sx={{ color: "text.primary", mb: 2 }}
     >
      Restock Products
     </Typography>

     {selectedProductIds.length > 1 && (
      <Alert severity="info" sx={{ mb: 3 }}>
       You can set different restock quantities for each product.
       {productsToRestockCount > 0 && (
        <Box mt={1}>
         <Chip
          label={`${productsToRestockCount} product${
           productsToRestockCount > 1 ? "s" : ""
          } will be restocked`}
          color="primary"
          size="small"
         />
        </Box>
       )}
      </Alert>
     )}

     {selectedProducts.length > 0 && (
      <Box sx={{ mb: 3 }}>
       <Typography variant="subtitle1" sx={{ color: "text.primary", mb: 1 }}>
        Selected Products:
       </Typography>
       <Box
        sx={{
         border: "1px solid",
         borderColor: "divider",
         borderRadius: "8px",
         overflow: "hidden",
        }}
       >
        <List disablePadding>
         {selectedProducts.map((product, index) => {
          const isActive = product.id === activeProductId;
          const willRestock = product.restockQuantity > 0;

          return (
           <React.Fragment key={product.id}>
            {index > 0 && <Divider />}
            <ListItem
             sx={{
              p: 0,
              cursor: "pointer",
              bgcolor: isActive ? "rgba(25, 118, 210, 0.08)" : "transparent",
              transition: "background-color 0.2s",
             }}
             onClick={() => handleSetActiveProduct(product.id)}
            >
             <Box
              sx={{
               width: "100%",
               p: 2,
               display: "flex",
               flexDirection: "column",
               gap: 1,
              }}
             >
              <Box
               sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
               }}
              >
               <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                 variant="body1"
                 sx={{
                  color: "text.primary",
                  fontWeight: isActive ? 600 : 400,
                 }}
                >
                 {product.name}
                </Typography>
                {willRestock && (
                 <Tooltip title="Will be restocked">
                  <CheckCircle fontSize="small" color="success" />
                 </Tooltip>
                )}
               </Box>
               <Typography variant="body2" color="text.secondary">
                Current: {product.currentStock}
               </Typography>
              </Box>

              {isActive && (
               <Box
                sx={{
                 display: "flex",
                 alignItems: "center",
                 gap: 1,
                 mt: 1,
                }}
               >
                <IconButton
                 size="small"
                 onClick={(e) => {
                  e.stopPropagation();
                  decrementQuantity(product.id);
                 }}
                 disabled={product.restockQuantity <= 0}
                >
                 <Remove fontSize="small" />
                </IconButton>

                <TextField
                 value={product.restockQuantity}
                 onChange={(e) => {
                  const val = parseInt(e.target.value);
                  handleQuantityChange(product.id, isNaN(val) ? 0 : val);
                 }}
                 type="number"
                 size="small"
                 inputProps={{ min: 0, style: { textAlign: "center" } }}
                 sx={{ width: 80 }}
                 variant="outlined"
                 onClick={(e) => e.stopPropagation()}
                />

                <IconButton
                 size="small"
                 onClick={(e) => {
                  e.stopPropagation();
                  incrementQuantity(product.id);
                 }}
                >
                 <Add fontSize="small" />
                </IconButton>

                {product.restockQuantity > 0 && (
                 <Typography
                  variant="body2"
                  sx={{ ml: 1, color: "success.main" }}
                 >
                  New: {product.currentStock + product.restockQuantity}
                 </Typography>
                )}
               </Box>
              )}
             </Box>
            </ListItem>
           </React.Fragment>
          );
         })}
        </List>
       </Box>
      </Box>
     )}

     <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
      <Button variant="outlined" onClick={handleCloseRestockModal}>
       Cancel
      </Button>
      <Button
       variant="contained"
       color="primary"
       onClick={handleRestockProducts}
       disabled={!hasProductsToRestock}
      >
       {productsToRestockCount === 0
        ? "Restock Products"
        : `Restock ${productsToRestockCount} Product${
           productsToRestockCount > 1 ? "s" : ""
          }`}
      </Button>
     </Box>
    </Box>
   </Modal>

   {/* View Product Modal */}
   <Modal
    open={viewProductModal}
    onClose={handleCloseViewProduct}
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
     {selectedViewProduct && (
      <>
       <Typography
        id="product-details-modal"
        variant="h5"
        component="h2"
        gutterBottom
       >
        Product Details
       </Typography>

       <Paper elevation={0} sx={{ mt: 2, p: 2, bgcolor: "background.default" }}>
        <Grid container spacing={3}>
         {/* Product Image */}
         <Grid
          item
          xs={12}
          md={5}
          sx={{
           display: "flex",
           justifyContent: "center",
           alignItems: "flex-start",
           m: 2, // Adds margin around the Grid (change the value as needed)
          }}
         >
          <Image
           src={
            selectedViewProduct.image
             ? `http://localhost:8000${selectedViewProduct.image}`
             : "/assets/default-image.png"
           }
           alt={selectedViewProduct.name}
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
         </Grid>

         {/* Product Details */}
         <Grid item xs={12} md={7}>
          <Typography
           variant="h6"
           component="h3"
           gutterBottom
           fontWeight="bold"
          >
           {selectedViewProduct.name}
          </Typography>

          <Box sx={{ mt: 2, mb: 3 }}>
           <MuiRating
            value={selectedViewProduct.rating || 0}
            precision={0.5}
            readOnly
           />
           <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Rating: {selectedViewProduct.rating || 0} / 5
           </Typography>
          </Box>

          <Typography
           variant="h6"
           color="primary"
           fontWeight="medium"
           sx={{ mb: 2 }}
          >
           ${selectedViewProduct.price.toFixed(2)}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 2 }}>
           <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
             Category
            </Typography>
            <Typography variant="body1">
             {selectedViewProduct.category || "Uncategorized"}
            </Typography>
           </Grid>
           <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">
             Stock Quantity
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
             <Typography
              variant="body1"
              sx={{
               color:
                selectedViewProduct.stockQuantity >= 100
                 ? "success.main"
                 : "error.main",
               fontWeight: "medium",
              }}
             >
              {selectedViewProduct.stockQuantity}
             </Typography>
             <Chip
              label={
               selectedViewProduct.stockQuantity >= 100
                ? "In Stock"
                : "Low Stock"
              }
              color={
               selectedViewProduct.stockQuantity >= 100 ? "success" : "error"
              }
              size="small"
              sx={{ ml: 1 }}
             />
            </Box>
           </Grid>
          </Grid>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
           Product ID
          </Typography>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
           {selectedViewProduct.productId}
          </Typography>
         </Grid>
        </Grid>
       </Paper>

       <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button onClick={handleCloseViewProduct} variant="contained">
         Close
        </Button>
       </Box>
      </>
     )}
    </Box>
   </Modal>
  </Box>
 );
};

export default Inventory;
