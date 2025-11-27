"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, PlusCircle, Save, Trash2, Edit3, Truck, CheckCircle2, Package, Wallet, FileText, CircleArrowDown, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/helper/formatDate";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { inputCurrency } from "@/helper/inputCurrency";

export default function OutboundPage() {
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products-lov"],
    queryFn: productService.getLOV,
  });

  const [outboundList, setOutboundList] = useState([
    {
      id: 1,
      product: "Product 1",
      qty: 10,
      supplier: "Supplier A",
      sellingPrice: 200000,
      operationalCost: 25000,
      date: "2025-01-01",
      status: "Sent",
      note: "Urgent delivery",
      shippingRequired: true,
      shippingDate: "2025-01-02",
      courier: "JNE",
      resiImage: "",
    },
    {
      id: 2,
      product: "Product 2",
      qty: 5,
      supplier: "Supplier B",
      sellingPrice: 120000,
      operationalCost: 15000,
      date: "2025-01-03",
      status: "Delivered",
      note: "",
      shippingRequired: false,
      courier: "",
      resiImage: "",
    },
  ]);

  const [open, setOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    product: "",
    qty: "",
    supplier: "",
    sellingPrice: "",
    sellingPriceDisplay: "",
    operationalCost: "",
    operationalCostDisplay: "",
    date: "",
    status: "Sent",
    note: "",
    shippingRequired: false,
    shippingDate: "",
    courier: "",
    resiImage: "",
  });

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const totalPages = Math.ceil(outboundList.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = outboundList.slice(startIndex, startIndex + itemsPerPage);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const entryWithStatus = { ...formData, status: "Sent" };

    if (editingItemId) {
      setOutboundList((prev) => prev.map((item) => (item.id === editingItemId ? { ...item, ...entryWithStatus } : item)));
    } else {
      const newEntry = { ...entryWithStatus, id: outboundList.length + 1 };
      setOutboundList([newEntry, ...outboundList]);
    }

    setFormData({
      product: "",
      qty: "",
      supplier: "",
      sellingPrice: "",
      operationalCost: "",
      date: "",
      note: "",
      shippingRequired: false,
      shippingDate: "",
      courier: "",
      resiImage: "",
    });

    setEditingItemId(null);
    setOpen(false);
  };

  const handleEdit = (item: any) => {
    setFormData(item);
    setEditingItemId(item.id);
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    setOutboundList(outboundList.filter((item) => item.id !== id));
  };

  const statusCounts = outboundList.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalOperationalCost = outboundList.reduce((acc, item) => acc + Number(item.operationalCost || 0), 0);
  const totalValue = outboundList.reduce((acc, item) => acc + Number(item.sellingPrice || 0) + Number(item.operationalCost || 0), 0);

  const cards = [
    { title: "Total Outbound", value: outboundList.length, icon: <Package className="h-5 w-5" /> },
    { title: "Sent", value: statusCounts["Sent"] || 0, icon: <Truck className="h-5 w-5" /> },
    { title: "Delivered", value: statusCounts["Delivered"] || 0, icon: <CheckCircle2 className="h-5 w-5" /> },
    // { title: "Canceled", value: statusCounts["Canceled"] || 0, icon: <XCircle className="h-5 w-5" /> },
    { title: "Operational Cost", value: `Rp ${totalOperationalCost.toLocaleString("id-ID")}`, icon: <Wallet className="h-5 w-5" /> },
    { title: "Total Earning", value: `Rp ${totalValue.toLocaleString("id-ID")}`, icon: <CircleArrowDown className="text-primary  h-5 w-5" /> },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Outbound</h1>
          <p className="text-sm text-muted-foreground">Manage your outbound catalog here</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" onClick={() => setEditingItemId(null)}>
              <PlusCircle className="h-4 w-4" />
              Add Outbound
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItemId ? "Edit Outbound Item" : "Add Outbound Item"}</DialogTitle>
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

              <div>
                <Label>Quantity</Label>
                <Input type="number" required value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} />
              </div>

              <div>
                <Label>Buyer</Label>
                <Input required value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })} />
              </div>

              <div>
                <Label>Selling Price</Label>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <span className="bg-gray-100 px-2 py-2 text-sm text-gray-700 border-r">Rp</span>
                  <Input
                    type="text"
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1.5"
                    required
                    value={formData.sellingPriceDisplay || ""}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^\d]/g, "");
                      setFormData({
                        ...formData,
                        sellingPrice: rawValue,
                        sellingPriceDisplay: inputCurrency(e.target.value),
                      });
                    }}
                  />
                </div>
              </div>

              <div>
                <Label>Operational Cost</Label>
                <div className="flex items-center border rounded-md overflow-hidden">
                  <span className="bg-gray-100 px-2 py-2 text-sm text-gray-700 border-r">Rp</span>
                  <Input
                    type="text"
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-1.5"
                    value={formData.operationalCostDisplay || ""}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^\d]/g, "");
                      setFormData({
                        ...formData,
                        operationalCost: rawValue,
                        operationalCostDisplay: inputCurrency(e.target.value),
                      });
                    }}
                  />
                </div>
              </div>

              <div className="col-span-2">
                <Label>Date</Label>
                <Input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>

              <div className="col-span-2">
                <Label>Note</Label>
                <Input value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
              </div>

              {/* Checkbox Shipping */}
              <div className="col-span-2 flex items-center gap-2">
                <Checkbox checked={formData.shippingRequired} onCheckedChange={(checked) => setFormData({ ...formData, shippingRequired: !!checked })} />
                <Label>Shipping Required?</Label>
              </div>

              {/* Shipping Fields */}
              {formData.shippingRequired && (
                <>
                  <div>
                    <Label>Shipping Date</Label>
                    <Input type="date" value={formData.shippingDate} onChange={(e) => setFormData({ ...formData, shippingDate: e.target.value })} />
                  </div>

                  <div>
                    <Label>Courier</Label>
                    <Select value={formData.courier} onValueChange={(value) => setFormData({ ...formData, courier: value })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Courier" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kurir Mandiri">🚚 Kurir Mandiri (From Me)</SelectItem>
                        <SelectItem value="separator" disabled>
                          ── External Couriers ──
                        </SelectItem>
                        <SelectItem value="JNE">JNE</SelectItem>
                        <SelectItem value="J&T">J&T Express</SelectItem>
                        <SelectItem value="SiCepat">SiCepat</SelectItem>
                        <SelectItem value="Pos Indonesia">Pos Indonesia</SelectItem>
                        <SelectItem value="Wahana">Wahana</SelectItem>
                        <SelectItem value="TIKI">TIKI</SelectItem>
                        <SelectItem value="Indah Logistik">Indah Logistik (Cargo Truck)</SelectItem>
                        <SelectItem value="Sentral Cargo">Sentral Cargo (Cargo Truck)</SelectItem>
                        <SelectItem value="Samudera Indonesia">Samudera Indonesia (Sea Freight)</SelectItem>
                        <SelectItem value="ASP Shipping">ASP Shipping (Sea Cargo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label>Upload Resi Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          resiImage: e.target.files?.[0]?.name || "",
                        })
                      }
                    />
                  </div>
                </>
              )}

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
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Courier</TableHead>
            <TableHead>Resi</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {paginatedData.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.product}</TableCell>
              <TableCell>{item.qty}</TableCell>
              <TableCell>{item.supplier}</TableCell>
              <TableCell>Rp {Number(item.sellingPrice).toLocaleString("id-ID")}</TableCell>
              <TableCell>Rp {Number(item.operationalCost || 0).toLocaleString("id-ID")}</TableCell>
              <TableCell>Rp {(Number(item.sellingPrice || 0) + Number(item.operationalCost || 0)).toLocaleString("id-ID")}</TableCell>
              <TableCell>{formatDate(item.date)}</TableCell>
              <TableCell>{item.status}</TableCell>
              <TableCell>{item.courier || "-"}</TableCell>
              <TableCell className="flex justify-center items-center gap-2">
                {item.resiImage ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Show Resi"
                    onClick={() => {
                      alert(`Resi file: ${item.resiImage}`);
                    }}
                  >
                    <FileText className="h-4 w-4 text-blue-600" />
                  </Button>
                ) : (
                  "-"
                )}
              </TableCell>

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

                    <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
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
