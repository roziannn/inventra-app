"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, PlusCircle, Save, Edit3, Package, Search, Inbox, CircleX, CircleCheck, MapPin, AlertTriangle, CircleArrowUp, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/helper/formatDate";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type TrackingStatus = {
  checked: boolean;
  date: string | null;
};

export default function InboundPage() {
  const [inboundList, setInboundList] = useState([
    {
      id: 1,
      product: "Product 1",
      qty: 10,
      supplier: "Supplier A",
      purchasePrice: 200000,
      date: "2025-01-01",
      status: "Received",
      note: "Urgent order",
      tracking: {
        Received: { checked: true, date: "2025-01-01" },
        "Item Checking": { checked: false, date: null },
        "Storage Checking": { checked: false, date: null },
        Stored: { checked: false, date: null },
        Canceled: { checked: false, date: null },
      },
    },
    {
      id: 2,
      product: "Product 2",
      qty: 5,
      supplier: "Supplier B",
      purchasePrice: 120000,
      date: "2025-01-03",
      status: "Stored",
      note: "",
      tracking: {
        Received: { checked: true, date: "2025-01-03" },
        "Item Checking": { checked: true, date: "2025-01-03" },
        "Storage Checking": { checked: true, date: "2025-01-03" },
        Stored: { checked: true, date: "2025-01-03" },
        Canceled: { checked: false, date: null },
      },
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    product: "",
    qty: "",
    supplier: "",
    purchasePrice: "",
    date: "",
    note: "",
  });

  const [trackingOpen, setTrackingOpen] = useState(false);
  const [trackingItem, setTrackingItem] = useState<any>(null);
  const [trackingStatus, setTrackingStatus] = useState<Record<string, TrackingStatus>>({
    Received: { checked: false, date: null },
    "Item Checking": { checked: false, date: null },
    "Storage Checking": { checked: false, date: null },
    Stored: { checked: false, date: null },
    Canceled: { checked: false, date: null },
  });

  // cancel modal
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelItem, setCancelItem] = useState<any>(null);
  const [cancelNote, setCancelNote] = useState("");

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
      const newEntry = {
        ...formData,
        id: inboundList.length + 1,
        status: "Received", // default
        tracking: {
          Received: { checked: true, date: formData.date || new Date().toLocaleDateString("id-ID") },
          "Item Checking": { checked: false, date: null },
          "Storage Checking": { checked: false, date: null },
          Stored: { checked: false, date: null },
          Canceled: { checked: false, date: null },
        },
      };
      setInboundList([newEntry, ...inboundList]);
    }
    setFormData({ product: "", qty: "", supplier: "", purchasePrice: "", date: "", note: "" });
    setEditingItemId(null);
    setOpen(false);
  };

  const handleEdit = (item: any) => {
    setFormData(item);
    setEditingItemId(item.id);
    setOpen(true);
  };

  const handleCancel = (item: any) => {
    setCancelItem(item);
    setCancelNote(item.note || "");
    setCancelOpen(true);
  };

  const confirmCancel = () => {
    if (!cancelItem) return;
    setInboundList((prev) =>
      prev.map((item) =>
        item.id === cancelItem.id
          ? {
              ...item,
              status: "Canceled",
              note: cancelNote,
              tracking: { ...item.tracking, Canceled: { checked: true, date: new Date().toLocaleDateString("id-ID") } },
            }
          : item
      )
    );
    setCancelOpen(false);
    setCancelItem(null);
    setCancelNote("");
  };

  const handleTracking = (item: any) => {
    setTrackingItem(item);
    setTrackingStatus(item.tracking);
    setTrackingOpen(true);
  };

  // Summary Cards
  const statusCounts = inboundList.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalExpense = inboundList.reduce((acc, curr) => acc + Number(curr.purchasePrice), 0);
  const cards = [
    { title: "Total Inbound", value: inboundList.length, icon: <Package className="w-5 h-5" /> },
    { title: "Received", value: statusCounts["Received"] || 0, icon: <CircleCheck className="w-5 h-5" /> },
    { title: "Item Checking", value: statusCounts["Item Checking"] || 0, icon: <Search className="w-4.5 h-4.5" /> },
    { title: "Stored", value: statusCounts["Stored"] || 0, icon: <Inbox className="w-5 h-5" /> },
    // { title: "Canceled", value: statusCounts["Canceled"] || 0, icon: <CircleX className="w-5 h-5" /> },
    { title: "Total Expense", value: `Rp ${totalExpense.toLocaleString("id-ID")}`, icon: <CircleArrowUp className="text-destructive w-5 h-5" /> },
  ];

  return (
    <div className="p-6 space-y-4">
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
              <div className="col-span-2">
                <Label>Supplier</Label>
                <Input required value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
              </div>
              <div>
                <Label>Quantity</Label>
                <Input type="number" required value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} />
              </div>
              <div>
                <Label>Purchase Price (Rp)</Label>
                <Input type="number" required value={formData.purchasePrice} onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })} />
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
                    <DropdownMenuItem onClick={() => handleTracking(item)}>
                      <MapPin className="h-4 w-4 mr-2 text-blue-600" /> Tracking
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCancel(item)} className="text-red-600">
                      <CircleX className="h-4 w-4 mr-2" /> Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* cancel modal */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="max-w-md animate-pulse flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-lg flex flex-col text-center items-center gap-2">
              <div className="bg-yellow-400 rounded-full p-3">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <span>Are you sure to cancel this inbound?</span>
            </DialogTitle>
            <span className="text-md text-center">Total item will be returned and this action cannot be undone.</span>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-700 font-medium">{cancelItem?.product}</p>
            <p className="text-gray-700 font-medium">Qty: {cancelItem?.qty}</p>
            <div className="w-full pt-2">
              <Label className="text-red-500 font-semibold pb-1">Cancellation Note</Label>
              <Input onChange={(e) => setCancelNote(e.target.value)} placeholder="Add reason for cancellation" required autoFocus />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 w-full">
            <Button variant="outline" onClick={() => setCancelOpen(false)}>
              No
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmCancel}>
              Yes, Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* tracking modal */}
      <Dialog open={trackingOpen} onOpenChange={setTrackingOpen}>
        <DialogContent className="max-w-md flex flex-col ">
          <DialogHeader>
            <DialogTitle className="text-lg flex flex-col items-center gap-2">
              <div className="bg-blue-400 rounded-full p-3">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span>Tracking {trackingItem?.product}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col space-y-2 mt-4 w-full">
            {Object.keys(trackingStatus).map((status) => (
              <div key={status} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={trackingStatus[status].checked}
                    onCheckedChange={(checked) =>
                      setTrackingStatus((prev) => ({
                        ...prev,
                        [status]: {
                          checked: Boolean(checked),
                          date: checked ? prev[status].date || new Date().toLocaleDateString("id-ID") : null,
                        },
                      }))
                    }
                  />
                  <span>{status}</span>
                </div>
                <span className="text-xs text-gray-500">{trackingStatus[status].date || "-"}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 mt-4 w-full">
            <Button variant="outline" onClick={() => setTrackingOpen(false)}>
              Close
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                const lastCheckedStatus = Object.keys(trackingStatus)
                  .reverse()
                  .find((s) => trackingStatus[s].checked);

                setInboundList((prev) =>
                  prev.map((i) =>
                    i.id === trackingItem.id
                      ? {
                          ...i,
                          status: lastCheckedStatus || i.status,
                          tracking: trackingStatus,
                        }
                      : i
                  )
                );
                setTrackingOpen(false);
              }}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
