"use client";

import React, { useState, useMemo } from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Box, Button, Modal, TextField } from "@mui/material";
import {
 Product,
 useGetProductsQuery,
 useUpdateProductMutation,
} from "@/state/api";
import { GridToolbar } from "@mui/x-data-grid";

const Inventory = () => {
 const { data: products = [], isLoading } = useGetProductsQuery();
 const [updateProduct] = useUpdateProductMutation();

 const [searchQuery, setSearchQuery] = useState<string>("");
 const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
 const [restockQuantity, setRestockQuantity] = useState<number>(0);
 const [openRestockModal, setOpenRestockModal] = useState<boolean>(false);

 // Modal handling
 const handleOpenRestockModal = () => setOpenRestockModal(true);
 const handleCloseRestockModal = () => setOpenRestockModal(false);

 // Handle updating stock
 const handleRestockProducts = async () => {
  console.log("Selected product IDs:", selectedProductIds); // Log selected product IDs
  console.log("Restock quantity:", restockQuantity); // Log restock quantity

  const updatePromises = selectedProductIds.map(async (productId) => {
   const productToUpdate = products.find((p) => p.productId === productId);
   if (productToUpdate) {
    await updateProduct({
     productId,
     updatedProduct: {
      stockQuantity: productToUpdate.stockQuantity + restockQuantity,
     },
    });
   }
  });

  await Promise.all(updatePromises); // Wait for all products to be updated
  setRestockQuantity(0); // Reset quantity
  setOpenRestockModal(false); // Close modal
 };

 // Defining columns for the DataGrid
 const columns: GridColDef[] = useMemo(
  () => [
   { field: "name", headerName: "Name", flex: 1 },
   {
    field: "price",
    headerName: "Price",
    flex: 0.5,
    valueGetter: (value, row) => `$${row.price}`,
   },
   { field: "rating", headerName: "Rating", flex: 0.3 },
   { field: "stockQuantity", headerName: "Stock Quantity", flex: 0.5 },
  ],
  []
 );

 // Row selection change handler
 const handleRowSelection = (newSelection: any) => {
  setSelectedProductIds(newSelection);
 };

 // Custom filtering
 const filteredProducts = products.filter((product: Product) =>
  product.name.toLowerCase().includes(searchQuery.toLowerCase())
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

   {/* DataGrid for product display */}
   <Box
    mt="20px"
    height="75vh"
    sx={{ "& .MuiDataGrid-root": { border: "none" } }}
   >
    <DataGrid
     loading={isLoading || !products}
     rows={filteredProducts}
     columns={columns}
     getRowId={(row) => row.productId}
     checkboxSelection
     onRowSelectionModelChange={handleRowSelection}
     slots={{ toolbar: GridToolbar }}
    />
   </Box>

   {/* Modal for restocking products */}
   <Modal open={openRestockModal} onClose={handleCloseRestockModal}>
    <Box
     position="absolute"
     top="50%"
     left="50%"
     style={{
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      padding: "2rem",
      borderRadius: "8px",
     }}
    >
     <h2>Restock Products</h2>
     <TextField
      label="Restock Quantity"
      type="number"
      value={restockQuantity}
      onChange={(e) => setRestockQuantity(Number(e.target.value))}
      fullWidth
      margin="normal"
     />
     <Box mt="1rem" display="flex" justifyContent="space-between">
      <Button onClick={handleCloseRestockModal} variant="outlined">
       Cancel
      </Button>
      <Button
       onClick={handleRestockProducts}
       color="primary"
       variant="contained"
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
