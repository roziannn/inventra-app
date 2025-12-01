export type OutboundStatus = "SENT" | "PROCESSING" | "DELIVERED" | "CANCELED" | "SHIPPED" | "PICKED_UP";
export type OutboundReason = "SALES" | "RETURN" | "WASTE" | "INTERNAL_USE";

export interface ShippingInfo {
  isShipping: boolean;
  shippingDate?: string;
  courier?: string;
  isResi?: boolean;
  resiImg?: string;
  resiUploadDate?: Date;
}

export interface PickupInfo {
  isPickup: boolean;
  pickupDate?: string;
  pickupBy?: string;
}

export interface CreateOutboundDto extends ShippingInfo, PickupInfo {
  id: string;
  product: string;
  productId: string; // ganti dari product
  reason: OutboundReason;
  qty?: number | null;
  totalValue?: number; // ditambahkan
  operationalCost: number;
  status?: OutboundStatus;
  note?: string;
  createdBy?: string;
}

export type OutboundCancleDto = {
  id: string;
  product: string;
  qty: number;
  canceledDate?: string | null;
  canceledBy?: string | null;
};

export interface Outbound extends CreateOutboundDto {
  // product: Product;
  id: string;
  createdAt: string;
}
