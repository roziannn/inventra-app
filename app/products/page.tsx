"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Trash2, MoreHorizontal, Edit3, PrinterIcon, CirclePlus } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { formatDate } from "@/helper/formatDate";
import { storageLocationService } from "@/services/storage-locations.service";
import { supplierService } from "@/services/supplier.service";
import { categoryService } from "@/services/category.service";
import { formatCurrency } from "@/helper/formatCurrency";
import { IconCircleCheckFilled, IconCircleXFilled } from "@tabler/icons-react";

export default function ProductPage() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<Partial<Product>>({
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

  const [printLabelOpen, setPrintLabelOpen] = useState(false);
  const [labelProduct, setLabelProduct] = useState<Partial<Product>>({});
  const [labelWidth, setLabelWidth] = useState(60); // mm
  const [labelHeight, setLabelHeight] = useState(40); // mm

  // add state untuk jumlah per baris
  const [labelsPerRow, setLabelsPerRow] = useState(2); // default 2 per baris

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

  const handlePrintLabel = () => {
    const printWindow = window.open("", "PRINT", "height=600,width=800");
    if (printWindow) {
      const labelHtml = Array.from({ length: labelsPerRow })
        .map(
          () => `
        <div class="label">
          <div class="product-name">${labelProduct.name}</div>
          <div class="price-stock">Price: Rp ${Number(labelProduct.price || 0).toLocaleString("id-ID")}</div>
          <div class="price-stock">Stock: ${labelProduct.stock || 0}</div>
          <div class="barcode">
            <img src="https://api-bwipjs.metafloor.com/?bcid=code128&text=${labelProduct.barcode || "000000"}&scale=2" alt="barcode" />
          </div>
          <div class="qr-code">
            <img src="https://chart.googleapis.com/chart?cht=qr&chs=150x150&chl=${encodeURIComponent(labelProduct.barcode || "000000")}" alt="QR Code" />
          </div>
        </div>
      `
        )
        .join("");

      printWindow.document.write(`
      <html>
        <head>
          <title>Print Label</title>
          <style>
            body { margin:0; padding:10px; font-family:sans-serif; display:flex; flex-wrap:wrap; gap:5mm; }
            .label {
              border:1px solid #000;
              width:${labelWidth}mm;
              height:${labelHeight}mm;
              display:flex;
              flex-direction:column;
              justify-content:space-between;
              align-items:center;
              padding:5mm;
              box-sizing:border-box;
              text-align:center;
            }
            .product-name { font-weight:bold; font-size:14pt; }
            .price-stock { font-size:10pt; margin:2px 0; }
            .barcode, .qr-code { margin-top:4px; }
          </style>
        </head>
        <body>
          ${labelHtml}
        </body>
      </html>
    `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product catalog here</p>
        </div>
        <Button
          onClick={() => {
            setDialogMode("add");
            resetForm();
            setDialogOpen(true);
          }}
        >
          <CirclePlus /> Add Product
        </Button>
      </div>

      {isError && <p className="text-red-500">Failed to load products</p>}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell>{prod.name}</TableCell>
                <TableCell>{formatCurrency(prod.price)}</TableCell>
                <TableCell>{prod.stock}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{prod.category?.name}</Badge>
                </TableCell>
                <TableCell>{prod.storagelocation?.name}</TableCell>
                <TableCell>
                  {prod.isActive ? (
                    <Badge>
                      <IconCircleCheckFilled /> Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <IconCircleXFilled /> Inactive
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(prod.restockDate)}</TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="w-38"
                        onClick={() => {
                          setLabelProduct(prod);
                          setPrintLabelOpen(true);
                        }}
                      >
                        <PrinterIcon className="h-4 w-4 mr-2" /> Print Label
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDialogMode("edit");
                          setFormData({
                            ...prod,
                            restockDate: prod.restockDate ? new Date(prod.restockDate) : new Date(),
                          });
                          setDialogOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(prod.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">{`Showing ${products.length > 0 ? (page - 1) * limit + 1 : 0} to ${(page - 1) * limit + products.length} of ${data?.pagination.totalItems ?? 0} entries`}</div>
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

      {/* Print Label Dialog */}
      <Dialog open={printLabelOpen} onOpenChange={setPrintLabelOpen}>
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle>Print Label</DialogTitle>
            <span className="font-bold"> {labelProduct.name}</span>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="col-span-2">
              <Label>Label Size</Label>
              <Select
                onValueChange={(val) => {
                  const sizes: Record<string, { w: number; h: number }> = {
                    S: { w: 40, h: 25 },
                    M: { w: 60, h: 40 },
                    L: { w: 80, h: 50 },
                    XL: { w: 100, h: 60 },
                    "2XL": { w: 120, h: 80 },
                  };
                  setLabelWidth(sizes[val].w);
                  setLabelHeight(sizes[val].h);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="-- Select Size --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="S">Small (40×25 mm)</SelectItem>
                  <SelectItem value="M">Medium (60×40 mm)</SelectItem>
                  <SelectItem value="L">Large (80×50 mm)</SelectItem>
                  <SelectItem value="XL">Extra Large (100×60 mm)</SelectItem>
                  <SelectItem value="2XL">2XL (120×80 mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Width (mm)</Label>
              <Input type="number" value={labelWidth} onChange={(e) => setLabelWidth(parseInt(e.target.value))} />
              <p className="text-xs text-gray-500 mt-1">*Optional adjustment</p>
            </div>

            <div>
              <Label>Height (mm)</Label>
              <Input type="number" value={labelHeight} onChange={(e) => setLabelHeight(parseInt(e.target.value))} />
            </div>

            <div className="col-span-2">
              <Label>Labels Per Row</Label>
              <Input type="number" value={labelsPerRow} onChange={(e) => setLabelsPerRow(parseInt(e.target.value))} />
            </div>
          </div>
          {/* Preview */}
          <div className="mt-4 flex justify-start">
            <div
              className="border-2 border-zinc-500 flex flex-col gap-2 items-start p-2"
              style={{
                width: `${labelWidth}mm`,
                height: `${labelHeight}mm`,
                boxSizing: "border-box",
                textAlign: "center",
              }}
            >
              <div className="font-semibold text-lg">{labelProduct.name}</div>
              <div className="text-sm">{labelProduct.category?.name || "-"}</div>
              <div className="text-sm">{labelProduct.supplier?.name || "-"}</div>
              <div className="font-semibold text-sm">Rp {Number(labelProduct.price || 0).toLocaleString("id-ID")}</div>
            </div>
          </div>

          <Button className="mt-4" onClick={handlePrintLabel}>
            Print
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
