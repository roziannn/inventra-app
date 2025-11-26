"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, CircleFadingArrowUp, CirclePlus, Edit2, Trash2 } from "lucide-react";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";
import { formatDate } from "@/helper/formatDate";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function CategoryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [categoryName, setCategoryName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  const [page, setPage] = useState(1);
  const limit = 10;

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories", page],
    queryFn: () => categoryService.getAllPaged(page, limit),
    // keepPreviousData: true,
  });

  const categories = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const createMutation = useMutation({
    mutationFn: () => categoryService.create(categoryName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      categoryService.update(editId!, {
        name: categoryName,
        isActive: editIsActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const resetForm = () => {
    setCategoryName("");
    setEditId(null);
    setEditIsActive(true);
    setDialogOpen(false);
  };

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (isError) return <p className="p-6 text-red-500">Error loading categories</p>;

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Categories</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <CircleFadingArrowUp /> Import
          </Button>
          <Button
            onClick={() => {
              setDialogMode("add");
              setDialogOpen(true);
            }}
          >
            <CirclePlus /> Add Category
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
          {categories.map((cat: Category) => (
            <TableRow key={cat.id}>
              <TableCell>{cat.name}</TableCell>
              <TableCell>{cat.isActive ? <Badge>Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</TableCell>
              <TableCell>{cat.createdBy}</TableCell>
              <TableCell>{formatDate(cat.createdAt)}</TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => {
                    setDialogMode("edit");
                    setEditId(cat.id);
                    setCategoryName(cat.name);
                    setEditIsActive(cat.isActive);
                    setDialogOpen(true);
                  }}
                >
                  <Edit2 />
                </Button>
                <Button size="icon-sm" variant="destructive" onClick={() => deleteMutation.mutate(cat.id)}>
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">{`Showing ${categories.length > 0 ? (page - 1) * limit + 1 : 0} to ${(page - 1) * limit + categories.length} of ${data?.pagination?.totalItems ?? 0} entries`}</div>
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
            <DialogTitle>{dialogMode === "add" ? "Add Category" : "Edit Category"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <Label>Name</Label>
            <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />

            {dialogMode === "edit" && (
              <div className="flex items-center gap-2">
                <Label>Status</Label>
                <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
              </div>
            )}

            <Button className="mt-4" onClick={dialogMode === "add" ? () => createMutation.mutate() : () => updateMutation.mutate()}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
