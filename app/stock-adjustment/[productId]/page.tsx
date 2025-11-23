"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { stockAdjustmentService } from "@/services/stock-adjustment.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { productService } from "@/services/product.service";
import { Product } from "@/types/product";
import { formatDate } from "@/helper/formatDate";

export default function StockMovementPage() {
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

  const adjustMutation = useMutation({
    mutationFn: () =>
      stockAdjustmentService.create({
        productId,
        oldQty: product?.stock ?? 0,
        newQty: adjustData.type === "Increase" ? (product?.stock ?? 0) + adjustData.quantity : (product?.stock ?? 0) - adjustData.quantity,
        difference: adjustData.type === "Increase" ? adjustData.quantity : -adjustData.quantity,
        reason: adjustData.reason,
        createdBy: "system",
        createdAt: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      router.push("/stock-adjustment");
    },
  });

  const dummyAdjustments = [
    {
      id: 1,
      type: "Increase",
      quantity: 10,
      oldQty: 50,
      newQty: 60,
      reason: "Stock Opname",
      note: "Initial count correction",
      createdBy: "admin",
      createdAt: "2025-11-22 10:30",
    },
    {
      id: 2,
      type: "Decrease",
      quantity: 5,
      oldQty: 60,
      newQty: 55,
      reason: "Damage",
      note: "Broken items",
      createdBy: "staff1",
      createdAt: "2025-11-22 14:20",
    },
    {
      id: 3,
      type: "Decrease",
      quantity: 5,
      oldQty: 60,
      newQty: 55,
      reason: "Damage",
      note: "Broken items",
      createdBy: "staff1",
      createdAt: "2025-11-22 14:20",
    },
    {
      id: 4,
      type: "Decrease",
      quantity: 5,
      oldQty: 60,
      newQty: 55,
      reason: "Damage",
      note: "Broken items",
      createdBy: "staff1",
      createdAt: "2025-11-22 14:20",
    },
    {
      id: 5,
      type: "Decrease",
      quantity: 5,
      oldQty: 60,
      newQty: 55,
      reason: "Damage",
      note: "Broken items",
      createdBy: "staff1",
      createdAt: "2025-11-22 14:20",
    },
  ];

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="p-6">
      {product && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Product Info */}
            <Card className="shadow-sm md:col-span-2">
              <CardContent className="bg-muted/30 rounded-md text-sm grid grid-cols-2 gap-4 py-1">
                <div className="flex flex-col">
                  <strong>Product Name</strong>
                  <span>{product.name}</span>
                </div>

                <div className="flex flex-col">
                  <strong>Category</strong>
                  <span>{product.productCategory?.name}</span>
                </div>

                <div className="flex flex-col">
                  <strong>Supplier</strong>
                  <span>{product.supplier?.name}</span>
                </div>

                <div className="flex flex-col">
                  <strong>Condition</strong>
                  <span>{product.condition}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border flex items-center justify-center">
              <CardContent className="text-center p-6">
                <p className="text-sm font-bold pb-1">Current Stock</p>
                <p className="text-4xl font-extrabold">{product.stock}</p>
              </CardContent>
            </Card>
          </div>

          {/* Stock Chart */}
          {/* <Card className="shadow-sm mt-2">
            <CardHeader>
              <CardTitle className="text-md">Stock Movement Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={dummyAdjustments.map((item) => ({
                    date: item.createdAt.split(" ")[0],
                    stock: item.newQty,
                  }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="stock" stroke="#8884d8" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card> */}

          {/* Adjustment Form */}
          <Card className="mt-4 border-dashed border-2 shadow-none">
            <CardContent className="px-6">
              <h3 className="text-md font-semibold mb-4"> Adjustment Form</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Input
                    type="number"
                    value={adjustData.quantity}
                    onChange={(e) =>
                      setAdjustData({
                        ...adjustData,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <Label>Note</Label>
                  <Input value={adjustData.note} onChange={(e) => setAdjustData({ ...adjustData, note: e.target.value })} placeholder="Optional note" />
                </div>
              </div>

              {/* New Stock Preview & Submit */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start mt-6">
                <div className="bg-indigo-100/50 p-3 rounded text-sm md:col-span-2">
                  New Stock: <strong>{adjustData.type === "Increase" ? product.stock + adjustData.quantity : product.stock - adjustData.quantity}</strong>
                </div>
                <Button className="w-full" onClick={() => adjustMutation.mutate()} disabled={adjustMutation.isPending}>
                  {adjustMutation.isPending ? "Processing..." : "Confirm Adjustment"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stock Movement Log */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-3">Stock Movement Log</h2>
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
                {dummyAdjustments.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell>{item.type}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-center">{item.oldQty}</TableCell>
                    <TableCell className="text-center">
                      <strong>{item.newQty}</strong>
                    </TableCell>
                    <TableCell>{item.reason}</TableCell>
                    <TableCell>{item.note}</TableCell>
                    <TableCell>{item.createdBy}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
