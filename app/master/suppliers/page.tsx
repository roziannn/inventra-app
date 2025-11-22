"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Edit2, ImportIcon, Plus, Trash2 } from "lucide-react";
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
    // keepPreviousData: true,
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

  // Handlers
  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) deleteSupplier.mutate(id);
  };

  const resetForm = () => {
    setSupplierName("");
    setEditId(null);
    setDialogOpen(false);
    setEditIsActive(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Suppliers</h1>
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
            <Plus /> Add Supplier
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
              <TableHead>Name</TableHead>
              <TableHead>IsActive</TableHead>
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
      )}

      {/* PAGINATION */}
      <div className="flex justify-end mt-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
            <ChevronLeft />
          </Button>

          <span>
            Page {page} of {totalPages}
          </span>

          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage((prev) => prev + 1)}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      {/* DIALOG FORM */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Supplier" : "Edit Supplier"}</DialogTitle>
          </DialogHeader>

          <Label>Name</Label>
          <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} />

          {dialogMode === "edit" && (
            <div className="flex items-center gap-2 py-2">
              <Label>Status</Label>
              <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
            </div>
          )}

          <Button onClick={() => (dialogMode === "add" ? createSupplier.mutate() : updateSupplier.mutate())}>{createSupplier.isPending || updateSupplier.isPending ? "Saving..." : "Save"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
