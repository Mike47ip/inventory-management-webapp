import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

// Custom Request type to include file property for multer uploads
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Get all products, with optional search functionality
export const getProducts = async (req: Request, res: Response): Promise<void> => {
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

// Create a new product, including handling file uploads for image
export const createProduct = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { name, price, rating, stockQuantity, category } = req.body;

    // Handle the uploaded image file (if exists)
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    const product = await prisma.products.create({
      data: {
        name,
        price,
        rating,
        stockQuantity,
        category,
        image, // Save image file path
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product" });
  }
};

// Update an existing product, including handling image file replacement
export const updateProduct = async (req: MulterRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { name, price, rating, stockQuantity, category } = req.body;

    // Handle the uploaded image file (if exists)
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Check if product exists before updating
    const existingProduct = await prisma.products.findUnique({
      where: { productId },
    });

    if (!existingProduct) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Update the product details, including the image if provided
    const updatedProduct = await prisma.products.update({
      where: { productId },
      data: {
        name,
        price,
        rating,
        stockQuantity,
        category,
        image: image || existingProduct.image, // Update image only if a new one is uploaded
      },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product" });
  }
};
