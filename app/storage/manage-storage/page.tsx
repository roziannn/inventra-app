"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import type { StorageLocation, StorageLocationDetailResponse } from "@/types/storage-locations";
import type { ZoneLOV } from "@/types/zone";

import { storageLocationService } from "@/services/storage-locations.service";
import { zoneClient } from "@/services/client/zone.client";
import { formatDate } from "@/helper/formatDate";

export default function ManageStoragePage() {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<StorageLocationDetailResponse | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const { data: zones = [], isLoading: isZoneLoading } = useQuery<ZoneLOV[]>({
    queryKey: ["zones-lov"],
    queryFn: () => zoneClient.getLOV(),
  });

  const { data: storageLocations = [], isLoading: isStorageLoading } = useQuery<StorageLocation[]>({
    queryKey: ["storage-by-zone", selectedZoneId],
    queryFn: () => storageLocationService.getByZoneId(selectedZoneId!),
    enabled: !!selectedZoneId,
  });

  const handleSelectStorage = async (id: string) => {
    setIsDetailLoading(true);
    setOpenDetail(true);

    try {
      const data = await storageLocationService.getByStorageId(id);
      setSelectedLocation(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Storage Management</h1>
        <p className="text-sm text-muted-foreground">Monitor and manage storage capacity per zone</p>
      </div>

      {isZoneLoading ? (
        <div className="py-6 text-muted-foreground">Loading zones...</div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="max-w-sm w-full">
              <Select value={selectedZoneId ?? ""} onValueChange={setSelectedZoneId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select storage zone..." />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedZoneId && <Badge variant="outline">{storageLocations.length} locations</Badge>}
          </div>

          {selectedZoneId && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {isStorageLoading ? (
                <div className="col-span-full py-10 text-center text-muted-foreground">Loading storage locations...</div>
              ) : storageLocations.length === 0 ? (
                <div className="col-span-full py-10 text-center text-muted-foreground">No storage locations available in this zone</div>
              ) : (
                storageLocations.map((loc) => {
                  const percentage = loc.maxCapacity ? Math.round((loc.currentCapacity! / loc.maxCapacity) * 100) : 0;

                  const variant = percentage < 50 ? "secondary" : percentage < 80 ? "outline" : "destructive";
                  return (
                    <div
                      key={loc.id}
                      onClick={() => handleSelectStorage(loc.id)}
                      className="
                        rounded-2xl border bg-background p-5 cursor-pointer
                        shadow-sm hover:shadow-md transition-all duration-300
                      "
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs text-muted-foreground">{loc.code}</p>
                          <h3 className="text-lg font-semibold">{loc.name}</h3>
                        </div>

                        <Badge variant={variant}>{percentage}%</Badge>
                      </div>

                      <Progress value={percentage} className="h-2 mb-3" />

                      <div className="mb-4 text-xs text-muted-foreground">
                        Capacity {loc.currentCapacity ?? 0} / {loc.maxCapacity ?? 0}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {loc.product?.slice(0, 4).map((p) => (
                          <span key={p.id} className="px-3 py-1 rounded-full text-xs bg-blue-100 text-foreground">
                            {p.name} ({p.stock})
                          </span>
                        ))}

                        {loc.product && loc.product.length > 4 && <span className="text-xs text-muted-foreground">+{loc.product.length - 4} more</span>}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}

      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Storage Location Detail</DialogTitle>
            <DialogDescription>Detailed list of products stored in this storage location</DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="py-12 text-center text-muted-foreground">Loading storage details...</div>
          ) : (
            <>
              <div className="my-2 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {selectedLocation?.code} – {selectedLocation?.name}
                </h2>
                <Badge variant="secondary">{selectedLocation?.product?.length ?? 0} Items</Badge>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {selectedLocation?.product?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell className="text-right font-semibold">{item.stock}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(item.updatedAt ?? item.createdAt ?? new Date())}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(!selectedLocation?.product || selectedLocation.product.length === 0) && <div className="py-8 text-center text-sm text-muted-foreground">No products stored in this location</div>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
