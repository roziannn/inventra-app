"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CirclePlus, SquarePen, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { IconCircleCheckFilled, IconCircleXFilled } from "@tabler/icons-react";
import { ZoneListDto } from "@/types/zone";
import { formatDate } from "@/helper/formatDate";
import { zoneClient } from "@/services/client/zone.client";

export default function ZonePage() {
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    isActive: true,
  });

  // get all
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: zoneClient.getAll,
  });

  // create
  const createMutation = useMutation({
    mutationFn: () =>
      zoneClient.create({
        name: formData.name,
        isActive: true,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      resetForm();
    },
  });

  // update
  const updateMutation = useMutation({
    mutationFn: () =>
      zoneClient.update(editId!, {
        id: editId!,
        name: formData.name,
        isActive: formData.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      resetForm();
      setIsEdit(false);
      setEditId(null);
    },
  });

  const handleOpenEdit = (item: ZoneListDto) => {
    setIsEdit(true);
    setEditId(item.id);

    setFormData({
      name: item.name,
      isActive: item.isActive,
    });

    setOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      isActive: true,
    });
    setOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("Name is required");
      return;
    }

    if (isEdit) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  if (isLoading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Zones</h1>
          <p className="text-sm text-muted-foreground">Manage your zones catalog here</p>
        </div>

        <Button onClick={() => setOpen(true)}>
          <CirclePlus /> Add Zone
        </Button>
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
          {zones.map((z) => (
            <TableRow key={z.id}>
              <TableCell>{z.name}</TableCell>
              <TableCell>
                {z.isActive ? (
                  <Badge>
                    <IconCircleCheckFilled /> Active
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <IconCircleXFilled /> Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell>{z.createdBy}</TableCell>
              <TableCell>{formatDate(z.createdAt)}</TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button size="icon-sm" variant="outline" onClick={() => handleOpenEdit(z)}>
                  <SquarePen />
                </Button>
                <Button size="icon-sm" variant="destructive">
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Zone" : "Add Zone"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <Label>Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

            {isEdit && (
              <div className="flex items-center gap-3 mt-2">
                <Label>Status</Label>
                <Switch checked={formData.isActive} onCheckedChange={(v) => setFormData({ ...formData, isActive: v })} />
              </div>
            )}

            <Button className="mt-4" onClick={handleSubmit}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
