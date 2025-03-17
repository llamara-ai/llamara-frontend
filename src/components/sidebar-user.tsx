"use client";

import {
  ChevronsUpDown,
  Languages,
  LaptopMinimal,
  LogIn,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useTheme } from "./theme-provider";
import { UserInfoDto } from "@/api";
import { useTranslation } from "react-i18next";
import { getInitials } from "@/lib/getInitials";
import i18next from "i18next";

interface SidebarUserProps {
  user: UserInfoDto;
  loggedIn: boolean;
  login: () => void;
  logout: () => void;
}

export function SidebarUser({
  user,
  loggedIn,
  login,
  logout,
}: Readonly<SidebarUserProps>) {
  const { t, i18n } = useTranslation();
  const { isMobile } = useSidebar();
  const { setTheme } = useTheme();
  const username = user.name ?? user.username ?? "Anonymous";
  const name = user.name ?? username;
  const userRole = getUserRole(user.roles);
  const changeLanguageHandler = (lang: string) => {
    void i18n.changeLanguage(lang);
  };

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
                <AvatarFallback className="rounded-lg">
                  {getInitials(username)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{name}</span>
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
            {/*Name Label*/}
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {getInitials(username)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs">{userRole}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {/* Theme selection*/}
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => {
                  setTheme("light");
                }}
              >
                <Sun className="mr-2 h-4 w-4" />
                Light Mode
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTheme("dark");
                }}
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark Mode
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTheme("system");
                }}
              >
                <LaptopMinimal className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {/* Language Selection*/}
            <DropdownMenuGroup>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem>
                    <Languages />
                    {t("sidebar.language")}: {i18next.language.toUpperCase()}
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  <DropdownMenuItem
                    onClick={() => {
                      changeLanguageHandler("en");
                    }}
                  >
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      changeLanguageHandler("de");
                    }}
                  >
                    Deutsch
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {/* Login*/}
            {loggedIn ? (
              <DropdownMenuItem onClick={logout}>
                <LogOut />
                {t("sidebar.logout")}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={login}>
                <LogIn />
                {t("sidebar.login")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

const getUserRole = (roles: string[] | undefined): string => {
  if (!roles) {
    return "";
  }
  roles.forEach((role) => {
    if (role.toLowerCase() === "admin") {
      return "Admin";
    }
  });
  return "User";
};
