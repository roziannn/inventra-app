export interface ZoneListDto {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  createdBy?: string | null;
  updatedAt?: Date;
  updatedBy?: string;
}

export interface CreateZoneDto {
  name: string;
  isActive?: boolean;
  createdBy?: string;
}

export interface UpdateZoneDto {
  id?: string;
  name?: string;
  isActive?: boolean;
  updatedBy?: string;
}

export type ZoneLOV = {
  id: string;
  name: string;
};
