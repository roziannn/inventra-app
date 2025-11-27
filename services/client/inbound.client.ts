import { CreateInboundDto, UpdateInboundDto, InboundListDto } from "@/types/inbound";

const BASE_URL = "/api/inbound";

export const inboundClient = {
  getAll: async (): Promise<{ data: InboundListDto[] }> => {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch inbounds");
    return res.json();
  },

  create: async (payload: CreateInboundDto): Promise<{ data: InboundListDto }> => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create inbound");
    return res.json();
  },

  update: async (id: string, payload: UpdateInboundDto): Promise<{ data: InboundListDto }> => {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update inbound");
    return res.json();
  },

  delete: async (id: string): Promise<{ data: { success: boolean } }> => {
    const res = await fetch(`${BASE_URL}?id=${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete inbound");
    return res.json();
  },
};
