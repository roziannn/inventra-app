export type OutboundStatus = "SENT" | "PROCESSING" | "DELIVERED" | "CANCELED" | "SHIPPED" | "PICKED_UP"; //

export interface ShippingInfo {
  isShipping: boolean;
  shippingDate?: string;
  courier?: string;
  isResi?: boolean;
  resiImg?: string;
  resiUploadDate?: string;
}

export interface PickupInfo {
  isPickup: boolean;
  pickupDate?: string;
  pickupBy?: string;
}

export interface CreateOutboundDto extends ShippingInfo, PickupInfo {
  product: string;
  qty?: number | null;
  sellingPrice: number;
  operationalCost: number;
  status?: OutboundStatus;
  note?: string;
  createdBy?: string;
}

export interface Outbound extends CreateOutboundDto {
  id: number;
  createdAt: string;
}
