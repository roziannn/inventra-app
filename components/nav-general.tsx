"use client";

import { ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { type LucideIcon } from "lucide-react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";
import Link from "next/link";

export interface NavChild {
  title: string;
  url: string;
}

export interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  items?: NavChild[];
}

export function NavGeneral({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>General</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.url || item.items?.some((child) => pathname === child.url);

          return (
            <Collapsible key={item.title} asChild defaultOpen={isActive} className="group/collapsible">
              <SidebarMenuItem>
                {/* PARENT */}
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title} className={isActive ? "bg-primary text-white" : "text-muted-foreground"}>
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.title}</span>

                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>

                {/* CHILDREN */}
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((child) => {
                      const isChildActive = pathname === child.url;

                      return (
                        <SidebarMenuSubItem key={child.title}>
                          <SidebarMenuSubButton asChild className={isChildActive ? "bg-primary/20 text-black" : "text-muted-foreground"}>
                            <Link href={child.url}>{child.title}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
