import { CreateOutboundDto, Outbound } from "@/types/outbound";

const BASE_URL = "/api/outbound";

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
};
