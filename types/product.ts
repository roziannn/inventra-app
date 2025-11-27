export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
  isActive: boolean;
  storageLocationId: string;
  supplierId?: string;
  productCategoryId: string;
  condition: "New" | "Used" | "Refurbished";
  restockDate: Date;
  imageUrl?: string;
  barcode?: string;

  supplier?: { id: string; name: string };
  category?: { id: string; name: string };
  storagelocation?: { id: string; name: string };
}
