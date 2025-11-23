"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import Link from "next/link";
import { Product } from "@/types/product";

export default function StockAdjustmentListPage() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page],
    queryFn: () => productService.getAllPaged(page, limit),
  });

  const products = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Stock Adjustment</h1>

      {isError && <p className="text-red-500">Failed to load products</p>}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((prod: Product) => (
              <TableRow key={prod.id}>
                <TableCell>{prod.name}</TableCell>
                <TableCell>{prod.stock}</TableCell>
                <TableCell>Rp {prod.price.toLocaleString()}</TableCell>
                <TableCell>{prod.supplier?.name ?? "-"}</TableCell>
                <TableCell>{prod.isActive ? <Badge>Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</TableCell>
                <TableCell>
                  <Link href={`/stock-adjustment/${prod.id}`}>
                    <Button size="sm">
                      <Edit2 className="mr-2" /> Adjust
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex justify-end mt-6 items-center gap-4">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          <ChevronLeft />
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
