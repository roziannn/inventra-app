"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Edit2, ImportIcon, Plus, Trash2 } from "lucide-react";
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
    setDialogOpen(false);
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error loading categories</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Categories</h1>
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
            <Plus /> Add Category
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
          {data?.data.map((cat: Category) => (
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
      <div className="flex justify-end mt-6">
        <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
          <ChevronLeft />
        </Button>
        <span className="text-sm px-4">
          Page {page} of {data?.pagination.totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={page === data?.pagination.totalPages} onClick={() => setPage(page + 1)}>
          <ChevronRight />
        </Button>
      </div>

      {/* DIALOG FORM */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Category" : "Edit Category"}</DialogTitle>
          </DialogHeader>

          <Label>Name</Label>
          <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />

          {dialogMode === "edit" && (
            <div className="flex items-center gap-2 py-2">
              <Label>Status</Label>
              <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
            </div>
          )}

          <Button onClick={dialogMode === "add" ? () => createMutation.mutate() : () => updateMutation.mutate()}>Save</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
