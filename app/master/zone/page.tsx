"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CircleFadingArrowUp, CirclePlus, SquarePen, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { IconCircleCheckFilled, IconCircleXFilled } from "@tabler/icons-react";
import { ZoneListDto } from "@/types/zone";
import { formatDate } from "@/helper/formatDate";
import { zoneClient } from "@/services/client/zone.client";
import { zoneService } from "@/services/server/zone.service";

export default function ZonePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [zoneName, setZoneName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editIsActive, setEditIsActive] = useState(true);
  const [zones, setZones] = useState<ZoneListDto[]>([]);

  const queryClient = useQueryClient();

  // get all
  const { data: Zone = [], isLoading } = useQuery({
    queryKey: ["zones"],
    queryFn: zoneClient.getAll,
  });

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(Zone.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedData = Zone.slice(startIndex, startIndex + itemsPerPage);

  // MUTATIONS

  const createZone = useMutation({
    mutationFn: () => zoneClient.create({ name: zoneName, isActive: editIsActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] });
      resetForm();
    },
  });

  const handleOpenEdit = (zone: ZoneListDto) => {
    setDialogMode("edit");
    setEditId(zone.id);
    setZoneName(zone.name);
    setEditIsActive(zone.isActive);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setZoneName("");
    setEditId(null);
    setDialogOpen(false);
    setEditIsActive(true);
  };

  if (isLoading) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Zones</h1>
          <p className="text-sm text-muted-foreground">Manage your zones catalog here</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <CircleFadingArrowUp /> Import
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <CirclePlus /> Add Zone
          </Button>
        </div>
      </div>

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
          {Zone.map((zone) => (
            <TableRow key={zone.id}>
              <TableCell>{zone.name}</TableCell>
              <TableCell>
                {zone.isActive ? (
                  <Badge>
                    <IconCircleCheckFilled /> Active
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <IconCircleXFilled /> Inactive
                  </Badge>
                )}
              </TableCell>
              <TableCell>{zone.createdBy}</TableCell>
              <TableCell>{formatDate(zone.createdAt)}</TableCell>
              <TableCell className="flex justify-center gap-2">
                <Button size="icon-sm" variant="outline" onClick={() => handleOpenEdit(zone)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add Zone" : "Edit Zone"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <Label>Name</Label>
            <Input value={zoneName} onChange={(e) => setZoneName(e.target.value)} />
            {dialogMode === "edit" && (
              <div className="flex items-center gap-2">
                <Label>Status</Label>
                <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
              </div>
            )}
            <Button className="mt-4" onClick={dialogMode === "add" ? () => createZone.mutate() : () => createZone.mutate()}>
              {createZone.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
