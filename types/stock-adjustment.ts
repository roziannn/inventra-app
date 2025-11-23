export interface StockAdjustment {
  id: string;
  productId: string;
  oldQty: number;
  newQty: number;
  type: string;
  difference: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}
