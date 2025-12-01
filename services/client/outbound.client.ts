import { CreateOutboundDto, Outbound, OutboundCancleDto } from "@/types/outbound";

const BASE_URL = "/api/outbound";
const CANCEL_URL = "/api/outbound/cancel";

export const outboundClient = {
  create: async (data: CreateOutboundDto): Promise<Outbound> => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to create outbound");
    return result.data;
  },

  getAll: async (): Promise<Outbound[]> => {
    const res = await fetch(BASE_URL);
    const result = await res.json();

    if (!res.ok) throw new Error(result.message || "Failed to fetch data");
    return result.data;
  },

  update: async (id: number, data: CreateOutboundDto): Promise<Outbound> => {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Failed to update outbound");
    return result.data;
  },

  cancel: async (id: string, canceledNote?: string, updatedBy?: string): Promise<OutboundCancleDto> => {
    const res = await fetch(CANCEL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, canceledNote, updatedBy }),
    });
    if (!res.ok) throw new Error("Failed to cancel inbound");
    const data = await res.json();
    return data.data;
  },
};
