"use client";

import * as React from "react";
import { Frame, SquareTerminal, PieChart, Settings2, GalleryVerticalEnd, AudioWaveform, Command, Archive } from "lucide-react";

import { NavGeneral } from "@/components/nav-general";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
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

  navGeneral: [
    // Dashboard
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
      isActive: true,
      items: [
        { title: "Overview", url: "/dashboard" },
        { title: "Low Stock", url: "/dashboard/low-stock" },
      ],
    },

    // Master Data
    {
      title: "Master",
      url: "/master",
      icon: Archive,
      items: [
        { title: "Categories", url: "/master/categories" },
        { title: "Brands", url: "/master/brands" },
        // { title: "Units", url: "/master/units" },
        { title: "Suppliers", url: "/master/suppliers" },
        { title: "Storage Locations", url: "/master/storage-locations" },
      ],
    },

    // Products
    {
      title: "Products",
      url: "/products",
      icon: SquareTerminal,
      items: [
        { title: "All Products", url: "/products" },
        { title: "Add Product", url: "/products/add" },
        { title: "Stock Adjustment", url: "/products/adjustment" },
      ],
    },

    // Stock In
    {
      title: "Stock In",
      url: "/stock-in",
      icon: Frame,
      items: [
        { title: "Inbound List", url: "/stock-in" },
        { title: "Add Inbound", url: "/stock-in/add" },
      ],
    },

    // Stock Out
    {
      title: "Stock Out",
      url: "/stock-out",
      icon: GalleryVerticalEnd,
      items: [
        { title: "Outbound List", url: "/stock-out" },
        { title: "Add Outbound", url: "/stock-out/add" },
      ],
    },

    // Reports
    {
      title: "Reports",
      url: "/reports",
      icon: PieChart,
      items: [
        { title: "Stock Report", url: "/reports/stock" },
        { title: "Inbound Report", url: "/reports/inbound" },
        { title: "Outbound Report", url: "/reports/outbound" },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavGeneral items={data.navGeneral} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
