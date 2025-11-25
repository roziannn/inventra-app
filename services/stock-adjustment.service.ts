// services/stock-adjustment.service.ts
import { StockAdjustment } from "@/types/stock-adjustment";

const BASE_URL = "/api/stock-adjustment";

export const stockAdjustmentService = {
  create: async (data: { productId: string; type: string; quantity: number; reason?: string; note?: string; createdBy: string }) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error ?? "Failed to create stock adjustment");
    return result as StockAdjustment;
  },

  getByProductId: async (productId: string) => {
    const res = await fetch(`${BASE_URL}?productId=${productId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to fetch stock adjustments");
    return data as StockAdjustment[];
  },
};
