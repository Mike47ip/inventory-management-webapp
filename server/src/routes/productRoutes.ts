import { Router } from "express";
import { updateProduct , createProduct, getProducts } from "../controllers/productController";

const router = Router();

router.get("/", getProducts);
router.post("/", createProduct);
router.patch("/:productId", updateProduct); // Add this line for updating products

export default router;
