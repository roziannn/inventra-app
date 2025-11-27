"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type StorageItem = {
  id: string;
  productName: string;
  qty: number;
  updatedAt: string;
};

type StorageLocation = {
  id: string;
  locationCode: string;
  maxCapacity: number;
  usedCapacity: number;
  items: StorageItem[];
};

type StorageZone = {
  id: string;
  name: string;
  locations: StorageLocation[];
};

export default function ManageStoragePage() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | null>(null);

  // Dummy Data
  const zones: StorageZone[] = [
    {
      id: "zoneA",
      name: "Zone A",
      locations: Array.from({ length: 8 }).map((_, idx) => ({
        id: `A-${idx + 1}`,
        locationCode: `A-${idx + 1}`,
        maxCapacity: 100,
        usedCapacity: Math.floor(Math.random() * 120),
        items: Array.from({ length: 3 }).map((__, i) => ({
          id: `item-${idx}-${i}`,
          productName: `Product ${i + 1}`,
          qty: Math.floor(Math.random() * 30),
          updatedAt: new Date().toISOString(),
        })),
      })),
    },
    {
      id: "zoneB",
      name: "Zone B",
      locations: Array.from({ length: 6 }).map((_, idx) => ({
        id: `B-${idx + 1}`,
        locationCode: `B-${idx + 1}`,
        maxCapacity: 80,
        usedCapacity: Math.floor(Math.random() * 90),
        items: Array.from({ length: 2 }).map((__, i) => ({
          id: `itemB-${idx}-${i}`,
          productName: `Item ${i + 1}`,
          qty: Math.floor(Math.random() * 20),
          updatedAt: new Date().toISOString(),
        })),
      })),
    },
  ];

  const storageLocations = zones.find((z) => z.id === selectedZone)?.locations || [];

  const handleViewLocation = (loc: StorageLocation) => {
    setSelectedLocation(loc);
    setOpenDetail(true);
  };

  return (
    <div className="p-6">
      <div>
        <h1 className="text-xl font-bold">Manage Storage</h1>
        <p className="text-sm text-muted-foreground">Manage your product storage zone catalog here</p>
      </div>
      {/* Zone Selector */}
      <div className="my-6 max-w-sm">
        <Select onValueChange={setSelectedZone}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Zone..." />
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

      {/* Storage Map */}
      {selectedZone && (
        <>
          <h2 className="font-semibold mb-2">Zone: {zones.find((z) => z.id === selectedZone)?.name}</h2>
          <div className="grid grid-cols-4 gap-4">
            {storageLocations.map((loc) => {
              const usedPercent = Math.round((loc.usedCapacity / loc.maxCapacity) * 100);

              return (
                <div key={loc.id} className="border p-3 flex flex-col justify-between items-center shadow-sm rounded-md">
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className="font-semibold">{loc.locationCode}</span>
                    <Badge variant={usedPercent < 50 ? "success" : usedPercent < 80 ? "warning" : "destructive"}>{usedPercent}%</Badge>
                  </div>
                  <Progress value={usedPercent} className="w-full h-3 mb-2" />
                  <div className="text-sm text-gray-600 mb-2">
                    {loc.usedCapacity} / {loc.maxCapacity}
                  </div>

                  {/* Stackable pallet visualization */}
                  <div className="flex flex-wrap gap-1 justify-center w-full">
                    {loc.items.map((item) => (
                      <div key={item.id} title={`${item.productName}: ${item.qty}`} className="bg-blue-400 text-white text-xs px-1 py-0.5 rounded">
                        {item.productName} ({item.qty})
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => handleViewLocation(loc)}>
                    View Details
                  </Button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Storage Location Detail Modal */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>Storage Location: {selectedLocation?.locationCode}</DialogTitle>
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
              {selectedLocation?.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{new Date(item.updatedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}
