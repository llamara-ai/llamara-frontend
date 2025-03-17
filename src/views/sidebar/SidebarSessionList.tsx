"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

export interface SingleNavItem {
  title: string;
  uid: string;
}
export interface NavMainGroup {
  title: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: SingleNavItem[];
}

export interface NavMainProps {
  title: string;
  items: NavMainGroup[];
  setOnClick: (uid: string, label: string) => void;
}

export function SidebarSessionList({
  title,
  items,
  setOnClick,
}: Readonly<NavMainProps>) {
  const { open } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu
        className={`top-0 left-0 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      >
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive ? item.isActive : true}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.uid + item.title}>
                      <SidebarMenuSubButton asChild>
                        <button
                          className="w-full"
                          onClick={() => {
                            setOnClick(subItem.uid, subItem.title);
                          }}
                        >
                          <span>{subItem.title}</span>
                        </button>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
