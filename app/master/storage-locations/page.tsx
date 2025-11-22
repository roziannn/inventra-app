"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Edit2, ImportIcon, Plus, Trash2 } from "lucide-react";
import { storageLocationService } from "@/services/storage-locations.service";
import { StorageLocation } from "@/types/storage-locations";
import { formatDate } from "@/helper/formatDate";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function StorageLocationPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");

  // FORM STATES
  const [form, setForm] = useState({
    code: "",
    name: "",
    zone: "",
    description: "",
    type: "rack" as StorageLocation["type"],
    maxCapacity: 0,
    capacityUnit: "",
    isActive: true,
  });
  const [editId, setEditId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["storage-locations", page, limit],
    queryFn: () => storageLocationService.getAllPaged(page, limit),
  });

  const locations = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const createLocation = useMutation({
    mutationFn: () => storageLocationService.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storage-locations"] });
      resetForm();
    },
  });

  const updateLocation = useMutation({
    mutationFn: () => storageLocationService.update(editId!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storage-locations"] });
      resetForm();
    },
  });

  const deleteLocation = useMutation({
    mutationFn: (id: string) => storageLocationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storage-locations"] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) deleteLocation.mutate(id);
  };

  const resetForm = () => {
    setForm({
      code: "",
      name: "",
      zone: "",
      description: "",
      type: "rack",
      maxCapacity: 0,
      capacityUnit: "",
      isActive: true,
    });
    setEditId(null);
    setDialogOpen(false);
  };

  const typeOptions = ["rack", "shelf", "drawer", "box", "bin", "cabinet"];
  const zoneOptions = ["Ruang Sparepart", "Ruang Arsip", "Ruang Studio"];

  const generateCode = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setForm((prev) => ({ ...prev, code: `LOC-${random}` }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Storage Locations</h1>
        <div className="flex gap-2">
          <Button variant="outline">
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

      {/* TABLE */}
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Max Cap.</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {locations.map((loc: StorageLocation) => (
              <TableRow key={loc.id}>
                <TableCell>{loc.code}</TableCell>
                <TableCell>{loc.name}</TableCell>
                <TableCell>{loc.type}</TableCell>
                <TableCell>{loc.zone || "-"}</TableCell>
                <TableCell>{loc.isActive ? <Badge>Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</TableCell>
                <TableCell>{loc.maxCapacity}</TableCell>
                <TableCell>{loc.capacityUnit}</TableCell>
                <TableCell>{formatDate(loc.createdAt)}</TableCell>

                <TableCell className="flex justify-center gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => {
                      setDialogMode("edit");
                      setEditId(loc.id);
                      setForm({
                        code: loc.code,
                        name: loc.name,
                        zone: loc.zone || "",
                        description: loc.description || "",
                        type: loc.type,
                        maxCapacity: loc.maxCapacity || 0,
                        capacityUnit: loc.capacityUnit || "",
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
      )}

      {/* PAGINATION */}
      <div className="flex justify-end mt-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft />
          </Button>
          <span>
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* FORM DIALOG */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Location" : "Edit Location"}</DialogTitle>
          </DialogHeader>

          {/* Name */}
          <div className="flex flex-col gap-2">
            <Label>Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          {/* Zone */}
          <div className="flex flex-col gap-2">
            <Label>Zone</Label>
            <select className="border rounded p-2" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })}>
              <option value="">Select Zone</option>
              {zoneOptions.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          {/* 2 Columns: Type & Max Capacity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type */}
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <select className="border rounded p-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as StorageLocation["type"] })}>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Capacity */}
            <div className="flex flex-col gap-2">
              <Label>Max Capacity</Label>
              <Input type="number" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: parseInt(e.target.value) || 0 })} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code */}
            <div className="flex flex-col gap-2">
              <Label>Code</Label>
              <div className="flex gap-2">
                <Input className="flex-1" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                <Button type="button" variant="outline" onClick={generateCode}>
                  Generate
                </Button>
              </div>
            </div>

            {/* Capacity Unit */}
            <div className="flex flex-col gap-2">
              <Label>Capacity Unit</Label>
              <Input value={form.capacityUnit} onChange={(e) => setForm({ ...form, capacityUnit: e.target.value })} />
            </div>
          </div>

          {/* Status (only for edit) */}
          {dialogMode === "edit" && (
            <div className="flex items-center gap-3 py-2">
              <Label>Status</Label>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            </div>
          )}

          <Button onClick={() => (dialogMode === "add" ? createLocation.mutate() : updateLocation.mutate())}>{createLocation.isPending || updateLocation.isPending ? "Saving..." : "Save"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
