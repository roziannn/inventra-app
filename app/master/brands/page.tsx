"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Edit2, ImportIcon, Plus, Trash2 } from "lucide-react";
import { brandService } from "@/services/brand.service";
import { Brand } from "@/types/brand";
import { formatDate } from "@/helper/formatDate";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function BrandPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [brandName, setBrandName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editIsActive, setEditIsActive] = useState(true);

  const queryClient = useQueryClient();

  // FETCH DATA with React Query
  const { data, isLoading } = useQuery({
    queryKey: ["brands", page, limit],
    queryFn: () => brandService.getAllPaged(page, limit),
    // keepPreviousData: true,
  });

  const brands = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  // MUTATIONS
  const createBrand = useMutation({
    mutationFn: () => brandService.create(brandName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      resetForm();
    },
  });

  const updateBrand = useMutation({
    mutationFn: () =>
      brandService.update(editId!, {
        name: brandName,
        isActive: editIsActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      resetForm();
    },
  });

  const deleteBrand = useMutation({
    mutationFn: (id: string) => brandService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  // Handlers
  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) deleteBrand.mutate(id);
  };

  const resetForm = () => {
    setBrandName("");
    setEditId(null);
    setDialogOpen(false);
    setEditIsActive(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Brands</h1>
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
            <Plus /> Add Brand
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
            {brands.map((brand: Brand) => (
              <TableRow key={brand.id}>
                <TableCell>{brand.name}</TableCell>
                <TableCell>{brand.isActive ? <Badge>Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</TableCell>
                <TableCell>{brand.createdBy}</TableCell>
                <TableCell>{formatDate(brand.createdAt)}</TableCell>
                <TableCell className="flex justify-center gap-2">
                  <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => {
                      setDialogMode("edit");
                      setEditId(brand.id);
                      setBrandName(brand.name);
                      setEditIsActive(brand.isActive);
                      setDialogOpen(true);
                    }}
                  >
                    <Edit2 />
                  </Button>
                  <Button size="icon-sm" variant="destructive" onClick={() => handleDelete(brand.id)}>
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
            <DialogTitle>{dialogMode === "add" ? "Add Brand" : "Edit Brand"}</DialogTitle>
          </DialogHeader>

          <Label>Name</Label>
          <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} />

          {dialogMode === "edit" && (
            <div className="flex items-center gap-2 py-2">
              <Label>Status</Label>
              <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
            </div>
          )}

          <Button onClick={() => (dialogMode === "add" ? createBrand.mutate() : updateBrand.mutate())}>{createBrand.isPending || updateBrand.isPending ? "Saving..." : "Save"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
