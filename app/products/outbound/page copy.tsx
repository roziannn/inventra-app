"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PlusCircle, Save, Package, Truck, CheckCircle2, Wallet, CircleArrowDown, FileText, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDate } from "@/helper/formatDate";
import { inputCurrency } from "@/helper/inputCurrency";
import { productService } from "@/services/product.service";
import { outboundClient } from "@/services/client/outbound.client";
import { CreateOutboundDto } from "@/types/outbound";

export default function OutboundPage() {
  const queryClient = useQueryClient();

  // Product LOV
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products-lov"],
    queryFn: productService.getLOV,
  });

  // Get all outbound
  const { data: outboundList = [], isLoading } = useQuery({
    queryKey: ["outbounds"],
    queryFn: outboundClient.getAll,
  });

  // Dialog state
  const [open, setOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateOutboundDto>({
    product: "",
    qty: 0,
    sellingPrice: 0,
    operationalCost: 0,
    status: "SENT",
    note: "",
    createdBy: "administrator",
    isShipping: false,
    shippingDate: undefined,
    courier: undefined,
    isResi: false,
    resiImg: undefined,
    resiUploadDate: undefined,
    isPickup: false,
    pickupDate: undefined,
    pickupBy: undefined,
  });

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(outboundList.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = outboundList.slice(startIndex, startIndex + itemsPerPage);

  // create
  const createMutation = useMutation({
    mutationFn: (payload: CreateOutboundDto) => outboundClient.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outbounds"] });
      resetForm();
      setOpen(false);
    },
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      product: "",
      qty: 0,
      sellingPrice: 0,
      operationalCost: 0,
      status: "SENT",
      note: "",
      createdBy: "administrator",
      isShipping: false,
      shippingDate: undefined,
      courier: undefined,
      isResi: false,
      resiImg: undefined,
      resiUploadDate: undefined,
      isPickup: false,
      pickupDate: undefined,
      pickupBy: undefined,
    });
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateOutboundDto = {
      product: formData.product,
      qty: Number(formData.qty),
      sellingPrice: Number(formData.sellingPrice),
      operationalCost: Number(formData.operationalCost),
      status: "SENT",
      note: formData.note || undefined,
      createdBy: formData.createdBy,
      isShipping: formData.isShipping,
      shippingDate: formData.shippingDate || undefined,
      courier: formData.courier || undefined,
      isResi: !!formData.resiImg,
      resiImg: formData.resiImg || undefined,
      resiUploadDate: undefined,
      isPickup: formData.isPickup,
      pickupDate: formData.pickupDate || undefined,
      pickupBy: formData.pickupBy || undefined,
    };

    createMutation.mutate(payload);
  };

  // Cards
  const statusCounts = outboundList.reduce((acc, curr) => {
    const statusKey = curr.status as string;
    acc[statusKey] = (acc[statusKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalOperationalCost = outboundList.reduce((acc, item) => acc + Number(item.operationalCost || 0), 0);
  const totalValue = outboundList.reduce((acc, item) => acc + Number(item.sellingPrice || 0) + Number(item.operationalCost || 0), 0);

  const cards = [
    { title: "Total Outbound", value: outboundList.length, icon: <Package className="h-5 w-5" /> },
    { title: "Sent", value: statusCounts["SENT"] || 0, icon: <Truck className="h-5 w-5" /> },
    { title: "Delivered", value: statusCounts["DELIVERED"] || 0, icon: <CheckCircle2 className="h-5 w-5" /> },
    { title: "Operational Cost", value: `Rp ${totalOperationalCost.toLocaleString("id-ID")}`, icon: <Wallet className="h-5 w-5" /> },
    { title: "Total Value", value: `Rp ${totalValue.toLocaleString("id-ID")}`, icon: <CircleArrowDown className="text-primary h-5 w-5" /> },
  ];

  return (
    <div className="p-6 space-y-4">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Outbound</h1>
          <p className="text-sm text-muted-foreground">Manage your outbound catalog here</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Outbound
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Outbound Item</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-2">
              {/* Product */}
              <div className="col-span-2">
                <Label>Product Name</Label>
                <Select value={formData.product} onValueChange={(value) => setFormData({ ...formData, product: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingProducts ? "Loading..." : "-- Select product --"} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div>
                <Label>Quantity</Label>
                <Input type="number" required value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: Number(e.target.value) })} />
              </div>

              {/* Buyer / Pickup By */}
              <div>
                <Label>Buyer / Pickup By</Label>
                <Input required value={formData.pickupBy || ""} onChange={(e) => setFormData({ ...formData, pickupBy: e.target.value })} />
              </div>

              {/* Selling Price */}
              <div>
                <Label>Selling Price</Label>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <span className="bg-gray-100 px-2 py-2 text-sm text-gray-700 border-r">Rp</span>
                  <Input
                    type="text"
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1.5"
                    value={inputCurrency(formData.sellingPrice.toString())}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^\d]/g, "");
                      setFormData({ ...formData, sellingPrice: Number(rawValue) });
                    }}
                  />
                </div>
              </div>

              {/* Operational Cost */}
              <div>
                <Label>Operational Cost</Label>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <span className="bg-gray-100 px-2 py-2 text-sm text-gray-700 border-r">Rp</span>
                  <Input
                    type="text"
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1.5"
                    value={inputCurrency(formData.operationalCost.toString())}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^\d]/g, "");
                      setFormData({ ...formData, operationalCost: Number(rawValue) });
                    }}
                  />
                </div>
              </div>

              {/* Note */}
              <div className="col-span-2">
                <Label>Note</Label>
                <Input value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
              </div>

              {/* Shipping Checkbox */}
              <div className="col-span-2 flex items-center gap-2">
                <Checkbox checked={formData.isShipping} onCheckedChange={(checked) => setFormData({ ...formData, isShipping: !!checked, isPickup: !checked })} />
                <Label>Shipping Required?</Label>
              </div>

              {/* Shipping Fields */}
              {formData.isShipping && (
                <>
                  <div>
                    <Label>Shipping Date</Label>
                    <Input type="date" value={formData.shippingDate || ""} onChange={(e) => setFormData({ ...formData, shippingDate: e.target.value })} />
                  </div>
                  <div>
                    <Label>Courier</Label>
                    <Select value={formData.courier || ""} onValueChange={(value) => setFormData({ ...formData, courier: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Courier" />
                      </SelectTrigger>
                      <SelectContent>
                        {["JNE", "J&T", "SiCepat", "Pos Indonesia", "Wahana"].map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="col-span-2 flex justify-end mt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" /> Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-white shadow p-4 rounded-lg flex items-center gap-4">
            <div className="bg-gray-100 rounded-full p-3 flex items-center justify-center">{card.icon}</div>
            <div className="flex flex-col">
              <span className="text-gray-500 text-sm">{card.title}</span>
              <span className="text-xl font-bold">{card.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <Table className="mt-2">
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Operational Cost</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Shipping Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Courier</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                Loading...
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.product}</TableCell>
                <TableCell>{item.qty}</TableCell>
                <TableCell>{item.pickupBy}</TableCell>
                <TableCell>Rp {item.sellingPrice.toLocaleString("id-ID")}</TableCell>
                <TableCell>Rp {item.operationalCost.toLocaleString("id-ID")}</TableCell>
                <TableCell>Rp {(item.sellingPrice + item.operationalCost).toLocaleString("id-ID")}</TableCell>
                <TableCell>{item.shippingDate}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.courier || "-"}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">{`Showing ${startIndex + 1} to ${Math.min(startIndex + itemsPerPage, outboundList.length)} of ${outboundList.length} entries`}</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft />
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
