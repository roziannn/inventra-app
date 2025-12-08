import { StorageLocation, CreateStorageLocationDto, UpdateStorageLocationDto } from "@/types/storage-locations";

const BASE_URL = "/api/master/storage-locations";

export const storageLocationService = {
  getAllPaged: async (page = 1, limit = 10) => {
    const res = await fetch(`${BASE_URL}?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch storage locations");
    return res.json();
  },

  create: async (data: CreateStorageLocationDto): Promise<StorageLocation> => {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create storage location");
    return res.json();
  },

  update: async (id: string, data: UpdateStorageLocationDto): Promise<StorageLocation> => {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update storage location");
    return res.json();
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetch(`${BASE_URL}?id=${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete storage location");
  },

  // GET LOV
  getLOV: async (): Promise<StorageLocation[]> => {
    const res = await fetch(`${BASE_URL}?type=lov`);
    if (!res.ok) throw new Error("Failed to fetch storage locations");
    return res.json();
  },

  // GET by ID
  getByStorageId: async (id: string): Promise<StorageLocation> => {
    const res = await fetch(`${BASE_URL}?id=${id}`);
    if (!res.ok) throw new Error("Failed to fetch storage location by ID");
    return res.json();
  },

  // GET by ZoneID
  getByZoneId: async (zoneId: string): Promise<StorageLocation[]> => {
    const res = await fetch(`${BASE_URL}?zoneId=${zoneId}`);
    if (!res.ok) throw new Error("Failed to fetch storage locations by zone ID");
    return res.json();
  },
};
