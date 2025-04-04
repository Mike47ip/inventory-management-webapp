"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
 Search,
 ShoppingCart,
 X,
 Trash2,
 Plus,
 Minus,
 CreditCard,
 Save,
 CheckCircle,
 MoreHorizontal,
 Eye,
} from "lucide-react";
import Header from "@/app/(components)/Header";
import { useCategories } from "@/app/(context)/CategoryContext";
import { useGetProductsQuery } from "@/state/api";

// Type definitions
type Product = {
 productId: string;
 name: string;
 price: number;
 stockQuantity: number;
 currency?: string;
 stockUnit?: string;
 category?: string;
 image?: string;
 rating?: number;
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

type PendingSaleData = {
  customer: Customer | null;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  note: string;
};

// Currency symbols mapping
const currencySymbols = {
 GHC: "₵",
 USD: "$",
 EUR: "€",
 GBP: "£",
 CAD: "C$",
};

// Mock data for customers - will be replaced with API data later
const mockCustomers: Customer[] = [
 {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  phone: "123-456-7890",
 },
 {
  id: "2",
  name: "Jane Smith",
  email: "jane@example.com",
  phone: "987-654-3210",
 },
 { id: "3", name: "Bob Johnson", email: "bob@example.com" },
];

export default function SalesPage() {
 console.log("========== SalesPage COMPONENT MOUNTING ==========");
 
 const router = useRouter();
 
 // Get categories from context
 const { categories } = useCategories();

 // State declarations - Initialize cart from localStorage if available
 const [cart, setCart] = useState<CartItem[]>(() => {
  console.log("Initializing cart state");
  // Try to initialize from localStorage if available
  if (typeof window !== 'undefined') {
    const pendingSaleData = localStorage.getItem('pendingSale');
    if (pendingSaleData) {
      try {
        const parsedData: PendingSaleData = JSON.parse(pendingSaleData);
        console.log('Initializing cart from localStorage:', parsedData.items.length, 'items');
        console.log('Cart items from localStorage:', parsedData.items.map(item => 
          `${item.product.name} (${item.quantity}x at ${item.product.price})`).join(', '));
        return parsedData.items;
      } catch (error) {
        console.error('Error parsing pending sale data during initialization:', error);
      }
    } else {
      console.log('No pendingSale data found in localStorage during initialization');
    }
  }
  return []; // Default empty cart
 });
 
 console.log("Initial cart state after initialization:", cart.length, "items");
 
 const [searchTerm, setSearchTerm] = useState("");
 const [categoryFilter, setCategoryFilter] = useState("");
 
 const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(() => {
  if (typeof window !== 'undefined') {
    const pendingSaleData = localStorage.getItem('pendingSale');
    if (pendingSaleData) {
      try {
        const parsedData: PendingSaleData = JSON.parse(pendingSaleData);
        return parsedData.customer;
      } catch (error) {
        console.error('Error parsing customer data during initialization:', error);
      }
    }
  }
  return null;
 });
 
 const [customerSearchTerm, setCustomerSearchTerm] = useState("");
 const [showCustomerSearch, setShowCustomerSearch] = useState(false);
 
 const [paymentMethod, setPaymentMethod] = useState(() => {
  if (typeof window !== 'undefined') {
    const pendingSaleData = localStorage.getItem('pendingSale');
    if (pendingSaleData) {
      try {
        const parsedData: PendingSaleData = JSON.parse(pendingSaleData);
        return parsedData.paymentMethod || "cash";
      } catch (error) {
        console.error('Error parsing payment method during initialization:', error);
      }
    }
  }
  return "cash";
 });
 
 const [note, setNote] = useState(() => {
  if (typeof window !== 'undefined') {
    const pendingSaleData = localStorage.getItem('pendingSale');
    if (pendingSaleData) {
      try {
        const parsedData: PendingSaleData = JSON.parse(pendingSaleData);
        return parsedData.note || "";
      } catch (error) {
        console.error('Error parsing note during initialization:', error);
      }
    }
  }
  return "";
 });
 
 const [discountPercent, setDiscountPercent] = useState(() => {
  if (typeof window !== 'undefined') {
    const pendingSaleData = localStorage.getItem('pendingSale');
    if (pendingSaleData) {
      try {
        const parsedData: PendingSaleData = JSON.parse(pendingSaleData);
        if (parsedData.subtotal > 0 && parsedData.discount > 0) {
          return (parsedData.discount / parsedData.subtotal) * 100;
        }
      } catch (error) {
        console.error('Error parsing discount during initialization:', error);
      }
    }
  }
  return 0;
 });

 // State for product view/action dropdown
 const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);
 const [productToView, setProductToView] = useState<Product | null>(null);
 const [isViewModalOpen, setIsViewModalOpen] = useState(false);

 // Fetch products from API
 const {
  data: products = [],
  isLoading,
  isError,
 } = useGetProductsQuery(searchTerm);

 // Check for pending sale data in localStorage when component mounts
 useEffect(() => {
  console.log("========== SALES PAGE useEffect FOR CART RESTORATION ==========");
  console.log("Current cart length:", cart.length);
  
  if (typeof window !== 'undefined') {
    const pendingSaleData = localStorage.getItem('pendingSale');
    console.log("pendingSale in localStorage:", pendingSaleData ? 'FOUND' : 'NOT FOUND');
    
    if (pendingSaleData) {
      try {
        const parsedData: PendingSaleData = JSON.parse(pendingSaleData);
        console.log('Parsed pendingSale data:', {
          itemsCount: parsedData.items.length,
          customerExists: !!parsedData.customer,
          subtotal: parsedData.subtotal,
          discount: parsedData.discount,
          paymentMethod: parsedData.paymentMethod
        });
        
        // Show notification about restored cart
        if (parsedData.items.length > 0) {
          console.log('Setting notification for restored cart');
          setNotification({
            show: true,
            message: "Cart restored from previous session",
            type: "info",
          });
          
          // Auto-hide notification after 3 seconds
          setTimeout(() => {
            setNotification((prev) => ({ ...prev, show: false }));
          }, 3000);
        }
      } catch (error) {
        console.error('Error parsing pending sale data in useEffect:', error);
      }
    }
  }
 }, []); // Only run once on component mount

 // Filter products based on search and category
 const filteredProducts = useMemo(() => {
  let result = [...products];

  if (categoryFilter) {
   result = result.filter((product) => product.category === categoryFilter);
  }

  return result;
 }, [products, categoryFilter]);

 // Toast notification state
 const [notification, setNotification] = useState<{
  show: boolean;
  message: string;
  type: "success" | "error" | "info";
 }>({
  show: false,
  message: "",
  type: "info",
 });

 // Format price with currency
 const formatPrice = (product: Product): string => {
  const currency = product.currency || "GHC";
  const symbol =
   currencySymbols[currency as keyof typeof currencySymbols] || currency;
  return `${symbol}${product.price.toFixed(2)}`;
 };

 // Format stock with unit
 const formatStock = (product: Product): string => {
  const unit = product.stockUnit || "Units";
  return `${product.stockQuantity} ${unit}`;
 };

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
  console.log(`Adding product to cart: ${product.name}`);
  const existingItem = cart.find(
   (item) => item.product.productId === product.productId
  );

  if (existingItem) {
   // Don't exceed available stock
   if (existingItem.quantity >= product.stockQuantity) {
    console.log(`Cannot add more ${product.name} - reached max stock of ${product.stockQuantity}`);
    return;
   }

   console.log(`Increasing quantity of ${product.name} from ${existingItem.quantity} to ${existingItem.quantity + 1}`);
   setCart(
    cart.map((item) =>
     item.product.productId === product.productId
      ? { ...item, quantity: item.quantity + 1 }
      : item
    )
   );
  } else {
   console.log(`Adding new product to cart: ${product.name} (qty: 1)`);
   setCart([...cart, { product, quantity: 1 }]);
  }
  
  // Update localStorage with new cart
  updatePendingSaleInLocalStorage([...cart, { product, quantity: 1 }]);
 };

 const removeFromCart = (productId: string) => {
  console.log(`Removing product from cart: id=${productId}`);
  const newCart = cart.filter((item) => item.product.productId !== productId);
  setCart(newCart);
  
  // Update localStorage with new cart
  updatePendingSaleInLocalStorage(newCart);
 };

 const updateCartItemQuantity = (productId: string, newQuantity: number) => {
  console.log(`Updating quantity for product id=${productId} to ${newQuantity}`);
  // Handle invalid input
  if (isNaN(newQuantity) || newQuantity === 0) {
   console.log(`Invalid quantity ${newQuantity}, removing item from cart`);
   removeFromCart(productId);
   return;
  }

  if (newQuantity < 0) {
   console.log(`Negative quantity ${newQuantity} not allowed`);
   return; // Ignore negative quantities
  }

  const product = products.find((p) => p.productId === productId);
  if (!product) {
   console.log(`Product id=${productId} not found in products list`);
   return;
  }

  // Enforce stock limit
  const quantity = Math.min(newQuantity, product.stockQuantity);
  console.log(`Enforcing stock limit: requested=${newQuantity}, available=${product.stockQuantity}, final=${quantity}`);

  const newCart = cart.map((item) =>
    item.product.productId === productId
      ? { ...item, quantity: quantity }
      : item
  );
  
  setCart(newCart);
  
  // Update localStorage with new cart
  updatePendingSaleInLocalStorage(newCart);
 };

 // Helper function to update localStorage with current cart state
 const updatePendingSaleInLocalStorage = (currentCart: CartItem[]) => {
  console.log(`Updating localStorage with cart of ${currentCart.length} items`);
  
  // Calculate values based on current cart
  const currentSubtotal = currentCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const currentDiscount = (currentSubtotal * discountPercent) / 100;
  const currentTax = (currentSubtotal - currentDiscount) * 0.1;
  const currentTotal = currentSubtotal - currentDiscount + currentTax;
  
  const pendingSaleData = {
    customer: selectedCustomer,
    items: currentCart,
    subtotal: currentSubtotal,
    discount: currentDiscount,
    tax: currentTax,
    total: currentTotal,
    paymentMethod,
    note,
  };
  
  localStorage.setItem('pendingSale', JSON.stringify(pendingSaleData));
  console.log('Cart saved to localStorage');
 };

 // Calculations
 const subtotal = useMemo(
  () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  [cart]
 );

 const discount = useMemo(
  () => (subtotal * discountPercent) / 100,
  [subtotal, discountPercent]
 );

 const tax = useMemo(() => (subtotal - discount) * 0.1, [subtotal, discount]); // 10% tax
 const total = useMemo(
  () => subtotal - discount + tax,
  [subtotal, discount, tax]
 );

 // Process sale - Save to localStorage and redirect to confirmation page
 const processSale = () => {
  console.log("========== PROCESSING SALE ==========");
  console.log(`Processing sale with ${cart.length} items`);
  console.log(`Cart items: ${cart.map(item => `${item.product.name} (${item.quantity}x)`).join(', ')}`);
  
  // Store the pending sale data in localStorage
  const pendingSaleData = {
   customer: selectedCustomer,
   items: cart,
   subtotal,
   discount,
   tax,
   total,
   paymentMethod,
   note,
  };
  
  console.log('Saving finalized sale data to localStorage:', {
    itemCount: pendingSaleData.items.length,
    subtotal: pendingSaleData.subtotal,
    total: pendingSaleData.total,
    hasCustomer: !!pendingSaleData.customer
  });
  
  // Save to localStorage so the confirmation page can access it
  localStorage.setItem('pendingSale', JSON.stringify(pendingSaleData));
  
  // Navigate to the confirmation page
  console.log('Navigating to confirmation page');
  router.push('/sales/confirm');
 };

 // Check if we can proceed with sale
 const canProcessSale = cart.length > 0;

 // Update localStorage when discount changes
 useEffect(() => {
  if (cart.length > 0) {
    console.log(`Discount percent changed to ${discountPercent}%, updating localStorage`);
    updatePendingSaleInLocalStorage(cart);
  }
 }, [discountPercent]);

 // Update localStorage when note changes
 useEffect(() => {
  if (cart.length > 0) {
    console.log(`Note changed, updating localStorage`);
    updatePendingSaleInLocalStorage(cart);
  }
 }, [note]);

 // Update localStorage when payment method changes
 useEffect(() => {
  if (cart.length > 0) {
    console.log(`Payment method changed to ${paymentMethod}, updating localStorage`);
    updatePendingSaleInLocalStorage(cart);
  }
 }, [paymentMethod]);

 // Update localStorage when customer changes
 useEffect(() => {
  if (cart.length > 0) {
    console.log(`Customer changed to ${selectedCustomer?.name || 'none'}, updating localStorage`);
    updatePendingSaleInLocalStorage(cart);
  }
 }, [selectedCustomer]);

 return (
  <div className="flex flex-col h-full min-h-screen bg-gray-50 relative">
   <Header name="Sales" />

   {/* Toast Notification */}
   {notification.show && (
    <div
     className={`fixed right-4 top-20 z-50 flex items-center p-4 rounded-lg shadow-lg transform transition-transform duration-500 ease-in-out translate-x-0 ${
      notification.type === "success"
       ? "bg-green-100 text-green-800 border-l-4 border-green-500"
       : notification.type === "error"
       ? "bg-red-100 text-red-800 border-l-4 border-red-500"
       : "bg-blue-100 text-blue-800 border-l-4 border-blue-500"
     }`}
    >
     <div className="flex items-center">
      {notification.type === "success" && (
       <CheckCircle className="h-5 w-5 mr-2" />
      )}
      {notification.type === "error" && <X className="h-5 w-5 mr-2" />}
      <p className="font-medium">{notification.message}</p>
     </div>
     <button
      className="ml-auto pl-3"
      onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
     >
      <X className="h-4 w-4 text-gray-500" />
     </button>
    </div>
   )}

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
       {categories.map((category) => (
        <option key={category} value={category}>
         {category}
        </option>
       ))}
      </select>
     </div>

     {/* Products grid */}
     {isLoading ? (
      <div className="flex justify-center items-center h-64">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
     ) : isError ? (
      <div className="text-center py-10">
       <p className="text-red-500">Error loading products. Please try again.</p>
      </div>
     ) : (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
       {filteredProducts.map((product) => {
        // Check if this product is in the cart
        const isInCart = cart.some(
         (item) => item.product.productId === product.productId
        );

        return (
         <div
          key={product.productId}
          className={`border rounded-lg p-3 flex flex-col hover:shadow-md transition-all cursor-pointer relative ${
           isInCart ? "border-blue-500 border-2 shadow-md" : "border-gray-200"
          }`}
          onClick={() => addToCart(product)}
         >
          {/* More Options Icon positioned in top-right corner */}
          <MoreHorizontal
           className="absolute top-2 right-2 text-gray-400 cursor-pointer z-10"
           onClick={(e) => {
            e.stopPropagation();
            // Toggle dropdown for this product
            setDropdownVisible(
             dropdownVisible === product.productId ? null : product.productId
            );
           }}
          />

          {/* Dropdown Menu */}
          {dropdownVisible === product.productId && (
           <div className="absolute top-8 right-2 bg-white shadow rounded-md z-20">
            <button
             className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
             onClick={(e) => {
              e.stopPropagation();
              // Set product to view and open modal
              setProductToView(product);
              setIsViewModalOpen(true);
              setDropdownVisible(null);
             }}
            >
             View
            </button>
           </div>
          )}

          {isInCart && (
           <div className="absolute top-0 left-0 m-2 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
            In Cart
           </div>
          )}

          <div className="h-32 relative mb-2">
           <Image
            src={
             product.image
              ? `http://localhost:8000${product.image}`
              : "/assets/default-image.png"
            }
            alt={product.name}
            fill
            className="object-contain"
            onError={(e) => {
             (e.target as HTMLImageElement).src = "/assets/default-image.png";
            }}
           />
          </div>
          <h3 className="font-medium text-gray-900 text-md truncate">
           {product.name}
          </h3>
          <div className="mt-1 flex justify-between space-y-1">
           <span
            className={`text-xs px-2 py-1 rounded-full self-start flex flex-col ${
             product.stockQuantity > 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
            }`}
           >
            <span>
             {product.stockQuantity > 0 ? (
              <>
               <span className="font-bold">{product.stockQuantity}</span>
               <span> {product.stockUnit || "Units"}</span>
              </>
             ) : (
              "Out of stock"
             )}
            </span>
           </span>
           <span className=" text-md font-semibold text-gray-900">
            {formatPrice(product)}
           </span>
          </div>
         </div>
        );
       })}
      </div>
     )}

     {filteredProducts.length === 0 && !isLoading && !isError && (
      <div className="text-center py-10">
       <p className="text-gray-500">
        No products found. Try a different search term or category.
       </p>
      </div>
     )}
    </div>

    {/* Right side - Cart */}
    <div className="w-full md:w-5/12 lg:w-4/12 bg-white rounded-lg shadow-md flex flex-col h-screen sticky top-0">
     {/* Customer selection */}
     <div className="p-4 border-b">
      <h3 className="font-medium text-gray-900 mb-2">Customer</h3>
      <div className="flex justify-between items-center">
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
     <div className="p-4 overflow-y-auto flex-1 min-h-[250px] max-h-[400px]">
      <h3 className="font-medium text-gray-900 mb-2">Cart Items</h3>
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
             {formatPrice(item.product)} ×
             <span
              className="cursor-pointer hover:text-blue-600 hover:underline"
              onClick={(e) => {
               e.stopPropagation();
               // Focus the quantity input field when clicked
               const inputEl = document.getElementById(
                `quantity-${item.product.productId}`
               );
               if (inputEl) inputEl.focus();
              }}
             >
              {item.quantity}
             </span>
            </p>
           </div>
           <div className="text-right">
            <p className="font-medium">
             {formatPrice({
              ...item.product,
              price: item.product.price * item.quantity,
             })}
            </p>
            <div className="flex items-center mt-1">
             <button
              onClick={(e) => {
               e.stopPropagation();
               updateCartItemQuantity(
                item.product.productId,
                item.quantity - 1
               );
              }}
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
                updateCartItemQuantity(item.product.productId, newQuantity);
               }
              }}
              className="mx-1 w-12 text-center border rounded-md p-1 text-sm"
              onClick={(e) => e.stopPropagation()}
             />
             <button
              onClick={(e) => {
               e.stopPropagation();
               updateCartItemQuantity(
                item.product.productId,
                item.quantity + 1
               );
              }}
              className="p-1 text-gray-400 hover:text-gray-700"
              disabled={item.quantity >= item.product.stockQuantity}
             >
              <Plus className="h-4 w-4" />
             </button>
             <button
              onClick={(e) => {
               e.stopPropagation();
               removeFromCart(item.product.productId);
              }}
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

     <div className="p-4 border-t bg-white !h-[3500px] overflow-y-auto">
      {/* Cart summary */}
      <div className="space-y-2">
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

   {/* Product View Modal */}
   {isViewModalOpen && productToView && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
     <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
       <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
       <button
        className="text-gray-500 hover:text-gray-700"
        onClick={() => {
         setIsViewModalOpen(false);
         setProductToView(null);
        }}
       >
        <X className="w-5 h-5" />
       </button>
      </div>

      <div className="flex flex-col items-center mb-4">
       <div className="h-48 w-48 relative mb-3">
        <Image
         src={
          productToView.image
           ? `http://localhost:8000${productToView.image}`
           : "/assets/default-image.png"
         }
         alt={productToView.name}
         fill
         className="object-contain rounded-md"
         onError={(e) => {
          (e.target as HTMLImageElement).src = "/assets/default-image.png";
         }}
        />
       </div>
      </div>

      <div className="space-y-3">
       <div className="border-b pb-2">
        <h4 className="font-medium text-gray-500">Name</h4>
        <p className="text-lg">{productToView.name}</p>
       </div>

       <div className="border-b pb-2">
        <h4 className="font-medium text-gray-500">Price</h4>
        <p className="text-lg">{formatPrice(productToView)}</p>
       </div>

       <div className="border-b pb-2">
        <h4 className="font-medium text-gray-500">Stock</h4>
        <p className="text-lg">{formatStock(productToView)}</p>
       </div>

       {productToView.category && (
        <div className="border-b pb-2">
         <h4 className="font-medium text-gray-500">Category</h4>
         <p className="text-lg">{productToView.category}</p>
        </div>
       )}

       {productToView.rating !== undefined && (
        <div className="border-b pb-2">
         <h4 className="font-medium text-gray-500">Rating</h4>
         <p className="text-lg">{productToView.rating} / 5</p>
        </div>
       )}
      </div>

      <div className="mt-6 flex justify-center">
       <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => {
         addToCart(productToView);
         setIsViewModalOpen(false);
         setProductToView(null);

         // Show notification
         setNotification({
          show: true,
          message: `${productToView.name} added to cart`,
          type: "success",
         });

         // Auto-hide notification after 3 seconds
         setTimeout(() => {
          setNotification((prev) => ({ ...prev, show: false }));
         }, 3000);
        }}
       >
        Add to Cart
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 )};