"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, PlusCircle, Save, Trash2, Edit3, Package, Check, Search, Warehouse, Inbox } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function InboundPage() {
  const [inboundList, setInboundList] = useState([
    { id: 1, product: "Product 1", qty: 10, supplier: "Supplier A", purchasePrice: 200000, date: "2025-01-01", status: "Received", note: "Urgent order" },
    { id: 2, product: "Product 2", qty: 5, supplier: "Supplier B", purchasePrice: 120000, date: "2025-01-03", status: "Stored", note: "" },
    { id: 3, product: "Product 3", qty: 7, supplier: "Supplier C", purchasePrice: 150000, date: "2025-01-05", status: "Item Checking", note: "Check packaging" },
  ]);

  const [open, setOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    product: "",
    qty: "",
    supplier: "",
    purchasePrice: "",
    date: "",
    status: "Received",
    note: "",
  });

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(inboundList.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = inboundList.slice(startIndex, startIndex + itemsPerPage);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (editingItemId) {
      setInboundList((prev) => prev.map((item) => (item.id === editingItemId ? { ...item, ...formData } : item)));
    } else {
      const newEntry = { ...formData, id: inboundList.length + 1 };
      setInboundList([newEntry, ...inboundList]);
    }

    setFormData({ product: "", qty: "", supplier: "", purchasePrice: "", date: "", status: "Received", note: "" });
    setEditingItemId(null);
    setOpen(false);
  };

  const handleEdit = (item: any) => {
    setFormData(item);
    setEditingItemId(item.id);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    setInboundList(inboundList.filter((item) => item.id !== id));
  };

  // Card summary
  const statusCounts = inboundList.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cards = [
    { title: "Total Inbound", value: inboundList.length, icon: <Package className="w-6 h-6 text-green-500" /> },
    { title: "Received", value: statusCounts["Received"] || 0, icon: <Check className="w-6 h-6 text-green-500" /> },
    { title: "Item Checking", value: statusCounts["Item Checking"] || 0, icon: <Search className="w-6 h-6 text-green-500" /> },
    { title: "Storage Checking", value: statusCounts["Storage Checking"] || 0, icon: <Warehouse className="w-6 h-6 text-green-500" /> },
    { title: "Stored", value: statusCounts["Stored"] || 0, icon: <Inbox className="w-6 h-6 text-green-500" /> },
  ];

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Inbound</h1>

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
                <Input required value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} />
              </div>

              <div>
                <Label>Quantity</Label>
                <Input type="number" required value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} />
              </div>

              <div>
                <Label>Supplier</Label>
                <Input required value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
              </div>

              <div>
                <Label>Purchase Price (Rp)</Label>
                <Input type="number" required value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} />
              </div>

              <div>
                <Label>Date</Label>
                <Input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>

              <div>
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Received">Received</SelectItem>
                    <SelectItem value="Item Checking">Item Checking</SelectItem>
                    <SelectItem value="Storage Checking">Storage Checking</SelectItem>
                    <SelectItem value="Stored">Stored</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div key={card.title} className="bg-white shadow p-4 rounded-lg flex items-center gap-4">
            {/* Icon di kiri dengan lingkaran */}
            <div className="bg-gray-100 rounded-full p-3 flex items-center justify-center">{card.icon}</div>

            {/* Text dan value di kanan */}
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
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.note}</TableCell>
              <TableCell className="text-center space-x-2">
                <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(item)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2 text-sm">
          <span>Items per page:</span>
          <Select
            value={String(itemsPerPage)}
            onValueChange={(value) => {
              setItemsPerPage(parseInt(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 50].map((num) => (
                <SelectItem key={num} value={String(num)}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
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
