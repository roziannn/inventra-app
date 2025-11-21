"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Edit2, ImportIcon, Plus, Trash2 } from "lucide-react";
import { storageLocationService } from "@/services/storage-locations.service";
import { StorageLocation } from "@/types/storage-locations";
import { formatDate } from "@/helper/formatDate";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function StorageLocationPage() {
  const [locations, setLocations] = useState<StorageLocation[]>([]);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    zone: "",
    description: "",
    type: "rack" as StorageLocation["type"],
    maxCapacity: 0,
    capacityUnit: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const loadLocations = async () => {
    try {
      const res = await storageLocationService.getAllPaged(page, limit);
      setLocations(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadLocations();
    };
    fetchData();
  });

  const handleAdd = async () => {
    setLoading(true);
    await storageLocationService.create(formData);
    await loadLocations();
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editId) return;
    setLoading(true);
    await storageLocationService.update(editId, formData);
    await loadLocations();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await storageLocationService.delete(id);
    await loadLocations();
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      zone: "",
      description: "",
      type: "rack",
      maxCapacity: 0,
      capacityUnit: "",
      isActive: true,
    });
    setDialogOpen(false);
    setEditId(null);
    setLoading(false);
  };

  const typeOptions = ["rack", "shelf", "drawer", "box", "bin", "cabinet"];
  const zoneOptions = ["Ruang Sparepart", "Ruang General", "Ruang Arsip"];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Storage Locations</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDialogMode("add");
              setDialogOpen(true);
            }}
          >
            <ImportIcon /> Import
          </Button>
          <Button
            onClick={() => {
              setDialogMode("add");
              setDialogOpen(true);
            }}
          >
            <Plus /> Add Location
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead>Max Capacity</TableHead>
            <TableHead>Act Capacity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {locations.map((loc) => (
            <TableRow key={loc.id}>
              <TableCell>{loc.code}</TableCell>
              <TableCell>{loc.name}</TableCell>
              <TableCell>{loc.type || ""}</TableCell>
              <TableCell>{loc.zone || ""}</TableCell>
              <TableCell>{loc.maxCapacity ?? "0"}</TableCell>
              <TableCell>{loc.currentCapacity ?? "0"}</TableCell>
              <TableCell>{loc.isActive ? <Badge variant="default">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</TableCell>
              <TableCell>{loc.createdBy ?? "system"}</TableCell>
              <TableCell>{formatDate(loc.createdAt)}</TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => {
                    setDialogMode("edit");
                    setEditId(loc.id);
                    setFormData({
                      code: loc.code,
                      name: loc.name,
                      zone: loc.zone || "",
                      description: loc.description || "",
                      type: loc.type || "rack",
                      maxCapacity: loc.maxCapacity ?? 0,
                      capacityUnit: loc.capacityUnit ?? "",
                      isActive: loc.isActive,
                    });
                    setDialogOpen(true);
                  }}
                >
                  <Edit2 />
                </Button>
                <Button size="icon-sm" variant="destructive" onClick={() => handleDelete(loc.id)}>
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-end mt-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
            <ChevronLeft />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Location" : "Edit Location"}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="w-full">
              <Label>Code</Label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
            </div>

            <div className="w-full">
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Zone</Label>
                <Select value={formData.zone} onValueChange={(val) => setFormData({ ...formData, zone: val })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zoneOptions.map((z) => (
                      <SelectItem key={z} value={z}>
                        {z}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val as StorageLocation["type"] })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="w-full">
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Max Capacity</Label>
                <Input type="number" value={formData.maxCapacity} onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })} />
              </div>

              <div className="flex-1">
                <Label>Capacity Unit</Label>
                <Input value={formData.capacityUnit} onChange={(e) => setFormData({ ...formData, capacityUnit: e.target.value })} />
              </div>
            </div>

            {dialogMode === "edit" && (
              <div className="flex items-center gap-2 py-2">
                <Label>Status</Label>
                <Switch checked={formData.isActive} onCheckedChange={(val) => setFormData({ ...formData, isActive: val })} />
              </div>
            )}

            <Button onClick={dialogMode === "add" ? handleAdd : handleUpdate} disabled={loading} className="mt-2">
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
