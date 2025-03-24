"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
// GET all products
router.get("/", productController_1.getProducts);
// POST create a new product with image upload
router.post("/", productController_1.uploadProductImage, productController_1.createProduct);
// PATCH update an existing product with optional image upload
router.patch("/:productId", productController_1.uploadProductImage, productController_1.updateProduct);
exports.default = router;
