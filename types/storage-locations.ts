// master
export interface StorageLocation {
  id: string;
  code: string;
  name: string;
  description?: string;
  type?: "rack" | "shelf" | "drawer" | "box" | "cabinet" | "bin";
  zone?: string;

  maxCapacity?: number;
  currentCapacity?: number;
  capacityUnit?: string;

  isActive: boolean;

  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

//manage-storage api
export interface StorageProduct {
  id: string;
  productName: string;
  qty: number;
  updatedAt: string;
}

export interface StorageLocationDetailResponse extends StorageLocation {
  product?: {
    id: string;
    name: string;
    stock: number;
    updatedAt: Date;
  }[];
}

// create
export interface CreateStorageLocationDto {
  code: string;
  name: string;
  description?: string;
  type?: "rack" | "shelf" | "drawer" | "box" | "cabinet" | "bin";
  zone?: string;
  maxCapacity?: number;
  capacityUnit?: string;
  isActive?: boolean;
  createdBy?: string;
}

// update
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
