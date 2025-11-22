"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Edit2, Plus, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { formatDate } from "@/helper/formatDate";

export default function ProductPage() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<Product>>({
    code: "",
    name: "",
    price: 0,
    stock: 0,
    unit: "",
    isActive: true,
    storageLocationId: "",
    supplierId: "",
    productCategoryId: "",
    condition: "New",
    restockDate: new Date(),
    imageUrl: "",
    barcode: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");

  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch products
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products", page],
    queryFn: () => productService.getAllPaged(page, limit),
    // keepPreviousData: true,
  });

  const products = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  // Mutations
  const createMutation = useMutation({
    mutationFn: () => productService.create(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => productService.update(formData.id!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product"] });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      price: 0,
      stock: 0,
      unit: "",
      isActive: true,
      storageLocationId: "",
      supplierId: "",
      productCategoryId: "",
      condition: "New",
      restockDate: new Date(),
      imageUrl: "",
      barcode: "",
    });
    setDialogOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Products</h1>
        <Button
          onClick={() => {
            setDialogMode("add");
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus /> Add Product
        </Button>
      </div>

      {isError && <p className="text-red-500">Failed to load products</p>}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Restock</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((prod: Product) => (
              <TableRow key={prod.id}>
                <TableCell>{prod.code}</TableCell>
                <TableCell>{prod.name}</TableCell>
                <TableCell>{prod.price}</TableCell>
                <TableCell>{prod.stock}</TableCell>
                <TableCell>{prod.unit}</TableCell>
                <TableCell>{prod.isActive ? <Badge>Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</TableCell>
                <TableCell>{prod.productCategoryId}</TableCell>
                <TableCell>{formatDate(prod.restockDate)}</TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => {
                      setDialogMode("edit");
                      setFormData({ ...prod });
                      setDialogOpen(true);
                    }}
                  >
                    <Edit2 />
                  </Button>
                  <Button size="icon-sm" variant="destructive" onClick={() => deleteMutation.mutate(prod.id)}>
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Pagination */}
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

      {/* Dialog Form */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Product" : "Edit Product"}</DialogTitle>
          </DialogHeader>

          {/* <div className="grid grid-cols-2 gap-4 mt-2">
            {[
              { label: "Code", key: "code" },
              { label: "Name", key: "name" },
              { label: "Price", key: "price", type: "number" },
              { label: "Stock", key: "stock", type: "number" },
              { label: "Unit", key: "unit" },
              { label: "Supplier ID", key: "supplierId" },
              { label: "Category ID", key: "productCategoryId" },
              { label: "Storage Location", key: "storageLocationId" },
              { label: "Condition", key: "condition" },
              { label: "Image URL", key: "imageUrl" },
              { label: "Barcode", key: "barcode" },
            ].map((field) => (
              <div key={field.key}>
                <Label>{field.label}</Label>
                <Input
                  type={field.type ?? "text"}
                  value={formData[field.key as keyof Product] ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      [field.key]: field.key === "price" || field.key === "stock" ? Number(e.target.value) : e.target.value,
                    })
                  }
                />
              </div>
            ))}

            <div>
              <Label>Restock Date</Label>
              <Input type="date" value={formData.restockDate ? formData.restockDate.toISOString().split("T")[0] : ""} onChange={(e) => setFormData({ ...formData, restockDate: new Date(e.target.value) })} />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Label>Active</Label>
              <Switch checked={formData.isActive} onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} />
            </div>
          </div> */}

          <Button className="mt-4" onClick={() => (dialogMode === "add" ? createMutation.mutate() : updateMutation.mutate())} disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
