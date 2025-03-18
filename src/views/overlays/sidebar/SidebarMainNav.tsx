import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useCurrentPage from "@/hooks/useCurrentPage";
import { navigateToSession } from "@/lib/navigateToSession";
import { useGetSessions } from "@/services/GetSessionsService";
import { useUserContext } from "@/services/UserContextService";
import { t } from "i18next";
import { Bot, HardDriveUpload } from "lucide-react";
import { useNavigate } from "react-router";

export default function SidebarMainNav() {
  const activePage = useCurrentPage();
  const { open } = useSidebar();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { activeSessionId } = useGetSessions();

  return (
    <SidebarGroup className="pt-4">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            onClick={() => {
              navigateToSession(activeSessionId, navigate);
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
                void navigate("/knowledge", { replace: true });
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
