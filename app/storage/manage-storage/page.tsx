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
  <h1>test</h1>;
}
