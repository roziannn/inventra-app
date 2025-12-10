// ===== Master Storage Location =====
export interface StorageLocation {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "rack" | "shelf" | "drawer" | "box" | "cabinet" | "bin";
  zone?: {
    id: string;
    name: string;
  };
  maxCapacity?: number;
  currentCapacity?: number;
  capacityUnit?: string;
  product?: StorageProduct[];
  isActive: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// ===== Storage Product =====
export interface StorageProduct {
  id: string;
  name: string;
  stock: number;
  updatedAt: Date;
}

// ===== Detail Response untuk UI =====
export interface StorageLocationDetailResponse extends Omit<StorageLocation, "product"> {
  product?: {
    id: string;
    name: string;
    stock: number;
    updatedAt: Date;
    createdAt?: Date | null;
  }[];
}

// ===== Create DTO =====
export interface CreateStorageLocationDto {
  code: string;
  name: string;
  description?: string;
  type?: "rack" | "shelf" | "drawer" | "box" | "cabinet" | "bin";
  zone?: string; // id zona
  maxCapacity?: number;
  capacityUnit?: string;
  isActive?: boolean;
  createdBy?: string;
}

// ===== Update DTO =====
export interface UpdateStorageLocationDto {
  code?: string;
  name?: string;
  description?: string;
  type?: "rack" | "shelf" | "drawer" | "box" | "cabinet" | "bin";
  zone?: string;
  maxCapacity?: number;
  currentCapacity?: number;
  capacityUnit?: string;
  isActive?: boolean;
  updatedBy?: string;
}
