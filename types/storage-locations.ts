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

  createdAt: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

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
