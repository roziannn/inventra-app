"use client";

import * as React from "react";
import { SquareTerminal, GalleryVerticalEnd, AudioWaveform, Command, Archive, Container, ChartPie } from "lucide-react";

import { NavGeneral } from "@/components/nav-general";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { NavSingle } from "@/components/nav-single-item";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    // avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],

  navSingle: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: ChartPie,
    },
  ],

  navGeneral: [
    // Master Data
    {
      title: "Master",
      url: "/master",
      icon: Archive,
      items: [
        { title: "Brands", url: "/master/brands" },
        { title: "Categories", url: "/master/categories" },
        { title: "Suppliers", url: "/master/suppliers" },
        { title: "Storage Locations", url: "/master/storage-locations" },
        { title: "Zone", url: "/master/zone" },
      ],
    },

    // Products
    {
      title: "Products",
      url: "/products",
      icon: SquareTerminal,
      items: [
        { title: "All Products", url: "/products" },
        // { title: "Add Product", url: "/products/add" },
        { title: "Inbound", url: "/products/inbound" },
        { title: "Outbound", url: "/products/outbound" },
        { title: "Stock Adjustment", url: "/stock-adjustment" },
        // { title: "Manage Storage", url: "/products/manage-storage" },
      ],
    },

    // Stock In
    {
      title: "Storage",
      url: "/stock-in",
      icon: Container,
      items: [
        { title: "Manage Storage", url: "/storage/manage-storage" },
        // { title: "Add Inbound", url: "/stock-in/add" },
      ],
    },

    // Stock Out
    // {
    //   title: "Stock Out",
    //   url: "/stock-out",
    //   icon: GalleryVerticalEnd,
    //   items: [
    //     { title: "Outbound List", url: "/stock-out" },
    //     { title: "Add Outbound", url: "/stock-out/add" },
    //   ],
    // },

    // Reports
    // {
    //   title: "Reports",
    //   url: "/reports",
    //   icon: PieChart,
    //   items: [
    //     { title: "Stock Report", url: "/reports/stock" },
    //     { title: "Inbound Report", url: "/reports/inbound" },
    //     { title: "Outbound Report", url: "/reports/outbound" },
    //   ],
    // },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavSingle items={data.navSingle} />
        <NavGeneral items={data.navGeneral} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
