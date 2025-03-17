import { SidebarUser } from "@/components/sidebar-user";
import {
  Sidebar,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar.tsx";
import { ReactNode } from "react";
import { UserInfoDTO } from "@/api";

interface OverlayProps {
  sideBarContent: ReactNode;
  children: ReactNode;
}

interface SidebarProps {
  userInfo: UserInfoDTO;
  loggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const sidebarTemplate: React.FC<OverlayProps & SidebarProps> = ({
  sideBarContent,
  children,
  userInfo,
  loggedIn,
  login,
  logout,
}) => {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {sideBarContent}
        <SidebarFooter>
          <SidebarUser
            user={userInfo}
            loggedIn={loggedIn}
            login={login}
            logout={logout}
          />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default sidebarTemplate;
