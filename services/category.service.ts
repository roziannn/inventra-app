import { Category } from "@/types/category";

const BASE_URL = "/api/master/categories";

export const categoryService = {
  getAllPaged: async (page = 1, limit = 10) => {
    const res = await fetch(`/api/master/categories?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch");
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

  update: async (id: string, data: Partial<Category>) => {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetch(`${BASE_URL}?id=${id}`, { method: "DELETE" });
    return res.json();
  },

  // GET LOV
  getLOV: async (): Promise<Category[]> => {
    const res = await fetch(`${BASE_URL}?type=lov`);
    if (!res.ok) throw new Error("Failed to fetch storage locations");
    return res.json();
  },
};
