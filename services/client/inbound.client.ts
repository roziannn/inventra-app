import { CreateInboundDto, UpdateInboundDto, InboundListDto, UpdateTrackingDto } from "@/types/inbound";

const BASE_URL = "/api/inbound";
const CANCEL_URL = "/api/inbound/cancel";
const TRACKING_URL = "/api/inbound/tracking";

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

  cancel: async (id: string, canceledNote?: string, updatedBy?: string): Promise<InboundListDto> => {
    const res = await fetch(CANCEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, canceledNote, updatedBy }),
    });
    if (!res.ok) throw new Error("Failed to cancel inbound");
    const data = await res.json();
    return data.data;
  },

  updateTracking: async (id: string, payload: UpdateTrackingDto): Promise<InboundListDto> => {
    const res = await fetch(TRACKING_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...payload }),
    });
    if (!res.ok) throw new Error("Failed to update tracking");
    const data = await res.json();
    return data.data;
  },

  getById: async (id: string): Promise<InboundListDto> => {
    const res = await fetch(`${TRACKING_URL}?id=${id}`);
    if (!res.ok) throw new Error("Failed to fetch inbound");
    const data = await res.json();
    return data.data;
  },
};
