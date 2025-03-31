// components/inventory/RestockModal.tsx
import React from 'react';
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
} from "@mui/material";
import {
  CheckCircle,
  Add,
  Remove,
} from "@mui/icons-material";
import { SelectedProductInfo } from '../types/productTypes';

interface RestockModalProps {
  open: boolean;
  onClose: () => void;
  selectedProducts: SelectedProductInfo[];
  activeProductId: string | null;
  handleSetActiveProduct: (id: string) => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
  handleQuantityChange: (id: string, value: number) => void;
  productsToRestockCount: number;
  hasProductsToRestock: boolean;
  handleRestockProducts: () => void;
}

const RestockModal: React.FC<RestockModalProps> = ({
  open,
  onClose,
  selectedProducts,
  activeProductId,
  handleSetActiveProduct,
  incrementQuantity,
  decrementQuantity,
  handleQuantityChange,
  productsToRestockCount,
  hasProductsToRestock,
  handleRestockProducts,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
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
        <Typography variant="h5" component="h2" sx={{ color: "text.primary", mb: 2 }}>
          Restock Products
        </Typography>

        {selectedProducts.length > 1 && (
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
                              Current: {product.currentStock} {product.unit}
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
                                <Typography variant="body2" sx={{ ml: 1, color: "success.main" }}>
                                  New: {product.currentStock + product.restockQuantity} {product.unit}
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
          <Button variant="outlined" onClick={onClose}>
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
  );
};

export default RestockModal;