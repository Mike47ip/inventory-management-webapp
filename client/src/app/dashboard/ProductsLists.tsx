import React, { useState } from "react";
import { useGetProductsQuery } from "@/state/api";

const ProductsList: React.FC = () => {
  console.log("ProductsList component loaded");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: products, error, isLoading } = useGetProductsQuery(searchTerm);


    // Add logging for debugging purposes
    console.log("Products:", products); // Check if products are being fetched
    console.log("Error:", error);       // Check if there is any error
    console.log("Loading:", isLoading); // See if the loading state is working

  // Loading and error handling
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading products</div>;

  return (
    <div>
      <h1>Products</h1>
      <input
        type="text"
        placeholder="Search products"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {products?.map((product) => (
        <div key={product.productId}>
          <p>{product.name}</p>
          <p>Price: ${product.price}</p>
          <p>Stock: {product.stockQuantity}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductsList;