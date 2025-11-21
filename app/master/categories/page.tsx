"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { categoryService } from "@/services/category.service";
import { Category } from "@/types/category";

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleAdd = async () => {
    if (!categoryName.trim()) return;
    setLoading(true);
    await categoryService.create(categoryName);
    await loadCategories();
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editId) return;
    setLoading(true);
    await categoryService.update(editId, categoryName);
    await loadCategories();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await categoryService.delete(id);
    await loadCategories();
  };

  const resetForm = () => {
    setCategoryName("");
    setDialogOpen(false);
    setEditId(null);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Categories</h1>
        <Button
          onClick={() => {
            setDialogMode("add");
            setDialogOpen(true);
          }}
        >
          <Plus /> Add Category
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created By</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>{cat.name}</TableCell>
              <TableCell>{cat.createdBy}</TableCell>
              <TableCell>{cat.createdAt}</TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => {
                    setDialogMode("edit");
                    setEditId(cat.id);
                    setCategoryName(cat.name);
                    setDialogOpen(true);
                  }}
                >
                  <Edit2 />
                </Button>
                <Button size="icon-sm" variant="destructive" onClick={() => handleDelete(cat.id)}>
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Category" : "Edit Category"}</DialogTitle>
          </DialogHeader>

          <Label>Name</Label>
          <Input value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />

          <Button onClick={dialogMode === "add" ? handleAdd : handleUpdate}>{loading ? "Saving..." : "Save"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
