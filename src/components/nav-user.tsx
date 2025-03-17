"use client"

import {
  ChevronsUpDown,
  LaptopMinimal,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useTheme } from "./theme-provider"
import { UserInfoDTO } from "@/api"
import { useTranslation } from "react-i18next"


interface NavUserProps {
  user: UserInfoDTO;
  logout: () => void;
}



export function NavUser({ user, logout }: Readonly<NavUserProps>) {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const { setTheme } = useTheme();
  const username = (user.name ?? user.username ?? "Anonymous");
  const userRole = getUserRole(user.roles);


  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{getInitials(username)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{username}</span>
                <span className="truncate text-xs">{userRole}</span> 
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">{getInitials(username)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{username}</span>
                  <span className="truncate text-xs">{userRole}</span> 
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light Mode
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark Mode
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <LaptopMinimal className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut onClick={logout} />
              {t("sidebar.logout")} 
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}


const getInitials = (name: string): string => {
  if ("Anonymous" === name) {
    return "AN"
  }

  return name.split(" ").map((n) => n[0]).join("").toLocaleUpperCase();
}

const getUserRole = (roles: string[] | undefined): string => {
  if (!roles) {
    return "";
  }
  roles.forEach(role => {
    if (role.toLowerCase() === "admin") {
      return "Admin";
    }
  });
  return "User";
}