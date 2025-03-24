import { Router } from "express";
import { 
  updateProduct, 
  createProduct, 
  getProducts,
  uploadProductImage 
} from "../controllers/productController";

const router = Router();

// GET all products
router.get("/", getProducts);

// POST create a new product with image upload
router.post("/", uploadProductImage, createProduct);

// PATCH update an existing product with optional image upload
router.patch("/:productId", uploadProductImage, updateProduct);

export default router;