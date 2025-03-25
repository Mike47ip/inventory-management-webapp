"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controllers/productController");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
// GET all products
router.get("/", productController_1.getProducts);
// POST create a new product with image upload
router.post("/", (req, res, next) => {
    (0, productController_1.uploadProductImage)(req, res, function (err) {
        if (err instanceof multer_1.default.MulterError) {
            return res.status(400).json({ message: "Multer error: " + err.message });
        }
        else if (err) {
            return res.status(400).json({ message: "File upload error: " + err.message });
        }
        next();
    });
}, productController_1.createProduct);
// PATCH update an existing product with optional image upload
router.patch("/:productId", (req, res, next) => {
    (0, productController_1.uploadProductImage)(req, res, function (err) {
        if (err instanceof multer_1.default.MulterError) {
            return res.status(400).json({ message: "Multer error: " + err.message });
        }
        else if (err) {
            return res.status(400).json({ message: "File upload error: " + err.message });
        }
        next();
    });
}, productController_1.updateProduct);
exports.default = router;
