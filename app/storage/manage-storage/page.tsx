"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

import type { StorageLocation, StorageLocationDetailResponse } from "@/types/storage-locations";
import type { ZoneLOV } from "@/types/zone";

import { storageLocationService } from "@/services/storage-locations.service";
import { zoneClient } from "@/services/client/zone.client";
import { formatDate } from "@/helper/formatDate";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ManageStoragePage() {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<StorageLocationDetailResponse | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // get zone LOV
  const { data: zones = [], isLoading: isZoneLoading } = useQuery<ZoneLOV[]>({
    queryKey: ["zones-lov"],
    queryFn: () => zoneClient.getLOV(),
  });

  // get Storage Locations by Zone
  const { data: storageLocations = [], isLoading: isStorageLoading } = useQuery<StorageLocation[]>({
    queryKey: ["storage-by-zone", selectedZoneId],
    queryFn: () => storageLocationService.getByZoneId(selectedZoneId!),
    enabled: !!selectedZoneId,
  });

  const handleSelectStorage = async (id: string) => {
    setIsDetailLoading(true);
    try {
      const data: StorageLocationDetailResponse = await storageLocationService.getByStorageId(id);
      setSelectedLocation(data);
      setOpenDetail(true);
    } catch (err) {
      console.error("Failed to fetch storage detail:", err);
      setSelectedLocation(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  if (isZoneLoading) return <div>Loading zones...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Manage Storage</h1>
      <p className="text-sm text-muted-foreground mb-4">Manage your product storage zone catalog here</p>

      <div className="my-4 max-w-sm">
        <Select
          value={selectedZoneId || ""}
          onValueChange={(val) => {
            setSelectedZoneId(val);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Zone..." />
          </SelectTrigger>
          <SelectContent className="w-full">
            {zones.map((zone) => (
              <SelectItem key={zone.id} value={zone.id}>
                {zone.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedZoneId && (
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {isStorageLoading ? (
            <div>Loading storage locations...</div>
          ) : storageLocations.length === 0 ? (
            <div>No storage locations found for this zone.</div>
          ) : (
            storageLocations.map((loc) => (
              <div key={loc.id} className="border p-4 rounded shadow cursor-pointer hover:shadow-md transition" onClick={() => handleSelectStorage(loc.id)}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">
                    {loc.code} - {loc.name}
                  </span>
                  <Badge variant={loc.maxCapacity ? (loc.currentCapacity! / loc.maxCapacity < 0.5 ? "secondary" : loc.currentCapacity! / loc.maxCapacity < 0.8 ? "outline" : "destructive") : "default"}>
                    {loc.maxCapacity ? Math.round((loc.currentCapacity! / loc.maxCapacity) * 100) : 0}%
                  </Badge>
                </div>

                <Progress value={loc.maxCapacity ? Math.round((loc.currentCapacity! / loc.maxCapacity) * 100) : 0} className="w-full h-3 mb-2" />

                <div className="text-sm text-gray-600 mb-2">
                  {loc.currentCapacity ?? 0} / {loc.maxCapacity ?? 0}
                </div>

                <div className="flex flex-wrap gap-1">
                  {loc.product?.map((item) => (
                    <div key={item.id} className="bg-blue-400 text-white text-xs px-1 py-0.5 rounded">
                      {item.name} ({item.stock})
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-2xl w-full">
          {isDetailLoading ? (
            <div>Loading details...</div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  Storage Location: {selectedLocation?.code} - {selectedLocation?.name}
                </DialogTitle>
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
