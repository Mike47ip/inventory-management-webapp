import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Log the API URL for debugging
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);

// Type definitions remain exactly the same
export interface Product {
  productId: string;
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  category?: string;
  image?: string;
}

export interface NewProduct {
  name: string;
  price: number;
  rating?: number;
  stockQuantity: number;
  category?: string;
  image?: File;
}

export interface SalesSummary {
  salesSummaryId: string;
  totalValue: number;
  changePercentage?: number;
  date: string;
}

export interface PurchaseSummary {
  purchaseSummaryId: string;
  totalPurchased: number;
  changePercentage?: number;
  date: string;
}

export interface ExpenseSummary {
  expenseSummarId: string;
  totalExpenses: number;
  date: string;
}

export interface ExpenseByCategorySummary {
  expenseByCategorySummaryId: string;
  category: string;
  amount: string;
  date: string;
}

export interface DashboardMetrics {
  popularProducts: Product[];
  salesSummary: SalesSummary[];
  purchaseSummary: PurchaseSummary[];
  expenseSummary: ExpenseSummary[];
  expenseByCategorySummary: ExpenseByCategorySummary[];
}

export interface User {
  userId: string;
  name: string;
  email: string;
}

export const api = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL }),
  reducerPath: "api",
  tagTypes: ["DashboardMetrics", "Products", "Users", "Expenses"],
  endpoints: (build) => ({
    // Query endpoints remain unchanged
    getDashboardMetrics: build.query<DashboardMetrics, void>({
      query: () => "/dashboard",
      providesTags: ["DashboardMetrics"],
    }),
    
    getProducts: build.query<Product[], string | void>({
      query: (search) => ({
        url: "/products",
        params: search ? { search } : {},
      }),
      providesTags: ["Products"],
    }),
    
    getUsers: build.query<User[], void>({
      query: () => "/users",
      providesTags: ["Users"],
    }),
    
    getExpensesByCategory: build.query<ExpenseByCategorySummary[], void>({
      query: () => "/expenses",
      providesTags: ["Expenses"],
    }),

    // Mutation endpoints with improved implementations
    createProduct: build.mutation<Product, FormData>({
      query: (formData) => ({
        url: "/products",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Products"],
    }),

    // Main updateProduct mutation - handles both FormData and JSON
    updateProduct: build.mutation<
      Product,
      { 
        productId: string; 
        updateData: Partial<Product> | FormData 
      }
    >({
      query: ({ productId, updateData }) => {
        const isFormData = updateData instanceof FormData;
        
        return {
          url: `/products/${productId}`,
          method: "PATCH",
          body: updateData,
          headers: isFormData 
            ? undefined // Browser sets Content-Type for FormData
            : { 'Content-Type': 'application/json' }
        };
      },
      invalidatesTags: ["Products"],
    }),

    // Dedicated mutation for field updates
    updateProductFields: build.mutation<
      Product,
      { 
        productId: string; 
        updateData: Partial<Product> 
      }
    >({
      query: ({ productId, updateData }) => ({
        url: `/products/${productId}`,
        method: "PATCH",
        body: updateData,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }),
      invalidatesTags: ["Products"],
    }),
  }),
});

// Export hooks with all mutations
export const {
  useGetDashboardMetricsQuery,
  useGetProductsQuery,
  useGetUsersQuery,
  useGetExpensesByCategoryQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductFieldsMutation,
} = api;