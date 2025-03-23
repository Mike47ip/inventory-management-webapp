"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const router = (0, express_1.Router)();
router.get("/", productController_1.getProducts);
router.post("/", productController_1.createProduct);
router.patch("/:productId", updateProduct); // Add this line for updating products
exports.default = router;
