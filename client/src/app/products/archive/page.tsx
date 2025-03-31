// app/products/archive/page.tsx
"use client";

import { useGetProductsQuery } from "@/state/api";
import { SearchIcon, ArchiveIcon, Undo2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { unarchiveProduct, getArchivedProducts } from "@/utils/archive";
import Rating from "@/app/(components)/Rating";

export default function ArchivePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [archivedIds, setArchivedIds] = useState<string[]>(getArchivedProducts());
  const { data: products } = useGetProductsQuery(searchTerm);

  const handleUnarchive = (productId: string) => {
    unarchiveProduct(productId);
    setArchivedIds(archivedIds.filter(id => id !== productId));
  };

  const archivedProducts = products?.filter(product => 
    archivedIds.includes(product.productId)
  );

  return (
    <div className="mx-auto pb-5 w-full">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center border-2 border-gray-200 rounded">
          <SearchIcon className="w-5 h-5 text-gray-500 m-2" />
          <input
            className="w-full py-2 px-4 rounded bg-white"
            placeholder="Search archived products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ArchiveIcon className="w-6 h-6" />
          Archived Products
        </h1>
        <Link
          href="/products"
          className="flex items-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          <Undo2 className="w-5 h-5 mr-2" />
          Back to Products
        </Link>
      </div>

      {/* Archived Products Grid */}
      {archivedProducts?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-between">
          {archivedProducts.map((product) => (
            <div key={product.productId} className="border shadow rounded-md p-4 relative">
              <div className="flex flex-col items-center">
                <Image
                  src={
                    product.image
                      ? `http://localhost:8000${product.image}`
                      : "/assets/default-image.png"
                  }
                  alt={product.name}
                  width={150}
                  height={150}
                  className="mb-3 rounded-2xl w-36 h-36 object-contain"
                />
                <h3 className="text-lg text-gray-900 font-semibold">{product.name}</h3>
                <p className="text-gray-800">${product.price.toFixed(2)}</p>
                <div className="text-sm text-gray-600 mt-1">
                  Stock: {product.stockQuantity}
                </div>
                <div className="flex flex-row justify-center my-2">
                  <Rating rating={product.rating ?? 0} />
                </div>
                <button
                  onClick={() => handleUnarchive(product.productId)}
                  className="mt-2 bg-green-500 hover:bg-green-600 text-white font-medium py-1 px-3 rounded text-sm"
                >
                  Restore Product
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <ArchiveIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No archived products</h3>
          <p className="mt-1 text-gray-500">
            Products you archive will appear here.
          </p>
          <div className="mt-6">
            <Link
              href="/products"
              className="inline-flex items-center rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600"
            >
              <Undo2 className="-ml-0.5 mr-1.5 h-5 w-5" />
              Back to Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}