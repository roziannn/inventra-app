import { CreateInboundDto, InboundListDto } from "@/types/inbound";

const BASE_URL = "/api/inbound";

export const inboundService = {
  getAll: async (): Promise<InboundListDto[]> => {
    const res = await fetch(BASE_URL);
    if (!res.ok) throw new Error("Failed to fetch inbounds");
    const data = await res.json();
    return data.data;
  },

  create: async (payload: CreateInboundDto): Promise<InboundListDto> => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to create inbound");
    const data = await res.json();
    return data.data;
  },
};
