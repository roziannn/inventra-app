import { CreateZoneDto, UpdateZoneDto, ZoneListDto } from "@/types/zone";

const BASE_URL = "/api/master/zone";

export const zoneClient = {
  getAll: async (): Promise<ZoneListDto[]> => {
    const res = await fetch(BASE_URL);
    const result = await res.json();

    if (!res.ok) throw new Error(result.message || "Failed to fetch zones");
    return result.data;
  },

  getAllPaged: async (page = 1, limit = 10) => {
    const res = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch zones");
    return res.json();
  },

  create: async (payload: CreateZoneDto): Promise<ZoneListDto> => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok || !result.success) throw new Error(result.message || "Failed to create zone");
    return result.data;
  },

  update: async (id: string, payload: UpdateZoneDto): Promise<{ data: ZoneListDto }> => {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update zone");
    return res.json();
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    const res = await fetch(`${BASE_URL}?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete zone");
    return res.json();
  },

  getById: async (id: string): Promise<ZoneListDto> => {
    const res = await fetch(`${BASE_URL}?id=${id}`);
    if (!res.ok) throw new Error("Failed to fetch zone");
    const data = await res.json();
    return data.data;
  },
};
