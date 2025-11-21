import { Category } from "@/types/category";

const BASE_URL = "/api/master/categories";

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
  },

  create: async (name: string) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return res.json();
  },

  update: async (id: string, name: string) => {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${BASE_URL}?id=${id}`, { method: "DELETE" });
    return res.json();
  },
};
