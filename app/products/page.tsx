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
import { storageLocationService } from "@/services/storage-locations.service";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { supplierService } from "@/services/supplier.service";
import { categoryService } from "@/services/category.service";

export default function ProductPage() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<Product>>({
    // code: "",
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
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) deleteMutation.mutate(id);
  };

  const { data: categories = [] } = useQuery({
    queryKey: ["category"],
    queryFn: () => categoryService.getLOV(),
  });

  const { data: storageLocations = [] } = useQuery({
    queryKey: ["storage-locations"],
    queryFn: () => storageLocationService.getLOV(),
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => supplierService.getLOV(),
  });

  const resetForm = () => {
    setFormData({
      // code: "",
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
              {/* <TableHead>Code</TableHead> */}
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Restock</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((prod: Product) => (
              <TableRow key={prod.id}>
                {/* <TableCell>{prod.code}</TableCell> */}
                <TableCell>{prod.name}</TableCell>
                <TableCell>{prod.price}</TableCell>
                <TableCell>{prod.stock}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{prod.productCategory?.name}</Badge>
                </TableCell>
                {/* <TableCell>{prod.unit}</TableCell> */}
                <TableCell>{prod.storageLocation?.name}</TableCell>
                <TableCell>{prod.isActive ? <Badge>Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</TableCell>

                <TableCell>{formatDate(prod.restockDate)}</TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => {
                      setDialogMode("edit");
                      setFormData({
                        ...prod,
                        restockDate: prod.restockDate ? new Date(prod.restockDate) : new Date(),
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Edit2 />
                  </Button>
                  <Button size="icon-sm" variant="destructive" onClick={() => handleDelete(prod.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Product" : "Edit Product"}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2">
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Product Name" />
            </div>

            {/* Price */}
            <div>
              <Label>Price</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })} placeholder="100000" />
            </div>

            {/* Stock */}
            <div>
              <Label>Stock</Label>
              <Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })} placeholder="10" />
            </div>

            {/* Unit */}
            <div>
              <Label>Unit</Label>
              <Input value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} placeholder="pcs / box / kg" />
            </div>

            {/* Category */}
            <div>
              <Label>Product Category</Label>
              <Select value={formData.productCategoryId} onValueChange={(value) => setFormData({ ...formData, productCategoryId: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Select Category --" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Supplier</Label>
              <Select value={formData.supplierId} onValueChange={(value) => setFormData({ ...formData, supplierId: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Select Supplier --" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers?.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id}>
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Condition */}
            <div>
              <Label>Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value as Product["condition"] })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Select Condition --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                  <SelectItem value="Refurbished">Refurbished</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Storage Location */}

            <div>
              <Label>Storage Location</Label>
              <Select value={formData.storageLocationId} onValueChange={(value) => setFormData({ ...formData, storageLocationId: value })}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Select Storage --" />
                </SelectTrigger>
                <SelectContent>
                  {storageLocations?.map((sto) => (
                    <SelectItem key={sto.id} value={sto.id}>
                      {sto.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Restock Date</Label>
              <Input type="date" value={formData.restockDate ? formData.restockDate.toISOString().split("T")[0] : ""} onChange={(e) => setFormData({ ...formData, restockDate: new Date(e.target.value) })} />
            </div>

            <div className="col-span-2">
              <Label>Image URL</Label>
              <Input value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://example.com/image.jpg" />
            </div>

            <div className="col-span-2">
              <Label>Barcode / SKU</Label>
              <Input value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} placeholder="SKU-12345" />
            </div>

            <div className="flex items-center space-x-2 col-span-2">
              <Switch checked={formData.isActive} onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} />
              <Label>Active</Label>
            </div>
          </div>

          {/* Save Button */}
          <Button className="mt-4" onClick={() => (dialogMode === "add" ? createMutation.mutate() : updateMutation.mutate())} disabled={createMutation.isPending || updateMutation.isPending}>
            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
