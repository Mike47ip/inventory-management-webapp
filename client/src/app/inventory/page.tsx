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
    console.log("Updating product:", productToUpdate); // Log the product being updated
    console.log(
     "Old stock quantity:",
     productToUpdate.stockQuantity,
     "New stock quantity:",
     productToUpdate.stockQuantity + restockQuantity
    ); // Log old and new stock quantity

    await updateProduct({
     productId,
     updatedProduct: {
      stockQuantity: productToUpdate.stockQuantity + restockQuantity,
     },
    });
    console.log("Product updated successfully:", productId); // Confirm update success
   }
  });

  await Promise.all(updatePromises); // Wait for all products to be updated
  setRestockQuantity(0); // Reset quantity
  setOpenRestockModal(false); // Close modal
 };

 // Defining columns for the DataGrid
 const columns: GridColDef[] = useMemo(
  () => [
   { field: "productId", headerName: "ID", width: 120 },
   { field: "name", headerName: "Name", flex: 0.5 },
   {
    field: "price",
    headerName: "Price",
    type: "number",
    flex: 1,
    valueGetter: (value, row) => `$${row.price}`,
   },
   { field: "rating", headerName: "Rating", type: "number", flex: 0.3 },
   { field: "stockQuantity", headerName: "Stock Quantity", flex: 0.5 },
  ],
  []
 );

 // Row selection change handler
 const handleRowSelection = (newSelection: any) => {
  console.log("Selected rows:", newSelection); // Log selected rows
  setSelectedProductIds(newSelection);
 };

 // Custom filtering
 const filteredProducts = products.filter((product: Product) =>
  product.name.toLowerCase().includes(searchQuery.toLowerCase())
 );
 console.log("Filtered products:", filteredProducts); // Log filtered products

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
    <Box className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg">
     <h2>Restock Products</h2>
     <TextField
      label="Restock Quantity"
      type="number"
      value={restockQuantity}
      onChange={(e) => {
       // Only allow positive numbers
       const value = Number(e.target.value);
       if (value >= 0) {
        setRestockQuantity(value);
       }
      }}
      inputProps={{ min: "1" }} // Set minimum value to 1
      fullWidth
      margin="normal"
      helperText="Please enter a positive quantity to add to inventory"
     />
     <Box mt="1rem" display="flex" justifyContent="space-between">
      <Button onClick={handleCloseRestockModal} variant="outlined">
       Cancel
      </Button>
      <Button
       onClick={handleRestockProducts}
       color="primary"
       variant="contained"
       disabled={restockQuantity <= 0} // Disable button if quantity is 0 or negative
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
