import { Product } from "@/types/product";

const BASE_URL = "/api/products";

export const productService = {
  getAllPaged: async (page = 1, limit = 10) => {
    const res = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${data.error ?? JSON.stringify(data)}`);
    }
    return data;
  },

  getById: async (id: string) => {
    const res = await fetch(`${BASE_URL}?id=${id}`);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(`Failed to fetch product: ${data.error ?? JSON.stringify(data)}`);
    }
    return data;
  },

  create: async (data: Partial<Product>) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error ?? "Failed to create product");
    return result;
  },

  update: async (id: string, data: Partial<Product>) => {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error ?? "Failed to update product");
    return result;
  },

  // Delete product by ID
  delete: async (id: string) => {
    const res = await fetch(`${BASE_URL}?id=${id}`, { method: "DELETE" });
    return res.json();
  },
};
