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
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarSession } from "./SidebarSession";
import { UseGetSessionsApiResponse } from "@/hooks/api/useGetSessionsApi";

export interface SessionSidebarItem {
  title: string;
  uid: string;
  formattedTimestamp: string;
  isNotAvailableMessage: boolean;
}
export interface SidebarSessionsGroup {
  title: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: SessionSidebarItem[];
}

export interface SidebarSessionListProps {
  title: string;
  items: SidebarSessionsGroup[];
  useSessionsApiInstance: UseGetSessionsApiResponse;
  setOnClick: (uid: string, label: string) => void;
}

export function SidebarSessionList({
  title,
  items,
  useSessionsApiInstance,
  setOnClick,
}: Readonly<SidebarSessionListProps>) {
  const { open } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu
        className={`top-0 left-0 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      >
        {items.map((item) => (
          <SessionGroup
            item={item}
            key={item.title}
            setOnClick={setOnClick}
            useSessionsApiInstance={useSessionsApiInstance}
          />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

interface SessionGroupProps {
  item: SidebarSessionsGroup;
  useSessionsApiInstance: UseGetSessionsApiResponse;
  setOnClick: (uid: string, label: string) => void;
}

const SessionGroup = ({
  item,
  useSessionsApiInstance,
  setOnClick,
}: SessionGroupProps) => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  // Reset selected session id when url is session parameter is not provided
  // otherwise set the selected session id
  const location = useLocation();
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get("session");
    if (sessionId === null) {
      setSelectedSessionId(null);
    } else {
      setSelectedSessionId(sessionId);
    }
  }, [location]);

  return (
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
              <SidebarSession
                subItem={subItem}
                setOnClick={(uid: string, label: string) => {
                  setOnClick(uid, label);
                  setSelectedSessionId(uid);
                }}
                key={subItem.uid + subItem.title}
                highlightSession={selectedSessionId === subItem.uid}
                useSessionsApiInstance={useSessionsApiInstance}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
};
