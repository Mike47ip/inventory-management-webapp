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
    fileSize: 5 * 1024 * 1024 // 5MB limit
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

export const getProducts = async (
 req: Request,
 res: Response
): Promise<void> => {
 try {
  const search = req.query.search?.toString();
  const products = await prisma.products.findMany({
   where: {
    name: {
     contains: search,
    },
   },
  });
  res.json(products);
 } catch (error) {
  res.status(500).json({ message: "Error retrieving products" });
 }
};

export const createProduct = async (
 req: MulterRequest,
 res: Response
): Promise<void> => {
 try {
  const { name, price, rating, stockQuantity, category } = req.body;
  
  const productData: any = {
    name,
    price: parseFloat(price),
    stockQuantity: parseInt(stockQuantity),
    category,
  };

  if (rating) {
    productData.rating = parseFloat(rating);
  }

  if (req.file) {
    console.log('Uploaded file details:', req.file);
    productData.image = `/uploads/products/${req.file.filename}`;
  }

  const product = await prisma.products.create({
   data: productData,
  });

  res.status(201).json(product);
 } catch (error) {
  console.error("Error creating product:", error);
  res.status(500).json({ 
    message: "Error creating product",
    error: (error as Error).message 
  });
 }
};

export const updateProduct = async (
 req: MulterRequest,
 res: Response
): Promise<void> => {
 try {
  const { productId } = req.params;
  const updatedData: any = req.body;

  if (req.file) {
    console.log('Uploaded file details:', req.file);
    updatedData.image = `/uploads/products/${req.file.filename}`;
  }

  const existingProduct = await prisma.products.findUnique({
   where: { productId },
  });

  if (!existingProduct) {
   res.status(404).json({ message: "Product not found" });
   return;
  }

  const updatedProduct = await prisma.products.update({
   where: { productId },
   data: updatedData,
  });

  res.status(200).json(updatedProduct);
 } catch (error) {
  console.error("Error updating product:", error);
  res.status(500).json({
    message: "Error updating product",
    error: (error as Error).message,
   });
 }
};

export const uploadProductImage = upload.single('image');
