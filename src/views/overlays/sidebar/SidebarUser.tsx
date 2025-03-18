import {
  ChevronsUpDown,
  Languages,
  LaptopMinimal,
  LogIn,
  LogOut,
  Moon,
  Sun,
  Trash2,
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
import { useTheme } from "@/components/theme-provider.tsx";
import { useTranslation } from "react-i18next";
import { getInitials } from "@/lib/getInitials";
import useDeleteAllUserData from "@/hooks/api/useDeleteAllUserData";
import { ConfirmDeleteModal } from "@/views/overlays/sidebar/ConfirmDeleteModal";
import { useContext, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/services/UserContextService";
import { AuthContext } from "react-oauth2-code-pkce";
import { useNavigate } from "react-router";
import { LanguageLabels } from "@/locales/Languages.ts";

export function SidebarUser() {
  const { t, i18n } = useTranslation();
  const { isMobile } = useSidebar();
  const { rawTheme, setTheme } = useTheme();
  const { deleteAllUserData, error } = useDeleteAllUserData();
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] =
    useState<boolean>(false);
  const { toast } = useToast();
  const { user } = useUserContext();
  const navigate = useNavigate();
  const { token, logOut } = useContext(AuthContext);

  const loggedIn = token.length > 0;

  const username = user?.name ?? user?.username ?? t("user.anonymous");
  const name = user?.name ?? username;
  const userRole = getUserRole(user?.roles);
  const changeLanguageHandler = (lang: string) => {
    void i18n.changeLanguage(lang);
  };

  const deleteUserAndLogout = async () => {
    await deleteAllUserData();
    setIsDeleteUserDialogOpen(false);
    if (error === null) logOut();
  };

  const login = () => {
    void navigate("/login");
  };

  const deleteUserAbort = () => {
    toast({
      variant: "default",
      title: t("sidebar.deleteUserData.abortTitle"),
      description: t("sidebar.deleteUserData.abortDescription"),
    });
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
                  {userRole !== null && (
                    <span className="truncate text-xs">
                      {t(`role.${userRole}`)}
                    </span>
                  )}
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
                className={rawTheme === "light" ? "bg-secondary" : ""}
              >
                <Sun className="mr-2 h-4 w-4" />
                {t("sidebar.theme.light")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTheme("dark");
                }}
                className={rawTheme === "dark" ? "bg-secondary" : ""}
              >
                <Moon className="mr-2 h-4 w-4" />
                {t("sidebar.theme.dark")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setTheme("system");
                }}
                className={rawTheme === "system" ? "bg-secondary" : ""}
              >
                <LaptopMinimal className="mr-2 h-4 w-4" />
                {t("sidebar.theme.system")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {/* Language Selection*/}
            <DropdownMenuGroup>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem>
                    <Languages />
                    {t("sidebar.language")}:{" "}
                    {LanguageLabels.get(
                      i18n.language.toLowerCase().split("-")[0],
                    )}
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start">
                  {Array.from(LanguageLabels.keys()).map((lang) => (
                    <DropdownMenuItem
                      key={lang}
                      onClick={() => {
                        changeLanguageHandler(lang);
                      }}
                    >
                      {LanguageLabels.get(lang)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {/* Login*/}
            <DropdownMenuGroup>
              {loggedIn && (
                <DropdownMenuItem
                  onClick={() => {
                    setIsDeleteUserDialogOpen(true);
                  }}
                >
                  <Trash2 />
                  {t("sidebar.deleteUserData.button")}
                </DropdownMenuItem>
              )}
              {loggedIn ? (
                <DropdownMenuItem
                  onClick={() => {
                    logOut();
                  }}
                >
                  <LogOut />
                  {t("sidebar.logout")}
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={login}>
                  <LogIn />
                  {t("sidebar.login")}
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <ConfirmDeleteModal
        isOpen={isDeleteUserDialogOpen}
        onConfirm={() => {
          void deleteUserAndLogout();
        }}
        onClose={() => {
          setIsDeleteUserDialogOpen(false);
        }}
        onAbort={deleteUserAbort}
      />
    </SidebarMenu>
  );
}

const getUserRole = (roles: string[] | undefined): string | null => {
  if (!roles) {
    return null;
  }
  if (roles.includes("admin")) {
    return "admin";
  }
  return "user";
};
