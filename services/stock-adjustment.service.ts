import { StockAdjustment } from "@/types/stock-adjustment";

const BASE_URL = "/api/stock-adjustment";

export const stockAdjustmentService = {
  // Get by ID
  getById: async (id: string) => {
    const res = await fetch(`${BASE_URL}?id=${id}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Failed to fetch stock adjustment: ${data.error ?? JSON.stringify(data)}`);
    }

    return data;
  },

  // Create new adjustment
  create: async (payload: Partial<StockAdjustment>) => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error ?? "Failed to create stock adjustment");
    }

    return result;
  },

  // Update adjustment
  update: async (id: string, payload: Partial<StockAdjustment>) => {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.error ?? "Failed to update stock adjustment");
    }

    return result;
  },

  // Delete record
  delete: async (id: string) => {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
      method: "DELETE",
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.error ?? "Failed to delete stock adjustment");
    }

    return result;
  },
};
