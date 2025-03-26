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
      where: {
        name: {
          contains: search,
        },
      },
    });
    return res.json(products);
  } catch (error) {
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

export const updateProduct = async (req: MulterRequest, res: Response): Promise<Response> => {
  try {
    const { productId } = req.params;
    
    // Parse and validate numbers
    const parseNumber = (value: any, fieldName: string): number => {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Invalid ${fieldName} value`);
      }
      return num;
    };

    const updatedData = {
      name: req.body.name,
      price: parseNumber(req.body.price, 'price'),
      stockQuantity: parseNumber(req.body.stockQuantity, 'stock quantity'),
      ...(req.body.rating && { rating: parseNumber(req.body.rating, 'rating') }),
      ...(req.body.category && { category: req.body.category }),
      ...(req.file && { image: `/uploads/products/${req.file.filename}` })
    };

    const existingProduct = await prisma.products.findUnique({
      where: { productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updatedProduct = await prisma.products.update({
      where: { productId },
      data: updatedData,
    });

    return res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({
      message: "Error updating product",
      error: (error as Error).message,
    });
  }
};

export const uploadProductImage = upload.single('image');