import { Brand } from "@/types/brand";

const BASE_URL = "/api/master/brands";

export const brandService = {
  getAllPaged: async (page = 1, limit = 10) => {
    const res = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch brands");
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

  update: async (id: string, data: Partial<Brand>) => {
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
};
