import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useCurrentPage from "@/hooks/useCurrentPage";
import { useUserContext } from "@/services/UserContextService";
import { t } from "i18next";
import { Bot, HardDriveUpload } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SidebarMainNav() {
  const activePage = useCurrentPage();
  const { open } = useSidebar();
  const navigate = useNavigate();
  const { user } = useUserContext();

  return (
    <SidebarGroup className="pt-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => {
              void navigate("/");
            }}
            className={activePage === "chatbot" ? "bg-secondary" : ""}
          >
            <Bot />
            {open && t("sidebar.chatbot")}
          </SidebarMenuButton>
        </SidebarMenuItem>
        {!user?.anonymous && (
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                void navigate("/knowledge");
              }}
              className={activePage === "knowledge" ? "bg-secondary" : ""}
            >
              <HardDriveUpload />
              {open && t("sidebar.knowledge")}
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
