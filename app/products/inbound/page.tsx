"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, PlusCircle, Save, Edit3, Package, Search, Inbox, CircleCheck, CircleArrowUp, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supplierService } from "@/services/supplier.service";
import { productService } from "@/services/product.service";
import { inboundClient } from "@/services/client/inbound.client";
import { formatDate } from "@/helper/formatDate";
import { inputCurrency } from "@/helper/inputCurrency";
import { CreateInboundDto, InboundListDto, UpdateInboundDto } from "@/types/inbound";

export default function InboundPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [open, setOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    product: "",
    qty: "",
    supplier: "",
    purchasePrice: "",
    purchasePriceDisplay: "",
    date: "",
    note: "",
  });

  const { data: suppliers = [], isLoading: loadingSuppliers } = useQuery({
    queryKey: ["suppliers-lov"],
    queryFn: supplierService.getLOV,
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products-lov"],
    queryFn: productService.getLOV,
  });

  //get all data
  const { data: inboundRes } = useQuery({ queryKey: ["inbounds"], queryFn: () => inboundClient.getAll() });
  const inboundList = inboundRes?.data ?? [];

  const totalPages = Math.ceil(inboundList.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = inboundList.slice(startIndex, startIndex + itemsPerPage);

  // create
  const createInbound = useMutation({
    mutationFn: (payload: CreateInboundDto) => inboundClient.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbounds"] });
      resetForm();
    },
  });

  //update
  const updateInbound = useMutation({
    mutationFn: (payload: UpdateInboundDto) => inboundClient.update(editingItemId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbounds"] });
      resetForm();
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const productObj = products.find((p) => p.name === formData.product);
    const supplierObj = suppliers.find((s) => s.name === formData.supplier);

    if (!productObj || !supplierObj) return alert("Product and Supplier must be selected");

    const payload: CreateInboundDto = {
      productId: productObj.id,
      supplierId: supplierObj.id,
      qty: Number(formData.qty),
      purchasePrice: Number(formData.purchasePrice),
      totalPrice: Number(formData.purchasePrice) * Number(formData.qty),
      note: formData.note,
      status: "RECEIVED",
      createdBy: "administrator",
    };

    if (editingItemId) {
      updateInbound.mutate(payload);
    } else {
      createInbound.mutate(payload);
    }
  };

  const handleEdit = (item: InboundListDto) => {
    setFormData({
      product: item.product,
      supplier: item.supplier ?? "",
      qty: String(item.qty),
      purchasePrice: String(item.purchasePrice),
      purchasePriceDisplay: inputCurrency(String(item.purchasePrice)),
      date: item.date,
      note: item.note ?? "",
    });
    setEditingItemId(item.id);
    setOpen(true);
  };

  const resetForm = () => {
    setEditingItemId(null);
    setFormData({ product: "", qty: "", supplier: "", purchasePrice: "", purchasePriceDisplay: "", date: "", note: "" });
    setOpen(false);
  };

  // summary cards
  const totalExpense = inboundList.reduce((acc, curr) => acc + Number(curr.purchasePrice), 0);
  const statusCounts = inboundList.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cards = [
    { title: "Total Inbound", value: inboundList.length, icon: <Package className="w-5 h-5" /> },
    { title: "Received", value: statusCounts["RECEIVED"] || 0, icon: <CircleCheck className="w-5 h-5" /> },
    { title: "Item Checking", value: statusCounts["ITEM CHECKING"] || 0, icon: <Search className="w-4.5 h-4.5" /> },
    { title: "Stored", value: statusCounts["STORED"] || 0, icon: <Inbox className="w-5 h-5" /> },
    { title: "Total Expense", value: `Rp ${totalExpense.toLocaleString("id-ID")}`, icon: <CircleArrowUp className="text-destructive w-5 h-5" /> },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Inbound</h1>
          <p className="text-sm text-muted-foreground">Manage your inbound product data here</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => setEditingItemId(null)}>
              <PlusCircle className="h-4 w-4" />
              Add Inbound
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItemId ? "Edit Inbound Item" : "Add Inbound Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mt-2">
              <div className="col-span-2">
                <Label>Product Name</Label>
                <Select value={formData.product} onValueChange={(value) => setFormData({ ...formData, product: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingProducts ? "Loading..." : "-- Select product --"} />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.name}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Supplier</Label>
                <Select value={formData.supplier} onValueChange={(value) => setFormData({ ...formData, supplier: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={loadingSuppliers ? "Loading..." : "-- Select supplier --"} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Quantity</Label>
                <Input type="number" required value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} />
              </div>
              <div>
                <Label>Purchase Price/item </Label>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <span className="bg-gray-100 px-2 py-2 text-sm text-gray-700 border-r">Rp</span>
                  <Input
                    type="text"
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1.5"
                    required
                    value={formData.purchasePriceDisplay || ""}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^\d]/g, "");
                      setFormData({ ...formData, purchasePrice: rawValue, purchasePriceDisplay: inputCurrency(e.target.value) });
                    }}
                  />
                </div>
              </div>
              <div className="col-span-2">
                <Label>Receive Date</Label>
                <Input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Note</Label>
                <Input value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
              </div>
              <div className="col-span-2 flex justify-end mt-4">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
            <TableHead>Supplier</TableHead>
            <TableHead>Purchase Price</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.product}</TableCell>
              <TableCell>{item.qty}</TableCell>
              <TableCell>{item.supplier}</TableCell>
              <TableCell>Rp {Number(item.purchasePrice).toLocaleString("id-ID")}</TableCell>
              <TableCell>{formatDate(item.date)}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.note}</TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(item)}>
                      <Edit3 className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">{`Showing ${startIndex + 1} to ${Math.min(startIndex + itemsPerPage, inboundList.length)} of ${inboundList.length} entries`}</div>
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
