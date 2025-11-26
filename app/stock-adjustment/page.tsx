"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, CircleEllipsis } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import Link from "next/link";
import { Product } from "@/types/product";
import { formatCurrency } from "@/helper/formatCurrency";

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
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((prod: Product) => (
              <TableRow key={prod.id}>
                <TableCell>{prod.name}</TableCell>
                <TableCell>{formatCurrency(prod.price)}</TableCell>
                <TableCell>{prod.stock}</TableCell>
                <TableCell>{prod.supplier?.name ?? "-"}</TableCell>
                <TableCell>
                  <Link href={`/stock-adjustment/${prod.id}`}>
                    <Button size="sm" className="text-xs">
                      <CircleEllipsis /> Adjust
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          {`Showing ${data && data.data.length > 0 ? (page - 1) * limit + 1 : 0} to ${data && data.data.length > 0 ? (page - 1) * limit + data.data.length : 0} of ${data?.pagination.totalItems ?? 0} entries`}
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
