"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { stockAdjustmentService } from "@/services/stock-adjustment.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { formatDate } from "@/helper/formatDate";
import { AlertCircle, CalendarDays, CheckCircle, TrendingDown, TrendingUp, Warehouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function StockMovementPage() {
  const [selectedMonth, setSelectedMonth] = useState("");

  const router = useRouter();
  const params = useParams();
  const productId = params.productId as string;
  const queryClient = useQueryClient();

  const [adjustData, setAdjustData] = useState({
    type: "Increase",
    quantity: 0,
    reason: "",
    note: "",
  });

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["product", productId],
    queryFn: () => productService.getById(productId),
    enabled: !!productId,
  });
  const { data: stockMovements, isLoading: isStockLoading } = useQuery({
    queryKey: ["stock-movement", productId],
    queryFn: () => stockAdjustmentService.getByProductId(productId),
    enabled: !!productId,
  });

  const adjustMutation = useMutation({
    mutationFn: () =>
      stockAdjustmentService.create({
        productId,
        type: adjustData.type,
        reason: adjustData.reason,
        quantity: adjustData.quantity,
        note: adjustData.note,
        createdBy: "system",
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["stock-movement", productId] });
    },
  });

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    // dst
  ];
  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="px-6">
      {product && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Product Info */}
            <Card className="shadow-sm md:col-span-2 h-full gap-2">
              <CardHeader>
                <CardTitle className="text-md font-semibold">Product Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-y-3 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Product Name</p>
                  <p>{product.name}</p>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Category</p>
                  <p>{product.category?.name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Storage Location</p>
                  <p>{product.storagelocation?.name}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Unit</p>
                  <p>{product.unit}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Supplier</p>
                  <p>{product.supplier?.name}</p>
                </div>

                <div>
                  <p className="font-medium text-muted-foreground">Condition</p>
                  <p>{product.condition}</p>
                </div>
              </CardContent>
            </Card>

            {/* Current Stock */}
            <Card className="shadow-sm border h-full flex flex-col gap-2 justify-between">
              <CardHeader className="text-center">
                <CardTitle className="text-md font-semibold">Product Stock</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col items-center justify-center text-center text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Current</p>
                  <p className="text-4xl font-extrabold">{product.stock}</p>
                </div>
                {product.stock && (
                  <Badge variant={product.stock < product.stock ? "destructive" : "default"} className="mt-3 flex items-center justify-center gap-1 text-xs px-3 py-1">
                    {product.stock < product.stock ? (
                      <>
                        <AlertCircle className="w-3 h-3" /> Stock menipis, pertimbangkan pengisian ulang
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3 h-3" /> Stock dalam batas aman
                      </>
                    )}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Adjustment Form */}
          <Card className="mt-4 border-dashed border-2 shadow-none">
            <CardContent className="px-6">
              <h3 className="text-md font-semibold mb-4"> Adjustment Form</h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={adjustData.type} onValueChange={(val) => setAdjustData({ ...adjustData, type: val })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Increase">Increase</SelectItem>
                      <SelectItem value="Decrease">Decrease</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Reason</Label>
                  <Select value={adjustData.reason} onValueChange={(val) => setAdjustData({ ...adjustData, reason: val })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stock Opname">Stock Opname</SelectItem>
                      <SelectItem value="Return">Return</SelectItem>
                      <SelectItem value="Manual Correction">Manual Correction</SelectItem>
                      <SelectItem value="Damage">Damage</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Quantity</Label>
                  <Input type="number" value={adjustData.quantity} onChange={(e) => setAdjustData({ ...adjustData, quantity: parseInt(e.target.value) || 0 })} />
                </div>

                <div>
                  <Label>Note</Label>
                  <Input value={adjustData.note} onChange={(e) => setAdjustData({ ...adjustData, note: e.target.value })} placeholder="Optional note" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start mt-6">
                <div className="bg-indigo-100/50 p-3 rounded text-sm md:col-span-3">
                  New Stock: <strong>{adjustData.type === "Increase" ? product.stock + adjustData.quantity : product.stock - adjustData.quantity}</strong>
                </div>

                <Button className="w-full" onClick={() => adjustMutation.mutate()} disabled={adjustMutation.isPending}>
                  {adjustMutation.isPending ? "Processing..." : "Confirm Adjustment"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stock Movement Log */}
          <div className="mt-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-md font-semibold">Stock Adjusment Log</h2>
              {/* Filter by Month */}
              <div className="flex items-center gap-2">
                <Label htmlFor="monthFilter" className="text-sm">
                  <CalendarDays size={14} /> Filter by Month:
                </Label>
                <Select value={selectedMonth} onValueChange={(val) => setSelectedMonth(val)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* <div className="flex items-center gap-2">
                <Button variant="outline">
                  <TrendingUp size={14} /> Trend Stock
                </Button>
              </div> */}
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Total Qty</TableHead>
                  <TableHead className="text-center">Old</TableHead>
                  <TableHead className="text-center">New</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isStockLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : stockMovements && stockMovements.length > 0 ? (
                  stockMovements.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="text-center">{item.difference}</TableCell>
                      <TableCell className="text-center">{item.oldQty}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-bold text-indigo-500">{item.newQty}</span>
                      </TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell>{item.note}</TableCell>
                      <TableCell>{item.createdBy}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      No stock adjustments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
