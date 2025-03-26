"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProductImage = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const client_1 = require("@prisma/client");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../uploads/products');
        fs_1.default.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `product-${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('File upload only supports the following filetypes: jpeg, jpg, png, gif, webp'));
        }
    }
});
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const search = (_a = req.query.search) === null || _a === void 0 ? void 0 : _a.toString();
        const products = yield prisma.products.findMany({
            where: {
                name: {
                    contains: search,
                },
            },
        });
        return res.json(products);
    }
    catch (error) {
        return res.status(500).json({ message: "Error retrieving products" });
    }
});
exports.getProducts = getProducts;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, price, rating, stockQuantity, category } = req.body;
        // Parse and validate numbers
        const parseNumber = (value, fieldName) => {
            const num = Number(value);
            if (isNaN(num)) {
                throw new Error(`Invalid ${fieldName} value`);
            }
            return num;
        };
        const productData = Object.assign(Object.assign(Object.assign({ name, price: parseNumber(price, 'price'), stockQuantity: parseNumber(stockQuantity, 'stock quantity') }, (category && { category })), (rating && { rating: parseNumber(rating, 'rating') })), (req.file && { image: `/uploads/products/${req.file.filename}` }));
        const product = yield prisma.products.create({
            data: productData,
        });
        return res.status(201).json(product);
    }
    catch (error) {
        console.error("Error creating product:", error);
        return res.status(500).json({
            message: "Error creating product",
            error: error.message
        });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { productId } = req.params;
        // Parse and validate numbers
        const parseNumber = (value, fieldName) => {
            const num = Number(value);
            if (isNaN(num)) {
                throw new Error(`Invalid ${fieldName} value`);
            }
            return num;
        };
        const updatedData = Object.assign(Object.assign(Object.assign({ name: req.body.name, price: parseNumber(req.body.price, 'price'), stockQuantity: parseNumber(req.body.stockQuantity, 'stock quantity') }, (req.body.rating && { rating: parseNumber(req.body.rating, 'rating') })), (req.body.category && { category: req.body.category })), (req.file && { image: `/uploads/products/${req.file.filename}` }));
        const existingProduct = yield prisma.products.findUnique({
            where: { productId },
        });
        if (!existingProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        const updatedProduct = yield prisma.products.update({
            where: { productId },
            data: updatedData,
        });
        return res.status(200).json(updatedProduct);
    }
    catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            message: "Error updating product",
            error: error.message,
        });
    }
});
exports.updateProduct = updateProduct;
exports.uploadProductImage = upload.single('image');
