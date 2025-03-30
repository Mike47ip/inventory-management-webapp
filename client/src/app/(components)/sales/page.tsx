"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Search, ShoppingCart, X, Trash2, Plus, Minus, CreditCard, Save } from "lucide-react";
import Header from "@/app/(components)/Header";

// Type definitions
type Product = {
  productId: string;
  name: string;
  price: number;
  stockQuantity: number;
  category?: string;
  image?: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

// Mock data for now - will be replaced with API data later
const mockCustomers: Customer[] = [
  { id: "1", name: "John Doe", email: "john@example.com", phone: "123-456-7890" },
  { id: "2", name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210" },
  { id: "3", name: "Bob Johnson", email: "bob@example.com" },
];

const SalesPage = () => {
  // State declarations
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [note, setNote] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  // Mock loading products - replace with API call later
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Mock data
      const mockProducts: Product[] = [
        {
          productId: "1",
          name: "Smartphone X",
          price: 799.99,
          stockQuantity: 15,
          category: "Electronics",
          image: "/assets/default-image.png",
        },
        {
          productId: "2",
          name: "Wireless Headphones",
          price: 149.99,
          stockQuantity: 30000,
          category: "Electronics",
          image: "/assets/default-image.png",
        },
        {
          productId: "3",
          name: "Designer T-Shirt",
          price: 49.99,
          stockQuantity: 100000,
          category: "Clothing",
          image: "/assets/default-image.png",
        },
        {
          productId: "4",
          name: "Organic Coffee Beans",
          price: 12.99,
          stockQuantity: 50,
          category: "Food & Beverage",
          image: "/assets/default-image.png",
        },
        {
          productId: "5",
          name: "Fitness Tracker",
          price: 89.99,
          stockQuantity: 20,
          category: "Electronics",
          image: "/assets/default-image.png",
        },
      ];

      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let result = products;

    if (searchTerm) {
      result = result.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter) {
      result = result.filter((product) => product.category === categoryFilter);
    }

    setFilteredProducts(result);
  }, [searchTerm, categoryFilter, products]);

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = products.map((product) => product.category).filter(Boolean) as string[];
    return ["", ...Array.from(new Set(cats))];
  }, [products]);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm) return mockCustomers;
    return mockCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(customerSearchTerm))
    );
  }, [customerSearchTerm]);

  // Cart functions
  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product.productId === product.productId);

    if (existingItem) {
      // Don't exceed available stock
      if (existingItem.quantity >= product.stockQuantity) {
        return;
      }

      setCart(
        cart.map((item) =>
          item.product.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.productId !== productId));
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    // Handle invalid input
    if (isNaN(newQuantity) || newQuantity === 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity < 0) {
      return; // Ignore negative quantities
    }

    const product = products.find((p) => p.productId === productId);
    if (!product) {
      return;
    }

    // Enforce stock limit
    const quantity = Math.min(newQuantity, product.stockQuantity);
    
    setCart(
      cart.map((item) =>
        item.product.productId === productId
          ? { ...item, quantity: quantity }
          : item
      )
    );
  };

  // Calculations
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
    [cart]
  );

  const discount = useMemo(
    () => (subtotal * discountPercent) / 100,
    [subtotal, discountPercent]
  );

  const tax = useMemo(() => (subtotal - discount) * 0.1, [subtotal, discount]); // 10% tax
  const total = useMemo(() => subtotal - discount + tax, [subtotal, discount, tax]);

  // Process sale
  const processSale = () => {
    // Will be connected to API later
    console.log({
      customer: selectedCustomer,
      items: cart,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod,
      note,
    });

    // Reset state after sale
    setCart([]);
    setSelectedCustomer(null);
    setNote("");
    setDiscountPercent(0);
    setPaymentMethod("cash");
  };

  // Check if we can proceed with sale
  const canProcessSale = cart.length > 0;

  return (
    <div className="flex flex-col h-full min-h-screen bg-gray-50">
      <Header name="Sales" />

      <div className="flex flex-col md:flex-row flex-1 gap-6 p-6">
        {/* Left side - Products */}
        <div className="w-full md:w-7/12 lg:w-8/12 bg-white rounded-lg shadow-md p-4">
          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) =>
                category ? (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ) : null
              )}
            </select>
          </div>

          {/* Products grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.productId}
                  className="border rounded-lg p-3 flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => addToCart(product)}
                >
                  <div className="h-32 relative mb-2">
                    <Image
                      src={product.image || "/assets/default-image.png"}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                  <div className="mt-1 flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.stockQuantity > 0 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {product.stockQuantity > 0 
                        ? `Stock: ${product.stockQuantity}` 
                        : "Out of stock"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 && !isLoading && (
            <div className="text-center py-10">
              <p className="text-gray-500">No products found. Try a different search term.</p>
            </div>
          )}
        </div>

        {/* Right side - Cart */}
        <div className="w-full md:w-5/12 lg:w-4/12 bg-white rounded-lg shadow-md p-4 flex flex-col">
          {/* Customer selection */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900">Customer</h3>
              <button
                onClick={() => setShowCustomerSearch(!showCustomerSearch)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showCustomerSearch ? "Cancel" : selectedCustomer ? "Change" : "Select"}
              </button>
            </div>

            {showCustomerSearch ? (
              <div>
                <div className="relative mb-2">
                  <input
                    type="text"
                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search customers..."
                    value={customerSearchTerm}
                    onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  />
                </div>
                <ul className="max-h-40 overflow-auto border border-gray-200 rounded-md divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <li
                      key={customer.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowCustomerSearch(false);
                        setCustomerSearchTerm("");
                      }}
                    >
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                      {customer.phone && (
                        <div className="text-sm text-gray-500">{customer.phone}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="border rounded-md p-2 bg-gray-50">
                {selectedCustomer ? (
                  <div>
                    <div className="font-medium">{selectedCustomer.name}</div>
                    <div className="text-sm text-gray-500">{selectedCustomer.email}</div>
                    {selectedCustomer.phone && (
                      <div className="text-sm text-gray-500">{selectedCustomer.phone}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No customer selected</div>
                )}
              </div>
            )}
          </div>

          {/* Cart items */}
          <h3 className="font-medium text-gray-900 mb-2">Cart Items</h3>
          <div className="flex-1 overflow-auto mb-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Your cart is empty</p>
                <p className="text-sm">Add products to get started</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <li key={item.product.productId} className="py-3">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-gray-500 text-sm">
                          ${item.product.price.toFixed(2)} × 
                          <span 
                            className="cursor-pointer hover:text-blue-600 hover:underline"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Focus the quantity input field when clicked
                              const inputEl = document.getElementById(`quantity-${item.product.productId}`);
                              if (inputEl) inputEl.focus();
                            }}
                          >
                            {item.quantity}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <div className="flex items-center mt-1">
                          <button
                            onClick={() =>
                              updateCartItemQuantity(
                                item.product.productId,
                                item.quantity - 1
                              )
                            }
                            className="p-1 text-gray-400 hover:text-gray-700"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input
                            id={`quantity-${item.product.productId}`}
                            type="number"
                            min="1"
                            max={item.product.stockQuantity}
                            value={item.quantity}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value, 10);
                              if (!isNaN(newQuantity)) {
                                updateCartItemQuantity(
                                  item.product.productId,
                                  newQuantity
                                );
                              }
                            }}
                            className="mx-1 w-full text-center border rounded-md p-1 text-sm"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={() =>
                              updateCartItemQuantity(
                                item.product.productId,
                                item.quantity + 1
                              )
                            }
                            className="p-1 text-gray-400 hover:text-gray-700"
                            disabled={item.quantity >= item.product.stockQuantity}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.product.productId)}
                            className="ml-3 p-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cart summary */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            {/* Discount */}
            <div className="flex items-center mb-2">
              <label className="flex-1 text-gray-600">Discount (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-20 text-right border rounded-md p-1"
              />
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="mt-4">
            <h3 className="font-medium text-gray-900 mb-2">Payment Method</h3>
            <div className="flex space-x-2">
              <button
                className={`flex-1 py-2 px-3 rounded-md ${
                  paymentMethod === "cash"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => setPaymentMethod("cash")}
              >
                Cash
              </button>
              <button
                className={`flex-1 py-2 px-3 rounded-md flex items-center justify-center ${
                  paymentMethod === "card"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                <CreditCard className="h-4 w-4 mr-1" /> Card
              </button>
              <button
                className={`flex-1 py-2 px-3 rounded-md ${
                  paymentMethod === "other"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
                onClick={() => setPaymentMethod("other")}
              >
                Other
              </button>
            </div>
          </div>

          {/* Note */}
          <div className="mt-4">
            <label htmlFor="note" className="block font-medium text-gray-900 mb-2">
              Note
            </label>
            <textarea
              id="note"
              rows={2}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Add a note to this sale (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            ></textarea>
          </div>

          {/* Process sale button */}
          <button
            onClick={processSale}
            disabled={!canProcessSale}
            className={`mt-4 w-full py-3 px-4 rounded-md font-medium ${
              canProcessSale
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            } flex items-center justify-center`}
          >
            <Save className="h-5 w-5 mr-2" />
            Process Sale
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesPage;