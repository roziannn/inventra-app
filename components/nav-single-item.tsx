"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export interface NavSingleItem {
  title: string;
  url: string;
  icon?: LucideIcon;
}

export function NavSingle({ items }: { items: NavSingleItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>General</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url;

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title} className={isActive ? "bg-primary text-white" : "text-muted-foreground"}>
                <Link href={item.url} className="flex items-center gap-2">
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
