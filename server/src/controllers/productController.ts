import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (
    req: MulterRequest, 
    file: Express.Multer.File, 
    cb: (error: Error | null, destination: string) => void
  ) => {
    const uploadPath = path.join(__dirname, '../uploads/products');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (
    req: MulterRequest, 
    file: Express.Multer.File, 
    cb: (error: Error | null, filename: string) => void
  ) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `product-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { 
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (
    req: MulterRequest, 
    file: Express.Multer.File, 
    cb: multer.FileFilterCallback
  ) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('File upload only supports the following filetypes: jpeg, jpg, png, gif, webp'));
    }
  }
});

export const getProducts = async (req: Request, res: Response): Promise<Response> => {
  try {
    const search = req.query.search?.toString();
    
    const products = await prisma.products.findMany({
      where: search ? {
        name: {
          contains: search,
          mode: 'insensitive' // Add case-insensitive search
        }
      } : undefined, // Return all products if no search term
    });

    console.log(`Search: "${search}" | Found ${products.length} products`); // Debug log
    
    return res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    return res.status(500).json({ message: "Error retrieving products" });
  }
};

export const createProduct = async (req: MulterRequest, res: Response): Promise<Response> => {
  try {
    const { name, price, rating, stockQuantity, category } = req.body;
    
    // Parse and validate numbers
    const parseNumber = (value: any, fieldName: string): number => {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Invalid ${fieldName} value`);
      }
      return num;
    };

    const productData = {
      name,
      price: parseNumber(price, 'price'),
      stockQuantity: parseNumber(stockQuantity, 'stock quantity'),
      ...(category && { category }),
      ...(rating && { rating: parseNumber(rating, 'rating') }),
      ...(req.file && { image: `/uploads/products/${req.file.filename}` })
    };

    const product = await prisma.products.create({
      data: productData,
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return res.status(500).json({ 
      message: "Error creating product",
      error: (error as Error).message 
    });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<Response> => {
  const { productId } = req.params;
  let updateData: any = req.body;

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
      updateData = {
        ...updateData,
        price: updateData.price ? Number(updateData.price) : undefined,
        rating: updateData.rating ? Number(updateData.rating) : undefined,
        stockQuantity: updateData.stockQuantity ? Number(updateData.stockQuantity) : undefined
      };
    }

    // Type validation
    if (updateData.stockQuantity && isNaN(Number(updateData.stockQuantity))) {
      return res.status(400).json({ message: "stockQuantity must be a number" });
    }

    // Debug current state
    const currentProduct = await prisma.products.findUnique({
      where: { productId }
    });

    console.log('\n📦 Current Product State:', {
      productId: currentProduct?.productId,
      currentStock: currentProduct?.stockQuantity,
      requestedChanges: updateData
    });

    // Perform update
    const updatedProduct = await prisma.products.update({
      where: { productId },
      data: updateData
    });

    console.log('\n✅ Update Successful:', {
      productId: updatedProduct.productId,
      updatedFields: Object.keys(updateData),
      newStock: updatedProduct.stockQuantity,
      timestamp: new Date().toISOString()
    });

    return res.json(updatedProduct);
  } catch (error) {
    console.error('\n❌ Update Failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = process.env.NODE_ENV === 'development' ? 
      { stack: error instanceof Error ? error.stack : undefined } : undefined;

    return res.status(500).json({ 
      message: "Error updating product",
      error: errorMessage,
      ...errorDetails
    });
  }
};

export const uploadProductImage = upload.single('image');