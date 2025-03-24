import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
 req: Request,
 res: Response
): Promise<void> => {
 try {
  const { productId, name, price, rating, stockQuantity, category, image } =
   req.body; // Include category and image
  const product = await prisma.products.create({
   data: {
    productId,
    name,
    price,
    rating,
    stockQuantity,
    category, // Add category
    image, // Add image
   },
  });
  res.status(201).json(product);
 } catch (error) {
  res.status(500).json({ message: "Error creating product" });
 }
};

export const updateProduct = async (
 req: Request,
 res: Response
): Promise<void> => {
 try {
  const { productId } = req.params;
  const updatedData = req.body;

  // Check if product exists before updating
  const existingProduct = await prisma.products.findUnique({
   where: { productId },
  });

  if (!existingProduct) {
   res.status(404).json({ message: "Product not found" });
   return;
  }

  // Update the product
  const updatedProduct = await prisma.products.update({
   where: { productId },
   data: updatedData, // This will now include category and image
  });

  res.status(200).json(updatedProduct);
 } catch (error) {
  console.error("Error updating product:", error);
  res
   .status(500)
   .json({
    message: "Error updating product",
    error: (error as Error).message,
   });
 }
};
