"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import type { StorageLocation, StorageLocationDetailResponse } from "@/types/storage-locations";
import { storageLocationService } from "@/services/storage-locations.service";
import { formatDate } from "@/helper/formatDate";

export default function ManageStoragePage() {
  const [selectedLocation, setSelectedLocation] = useState<StorageLocationDetailResponse | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedStorageId, setSelectedStorageId] = useState<string | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const { data: storageLocations = [], isLoading: isLovLoading } = useQuery<StorageLocation[]>({
    queryKey: ["storage-lov"],
    queryFn: () => storageLocationService.getLOV(),
  });

  const handleSelectStorage = async (id: string) => {
    setSelectedStorageId(id);
    setIsDetailLoading(true);

    try {
      const data: StorageLocationDetailResponse = await storageLocationService.getByStorageId(id);
      setSelectedLocation(data); // langsung pakai product
    } catch (err) {
      console.error("Failed to fetch storage detail:", err);
      setSelectedLocation(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  if (isLovLoading) return <div>Loading storage locations...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Manage Storage</h1>
      <p className="text-sm text-muted-foreground mb-4">Manage your product storage zone catalog here</p>

      <div className="my-6 max-w-sm">
        <Select onValueChange={handleSelectStorage} value={selectedStorageId || ""}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Storage..." />
          </SelectTrigger>
          <SelectContent>
            {storageLocations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isDetailLoading && <div className="p-4 text-sm text-muted-foreground italic">Memuat data storage...</div>}

      {!isDetailLoading && selectedLocation && (
        <div className="border p-3 flex flex-col justify-between items-center shadow-sm rounded-md mb-4 w-full max-w-md">
          <div className="w-full flex justify-between items-center mb-2">
            <span className="font-semibold">{selectedLocation.code}</span>

            <Badge
              variant={
                selectedLocation.maxCapacity
                  ? selectedLocation.currentCapacity! / selectedLocation.maxCapacity < 0.5
                    ? "secondary"
                    : selectedLocation.currentCapacity! / selectedLocation.maxCapacity < 0.8
                    ? "outline"
                    : "destructive"
                  : "default"
              }
            >
              {selectedLocation.maxCapacity ? Math.round(((selectedLocation.currentCapacity ?? 0) / selectedLocation.maxCapacity) * 100) : 0}%
            </Badge>
          </div>

          <Progress value={selectedLocation.maxCapacity ? Math.round(((selectedLocation.currentCapacity ?? 0) / selectedLocation.maxCapacity) * 100) : 0} className="w-full h-3 mb-2" />

          <div className="text-sm text-gray-600 mb-2">
            {selectedLocation.currentCapacity ?? 0} / {selectedLocation.maxCapacity ?? 0}
          </div>

          <div className="flex flex-wrap gap-1 justify-center w-full">
            {selectedLocation.product?.map((item) => (
              <div key={item.id} title={`${item.name}: ${item.stock}`} className="bg-blue-400 text-white text-xs px-1 py-0.5 rounded">
                {item.name} ({item.stock})
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => setOpenDetail(true)}>
            View Details
          </Button>
        </div>
      )}

      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Storage Location: {selectedLocation?.code}</DialogTitle>
            <DialogDescription>This dialog shows details about products stored in this location.</DialogDescription>
          </DialogHeader>

          <h4 className="font-semibold mt-4 mb-2">Stored Products</h4>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedLocation?.product?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.stock}</TableCell>
                  <TableCell>{formatDate(item.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
