// type/inbound.ts

export type InboundStatus = "RECEIVED" | "CHECKING" | "STORED" | "CANCELED";

export interface Inbound {
  id: string;
  productId: string;
  supplierId?: string | null;
  qty: number;
  purchasePrice: number | null;
  totalPrice: number | null;
  status: "RECEIVED" | "CHECKING" | "STORED" | "CANCELED" | null;
  receiveDate: string | null;
  itemCheckingDate?: string | null;
  storedDate?: string | null;
  canceledDate?: string | null;
  canceledNote?: string | null;
  note?: string | null;
  createdAt?: string | null;
  createdBy?: string | null;
  updatedAt?: string | null;
  updatedBy?: string | null;
}

export interface CreateInboundDto {
  productId: string;
  supplierId?: string;
  qty: number;
  purchasePrice: number;
  totalPrice?: number;
  status?: InboundStatus;
  note?: string;
  createdBy?: string;
}

export interface UpdateInboundDto {
  qty?: number;
  purchasePrice?: number;
  totalPrice?: number;
  status?: InboundStatus;
  itemCheckingDate?: string;
  receiveDate?: string;
  storedDate?: string;
  canceledDate?: string;
  canceledNote?: string;
  note?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export type UpdateTrackingDto = {
  receiveDate?: Date | null;
  itemCheckingDate?: Date | null;
  storedDate?: Date | null;
  canceledDate?: Date | null;
  updatedBy?: Date | null;
  status: string;
};

export type InboundListDto = {
  id: string;
  product: string;
  qty: number;
  supplier?: string | null;
  purchasePrice: number;
  date: string;
  status: string;
  note?: string | null;
  receiveDate?: string | null;
  itemCheckingDate?: string | null;
  storedDate?: string | null;
  canceledDate?: string | null;
};

export type InboundItem = {
  id: number;
  product: string;
  qty: number;
  supplier: string;
  purchasePrice: number;
  date: string;
  status: string;
  note: string;
};

export type FormData = {
  product: string;
  qty: string;
  supplier: string;
  purchasePrice: string;
  purchasePriceDisplay: string;
  date: string;
  note: string;
};
