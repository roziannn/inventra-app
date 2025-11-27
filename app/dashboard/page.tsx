"use client";

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, ArrowDownToLine, ArrowUpFromLine, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ResponsiveContainer } from "recharts";

const inboundOutboundData = [
  { name: "Jan", inbound: 120, outbound: 75 },
  { name: "Feb", inbound: 140, outbound: 105 },
  { name: "Mar", inbound: 160, outbound: 85 },
  { name: "Apr", inbound: 200, outbound: 110 },
  { name: "May", inbound: 180, outbound: 95 },
  { name: "Jun", inbound: 150, outbound: 130 },
];

const stockTrendData = [
  { name: "Week 1", stock: 400 },
  { name: "Week 2", stock: 380 },
  { name: "Week 3", stock: 420 },
  { name: "Week 4", stock: 450 },
];

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Warehouse overview, stock activities, and notifications</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4 grid-cols-2">
        <Card className="py-4 shadow border-none">
          <CardContent className="flex items-center space-x-4 pt-1">
            <div className="bg-gray-100 rounded-full p-3 flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <h2 className="text-xl font-bold">1,240</h2>
              <p className="text-xs text-green-600">+12 today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 shadow border-none">
          <CardContent className="flex items-center space-x-4 pt-1">
            <div className="bg-gray-100 rounded-full p-3 flex items-center justify-center">
              <ArrowDownToLine className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inbound</p>
              <h2 className="text-xl font-bold">320</h2>
              <p className="text-xs text-green-600">+25 today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 shadow border-none">
          <CardContent className="flex items-center space-x-4 pt-1">
            <div className="bg-gray-100 rounded-full p-3 flex items-center justify-center">
              <ArrowUpFromLine className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Outbound</p>
              <h2 className="text-xl font-bold">280</h2>
              <p className="text-xs text-red-600">+18 today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 shadow border-none">
          <CardContent className="flex items-center space-x-4 pt-1">
            <div className="bg-gray-100 rounded-full p-3 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Alert</p>
              <h2 className="text-xl font-bold">12</h2>
              <p className="text-xs text-yellow-600">View item</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Inbound vs Outbound</CardTitle>
            <CardDescription>Monthly stock movement</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inboundOutboundData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={14} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="inbound" fill="#3b82f6" />
                <Bar dataKey="outbound" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Trend</CardTitle>
            <CardDescription>Last 4 weeks</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={14} />
                <YAxis />
                <Tooltip />
                <Line type="natural" dataKey="stock" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
