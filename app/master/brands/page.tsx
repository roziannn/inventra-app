"use client";

import { useState, useEffect } from "react";
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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandName, setBrandName] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editId, setEditId] = useState<string | null>(null);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const loadBrands = async () => {
    try {
      const res = await brandService.getAllPaged(page, limit);
      setBrands(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await loadBrands();
    };
    fetchData();
  }, [page]);

  const handleAdd = async () => {
    if (!brandName.trim()) return;
    setLoading(true);
    await brandService.create(brandName);
    await loadBrands();
    resetForm();
  };

  const handleUpdate = async () => {
    if (!editId) return;
    setLoading(true);
    await brandService.update(editId, {
      name: brandName,
      isActive: editIsActive,
    });
    await loadBrands();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await brandService.delete(id);
    await loadBrands();
  };

  const resetForm = () => {
    setBrandName("");
    setDialogOpen(false);
    setEditId(null);
    setLoading(false);
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
          {brands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell>{brand.name}</TableCell>
              <TableCell>{brand.isActive ? <Badge variant="default">Active</Badge> : <Badge variant="destructive">Inactive</Badge>}</TableCell>
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

      {/* PAGINATION */}
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

      {/* DIALOG FORM */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Brand" : "Edit Brand"}</DialogTitle>
          </DialogHeader>

          <Label>Name</Label>
          <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          {dialogMode === "edit" && (
            <div className="flex items-center justify-start gap-2 py-2">
              <Label>Status</Label>
              <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
            </div>
          )}

          <Button onClick={dialogMode === "add" ? handleAdd : handleUpdate}>{loading ? "Saving..." : "Save"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
