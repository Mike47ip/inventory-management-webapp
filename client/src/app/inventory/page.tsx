"use client";

import React, { useState, useMemo } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Button, Modal, TextField } from "@mui/material";
import {
 Product,
 useGetProductsQuery,
 useUpdateProductFieldsMutation,
} from "@/state/api";
import { GridToolbar } from "@mui/x-data-grid";
import { dataGridStyles } from "@/styles/dataGridStyles";

const Inventory = () => {
 // State declarations
 const [searchQuery, setSearchQuery] = useState<string>("");
 const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
 const [restockQuantity, setRestockQuantity] = useState<number>(0);
 const [openRestockModal, setOpenRestockModal] = useState<boolean>(false);

 // API hooks
 const { data: products = [], isLoading, refetch } = useGetProductsQuery();
 const [updateProductFields] = useUpdateProductFieldsMutation();

 // Modal handlers
 const handleOpenRestockModal = () => setOpenRestockModal(true);
 const handleCloseRestockModal = () => setOpenRestockModal(false);

 // Restock handler with proper typing
 const handleRestockProducts = async () => {
  if (selectedProductIds.length === 0 || restockQuantity <= 0) return;

  try {
   console.group("Restock Process");

   await Promise.all(
    selectedProductIds.map(async (productId) => {
     const product = products.find((p) => p.productId === productId);
     if (!product) {
      console.warn(`Product ${productId} not found`);
      return;
     }

     const newStock = product.stockQuantity + restockQuantity;

     console.log("Updating product:", {
      id: productId,
      name: product.name,
      from: product.stockQuantity,
      to: newStock,
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
  } catch (error) {
   console.error("Restock failed:", error);
  } finally {
   setRestockQuantity(0);
   setOpenRestockModal(false);
   console.groupEnd();
  }
 };

 // DataGrid columns
 const columns: GridColDef[] = useMemo(
  () => [
   { field: "productId", headerName: "ID", width: 120 },
   { field: "name", headerName: "Name", flex: 0.5 },
   {
    field: "price",
    headerName: "Price",
    type: "number",
    flex: 0.5,
    headerAlign: "left", // Align header text to the left
    valueGetter: (value, row) => `$${row.price}`,
   },
   { field: "rating", headerName: "Rating", type: "number", flex: 0.3 },
   {
    field: "stockQuantity",
    headerName: "Stock Quantity",
    flex: 0.5,
    headerAlign: "right",
   },
  ],
  []
 );

 // Filter products based on search query
 const filteredProducts = useMemo(
  () =>
   products.filter((product: Product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
   ),
  [products, searchQuery]
 );

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
     slots={{ toolbar: GridToolbar }}
     sx={dataGridStyles}
    />
   </Box>

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
      minWidth: 300,
     }}
    >
     <h2>Restock Products</h2>
     <TextField
      label="Restock Quantity"
      type="number"
      value={restockQuantity}
      onChange={(e) => {
       const value = Number(e.target.value);
       if (value >= 0) setRestockQuantity(value);
      }}
      inputProps={{ min: "1" }}
      fullWidth
      margin="normal"
     />
     <Box mt={2} display="flex" justifyContent="space-between">
      <Button onClick={handleCloseRestockModal} variant="outlined">
       Cancel
      </Button>
      <Button
       onClick={handleRestockProducts}
       color="primary"
       variant="contained"
       disabled={restockQuantity <= 0}
      >
       Confirm
      </Button>
     </Box>
    </Box>
   </Modal>
  </Box>
 );
};

export default Inventory;
