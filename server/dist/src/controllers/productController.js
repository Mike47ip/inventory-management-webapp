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
            where: search ? {
                name: {
                    contains: search,
                    mode: 'insensitive' // Add case-insensitive search
                }
            } : undefined, // Return all products if no search term
        });
        console.log(`Search: "${search}" | Found ${products.length} products`); // Debug log
        return res.json(products);
    }
    catch (error) {
        console.error("Error searching products:", error);
        return res.status(500).json({ message: "Error retrieving products" });
    }
});
exports.getProducts = getProducts;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, price, currency, rating, stockQuantity, stockUnit, category } = req.body;
        // Parse and validate numbers
        const parseNumber = (value, fieldName) => {
            const num = Number(value);
            if (isNaN(num)) {
                throw new Error(`Invalid ${fieldName} value`);
            }
            return num;
        };
        const productData = Object.assign(Object.assign(Object.assign({ name, price: parseNumber(price, 'price'), currency: currency || 'GH₵', stockQuantity: parseNumber(stockQuantity, 'stock quantity'), stockUnit: stockUnit || 'Units' }, (category && { category })), (rating && { rating: parseNumber(rating, 'rating') })), (req.file && { image: `/uploads/products/${req.file.filename}` }));
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
    const { productId } = req.params;
    let updateData = req.body;
    console.log('FULL REQUEST HEADERS:', req.headers);
    console.log('FULL REQUEST BODY:', req.body);
    console.log('CONTENT TYPE:', req.get('Content-Type'));
    console.group('\n🔄 Product Update Request');
    console.log('📦 Product ID:', productId);
    console.log('📊 Raw Update Data:', updateData);
    console.log('⏱️ Timestamp:', new Date().toISOString());
    console.groupEnd();
    try {
        // Validate input
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        // Handle FormData (multipart) vs JSON
        if (req.is('multipart/form-data')) {
            // Convert FormData fields to proper types
            updateData = Object.assign(Object.assign({}, updateData), { price: updateData.price ? Number(updateData.price) : undefined, rating: updateData.rating ? Number(updateData.rating) : undefined, stockQuantity: updateData.stockQuantity ? Number(updateData.stockQuantity) : undefined });
        }
        // Type validation
        if (updateData.stockQuantity && isNaN(Number(updateData.stockQuantity))) {
            return res.status(400).json({ message: "stockQuantity must be a number" });
        }
        if (updateData.price && isNaN(Number(updateData.price))) {
            return res.status(400).json({ message: "price must be a number" });
        }
        // Debug current state
        const currentProduct = yield prisma.products.findUnique({
            where: { productId }
        });
        console.log('\n📦 Current Product State:', {
            productId: currentProduct === null || currentProduct === void 0 ? void 0 : currentProduct.productId,
            currentStock: currentProduct === null || currentProduct === void 0 ? void 0 : currentProduct.stockQuantity,
            currentCurrency: currentProduct === null || currentProduct === void 0 ? void 0 : currentProduct.currency,
            currentStockUnit: currentProduct === null || currentProduct === void 0 ? void 0 : currentProduct.stockUnit,
            requestedChanges: updateData
        });
        // Perform update
        const updatedProduct = yield prisma.products.update({
            where: { productId },
            data: updateData
        });
        console.log('\n✅ Update Successful:', {
            productId: updatedProduct.productId,
            updatedFields: Object.keys(updateData),
            newStock: updatedProduct.stockQuantity,
            currency: updatedProduct.currency,
            stockUnit: updatedProduct.stockUnit,
            timestamp: new Date().toISOString()
        });
        return res.json(updatedProduct);
    }
    catch (error) {
        console.error('\n❌ Update Failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorDetails = process.env.NODE_ENV === 'development' ?
            { stack: error instanceof Error ? error.stack : undefined } : undefined;
        return res.status(500).json(Object.assign({ message: "Error updating product", error: errorMessage }, errorDetails));
    }
});
exports.updateProduct = updateProduct;
exports.uploadProductImage = upload.single('image');
