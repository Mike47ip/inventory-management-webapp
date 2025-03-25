import { Router } from "express";
import { 
  updateProduct, 
  createProduct, 
  getProducts,
  uploadProductImage 
} from "../controllers/productController";
import multer from "multer";

const router = Router();

// GET all products
router.get("/", getProducts);

// POST create a new product with image upload
router.post("/", (req, res, next) => {
  uploadProductImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "Multer error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    }
    next();
  });
}, createProduct);

// PATCH update an existing product with optional image upload
router.patch("/:productId", (req, res, next) => {
  uploadProductImage(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: "Multer error: " + err.message });
    } else if (err) {
      return res.status(400).json({ message: "File upload error: " + err.message });
    }
    next();
  });
}, updateProduct);

export default router;
