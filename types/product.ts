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
  restockDate: Date; // Tanggal restock terakhir
  imageUrl?: string; // Link gambar produk (opsional)
  barcode?: string; // Barcode atau SKU (opsional)

  supplier?: { id: string; name: string };
  category?: { id: string; name: string };
  storagelocation?: { id: string; name: string };
}
