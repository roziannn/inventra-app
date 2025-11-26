"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, CircleFadingArrowUp, CirclePlus, Edit2, ImportIcon, Plus, Trash2 } from "lucide-react";
import { supplierService } from "@/services/supplier.service";
import { Supplier } from "@/types/supplier";
import { formatDate } from "@/helper/formatDate";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function SupplierPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [supplierName, setSupplierName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editIsActive, setEditIsActive] = useState(true);

  const queryClient = useQueryClient();

  // FETCH SUPPLIERS
  const { data, isLoading } = useQuery({
    queryKey: ["suppliers", page, limit],
    queryFn: () => supplierService.getAllPaged(page, limit),
  });

  const suppliers = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  // MUTATIONS
  const createSupplier = useMutation({
    mutationFn: () => supplierService.create(supplierName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      resetForm();
    },
  });

  const updateSupplier = useMutation({
    mutationFn: () =>
      supplierService.update(editId!, {
        name: supplierName,
        isActive: editIsActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      resetForm();
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: (id: string) => supplierService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) deleteSupplier.mutate(id);
  };

  const resetForm = () => {
    setSupplierName("");
    setEditId(null);
    setDialogOpen(false);
    setEditIsActive(true);
  };

  if (isLoading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Suppliers</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <CircleFadingArrowUp /> Import
          </Button>
          <Button
            onClick={() => {
              setDialogMode("add");
              setDialogOpen(true);
            }}
          >
            <CirclePlus /> Add Supplier
          </Button>
        </div>
      </div>

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((sup: Supplier) => (
            <TableRow key={sup.id}>
              <TableCell>{sup.name}</TableCell>
              <TableCell>{sup.isActive ? <Badge>Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</TableCell>
              <TableCell>{sup.createdBy}</TableCell>
              <TableCell>{formatDate(sup.createdAt)}</TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => {
                    setDialogMode("edit");
                    setEditId(sup.id);
                    setSupplierName(sup.name);
                    setEditIsActive(sup.isActive);
                    setDialogOpen(true);
                  }}
                >
                  <Edit2 />
                </Button>
                <Button size="icon-sm" variant="destructive" onClick={() => handleDelete(sup.id)}>
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">{`Showing ${suppliers.length > 0 ? (page - 1) * limit + 1 : 0} to ${(page - 1) * limit + suppliers.length} of ${data?.pagination?.totalItems ?? 0} entries`}</div>
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

      {/* DIALOG FORM */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Supplier" : "Edit Supplier"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <Label>Name</Label>
            <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />

            {dialogMode === "edit" && (
              <div className="flex items-center gap-2">
                <Label>Status</Label>
                <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
              </div>
            )}

            <Button className="mt-4" onClick={dialogMode === "add" ? () => createSupplier.mutate() : () => updateSupplier.mutate()}>
              {createSupplier.isPending || updateSupplier.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
