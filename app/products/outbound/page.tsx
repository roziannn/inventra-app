"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PlusCircle, Save, Package, Truck, CheckCircle2, Wallet, CircleArrowDown, MoreHorizontal, ChevronLeft, ChevronRight, MapPinCheck, Edit3, CircleX } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/helper/formatDate";
import { inputCurrency } from "@/helper/inputCurrency";
import { productService } from "@/services/product.service";
import { outboundClient } from "@/services/client/outbound.client";
import { CreateOutboundDto, OutboundCancleDto } from "@/types/outbound";
import { formatCurrency } from "@/helper/formatCurrency";
import Image from "next/image";

export default function OutboundPage() {
  const queryClient = useQueryClient();

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [cancelingItem, setCancelingItem] = useState<OutboundCancleDto | null>(null);
  const [cancelNote, setCancelNote] = useState("");

  const cancelOutbound = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string; canceledNote: string }) => outboundClient.cancel(id, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outbounds"] });
      setCancelingItem(null);
      setCancelNote("");
    },
  });

  // product LOV
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products-lov"],
    queryFn: productService.getLOV,
  });

  // get all
  const { data: outboundList = [], isLoading } = useQuery({
    queryKey: ["outbounds"],
    queryFn: outboundClient.getAll,
  });

  const [open, setOpen] = useState(false);

  // form state
  const [formData, setFormData] = useState<CreateOutboundDto>({
    id: "",
    product: "",
    productId: "",
    qty: null,
    operationalCost: 0,
    totalValue: 0,
    status: "SENT",
    reason: "SALES",
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

  const updateMutation = useMutation({
    mutationFn: (payload: CreateOutboundDto) => outboundClient.update(editId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outbounds"] });
      resetForm();
      setOpen(false);
      setIsEdit(false);
      setEditId(null);
    },
  });

  console.log(
    "LOV IDs:",
    products.map((p) => p.id)
  );
  console.log("Edit ID:", formData.productId);

  // reset form
  const resetForm = () => {
    setFormData({
      id: "",
      product: "",
      productId: "",
      qty: 0,
      operationalCost: 0,
      totalValue: 0,
      status: "SENT",
      reason: "SALES",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId) {
      alert("Product is required");
      return;
    }

    const totalValue = (formData.qty || 0) * (products.find((p) => p.id === formData.productId)?.price || 0) + formData.operationalCost;

    const payload: CreateOutboundDto = {
      ...formData,
      qty: Number(formData.qty) || null,
      totalValue,
      operationalCost: Number(formData.operationalCost),
      status: formData.status,
      reason: formData.reason,
      isResi: !!formData.resiImg,
      resiUploadDate: formData.resiImg ? new Date() : formData.resiUploadDate,
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (item: CreateOutboundDto) => {
    setIsEdit(true);
    setEditId(item.id);
    setFormData({
      ...item,
      productId: String(item.productId),
      qty: item.qty,
      operationalCost: item.operationalCost,
      reason: item.reason,
      note: item.note || "",
      isShipping: item.isShipping,
      shippingDate: item.shippingDate || undefined,
      courier: item.courier || undefined,
      isResi: item.isResi,
      resiImg: item.resiImg || undefined,
      resiUploadDate: item.resiUploadDate || undefined,
      isPickup: item.isPickup,
      pickupDate: item.pickupDate || undefined,
      pickupBy: item.pickupBy || undefined,
    });
    setOpen(true);
  };

  // cards
  const statusCounts = outboundList.reduce((acc, curr) => {
    const statusKey = curr.status as string;
    acc[statusKey] = (acc[statusKey] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalOperationalCost = outboundList.reduce((acc, item) => acc + Number(item.operationalCost || 0), 0);
  const totalValue = outboundList.reduce((acc, item) => acc + Number(item.qty || 0) + Number(item.operationalCost || 0), 0);

  const cards = [
    { title: "Total Outbound", value: outboundList.length, icon: <Package className="h-5 w-5" /> },
    { title: "Sent", value: statusCounts["SENT"] || 0, icon: <Truck className="h-5 w-5" /> },
    { title: "Delivered", value: statusCounts["DELIVERED"] || 0, icon: <CheckCircle2 className="h-5 w-5" /> },
    { title: "Operational Cost", value: `Rp ${totalOperationalCost.toLocaleString("id-ID")}`, icon: <Wallet className="h-5 w-5" /> },
    { title: "Total Sales Value", value: `Rp ${totalValue.toLocaleString("id-ID")}`, icon: <CircleArrowDown className="text-primary h-5 w-5" /> },
  ];

  // kalkulasi otomatis valuePrice nya qty * harga satuan
  const selectedProduct = products.find((p) => p.id === formData.productId);
  const valuePrice = (selectedProduct?.price || 0) * (formData.qty || 0);

  const [trackingItem, setTrackingItem] = useState<CreateOutboundDto | null>(null);

  return (
    <div className="p-6 space-y-4">
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
                <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
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

              {/* quantity */}
              <div>
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min={1}
                  required
                  value={formData.qty ?? ""}
                  onChange={(e) => {
                    const qty = e.target.value === "" ? null : Number(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      qty,
                      totalCost: (products.find((p) => p.id === prev.productId)?.price || 0) * (qty || 0) + (prev.operationalCost || 0),
                    }));
                  }}
                />
              </div>

              {/* value price (readonly, auto-calculated) */}
              <div>
                <Label>
                  Value <span className="text-xs text-zinc-600">(Qty x Item Price)</span>
                </Label>
                <div className="flex items-center border rounded-md overflow-hidden bg-gray-100">
                  <span className="bg-gray-100 px-2 py-2 text-sm text-gray-700 border-r">Rp</span>
                  <Input type="text" value={inputCurrency(valuePrice.toString())} readOnly className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1.5 bg-gray-100" />
                </div>
              </div>

              {/* Reason */}
              <div>
                <Label>Reason</Label>
                <Select value={formData.reason || ""} onValueChange={(value) => setFormData({ ...formData, reason: value as "SALES" | "RETURN" | "WASTE" | "INTERNAL_USE" })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Select Reason --" />
                  </SelectTrigger>
                  <SelectContent>
                    {["SALES", "RETURN", "WASTE", "INTERNAL_USE"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <div className="col-span-2 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.isShipping}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        isShipping: !!checked,
                        isResi: !!checked,
                        isPickup: checked ? false : formData.isPickup,
                      })
                    }
                  />
                  <Label className="mt-2">Shipping Required?</Label>
                </div>

                {/* Shipping Fields */}
                {formData.isShipping && (
                  <div className="flex flex-col gap-4 mt-1">
                    {/* Shipping Date & Courier in one row */}
                    <div className="flex gap-4">
                      <div className="w-full">
                        <Label>Shipping Date</Label>
                        <Input type="date" value={formData.shippingDate || ""} onChange={(e) => setFormData({ ...formData, shippingDate: e.target.value })} />
                      </div>

                      <div className="w-full">
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
                    </div>

                    {/* Resi Upload */}
                    <div>
                      <Label>Resi Image</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormData({
                              ...formData,
                              resiImg: URL.createObjectURL(file),
                              resiUploadDate: new Date(),
                            });
                          }
                        }}
                      />
                      {formData.resiImg && (
                        <div className="mt-2">
                          <Image src={formData.resiImg} alt="Resi Preview" width={128} height={128} className="object-cover border rounded-md" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Pickup Checkbox */}
              <div className="col-span-2 flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.isPickup}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        isPickup: !!checked,
                        isShipping: checked ? false : formData.isShipping,
                      })
                    }
                  />
                  <Label className="mt-2">Pickup Required?</Label>
                </div>

                {formData.isPickup && (
                  <div className="flex flex-col gap-4 mt-1">
                    <div>
                      <Label>Pickup By</Label>
                      <Input type="text" value={formData.pickupBy || ""} onChange={(e) => setFormData({ ...formData, pickupBy: e.target.value })} />
                    </div>

                    <div>
                      <Label>Pickup Date</Label>
                      <Input type="date" value={formData.pickupDate || ""} onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })} />
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-2 flex justify-end mt-4">
                <Button type="submit" className="flex items-center gap-2">
                  {isEdit ? (
                    <>
                      <Save className="h-4 w-4" /> Update
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" /> Save
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Cancel Outbound Dialog */}
        <Dialog
          open={!!cancelingItem}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setCancelingItem(null);
              setCancelNote("");
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cancel Outbound Item</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-red-600 font-semibold mb-2">Canceling cannot be undone!</p>
            {cancelingItem && (
              <div className="space-y-6">
                <div>
                  <Label>Product</Label>
                  <Input value={cancelingItem.product} disabled />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input value={String(cancelingItem.qty ?? "")} disabled />
                </div>
                <div>
                  <Label>Cancel Note</Label>
                  <Input value={cancelNote} onChange={(e) => setCancelNote(e.target.value)} placeholder="Reason for cancel" />
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setCancelingItem(null)}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!cancelNote.trim()) {
                    alert("Cancel note is required");
                    return;
                  }
                  if (cancelingItem) {
                    cancelOutbound.mutate(
                      { id: cancelingItem.id, canceledNote: cancelNote },
                      {
                        onSuccess: () => {
                          setCancelingItem(null);
                          setCancelNote("");
                          queryClient.invalidateQueries({ queryKey: ["outbounds"] });
                        },
                      }
                    );
                  }
                }}
              >
                Confirm Cancel
              </Button>
            </div>
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

      <Table className="mt-2">
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Operational Cost</TableHead>
            {/* <TableHead>Total</TableHead> */}
            <TableHead>Shipping Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Courier</TableHead>
            <TableHead>Resi Date</TableHead>
            <TableHead>Actions</TableHead>
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
            paginatedData.map((item) => {
              const isCanceled = item.status === "CANCELED";

              return (
                <TableRow key={item.id} className={isCanceled ? "bg-zinc-50 text-zinc-500" : ""}>
                  <TableCell>{item.product}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.reason}</TableCell>
                  <TableCell>{formatCurrency(item.operationalCost)}</TableCell>
                  <TableCell>{item.shippingDate ? formatDate(item.shippingDate) : <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600 border border-gray-300">Not shipping</span>}</TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.courier || "-"}</TableCell>
                  <TableCell>{item.resiUploadDate ? formatDate(item.resiUploadDate) : <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-600 border border-gray-300">No resi</span>}</TableCell>

                  <TableCell className="text-center">
                    {!isCanceled && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setTrackingItem(item)}>
                            <MapPinCheck className="h-4 w-4 mr-2" /> Tracking
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(item)}>
                            <Edit3 className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setCancelingItem(item)}>
                            <CircleX className="h-4 w-4 mr-2" /> Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <Dialog
        open={!!trackingItem}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTrackingItem(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tracking Status</DialogTitle>
          </DialogHeader>
          {trackingItem && (
            <div className="space-y-4 p-2">
              <div className="flex items-center gap-4">
                <Truck className={`h-6 w-6 ${trackingItem.isShipping ? "text-green-600" : "text-gray-400"}`} />
                <div>
                  <p className="font-semibold">Shipping</p>
                  <p className="text-sm text-gray-500">{trackingItem.shippingDate ? formatDate(trackingItem.shippingDate) : "Not yet shipped"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Package className={`h-6 w-6 ${trackingItem.isPickup ? "text-green-600" : "text-gray-400"}`} />
                <div>
                  <p className="font-semibold">Pickup</p>
                  <p className="text-sm text-gray-500">{trackingItem.pickupDate ? formatDate(trackingItem.pickupDate) : "Not picked up yet"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <CheckCircle2 className={`h-6 w-6 ${trackingItem.status === "DELIVERED" ? "text-green-600" : "text-gray-400"}`} />
                <div>
                  <p className="font-semibold">Delivered</p>
                  <p className="text-sm text-gray-500">{trackingItem.status === "DELIVERED" ? "Successfully Delivered" : "Not delivered yet"}</p>
                </div>
              </div>

              {trackingItem.resiImg && (
                <div className="mt-4">
                  <p className="font-semibold">Resi Image</p>
                  <Image src={trackingItem.resiImg} alt="Resi Image" width={200} height={200} className="rounded-md border" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
