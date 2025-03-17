import { SidebarUser } from "@/components/sidebar-user";
import {
  Sidebar,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar.tsx";
import { ReactNode } from "react";
import { UserInfoDto } from "@/api";

interface OverlayProps {
  sideBarContent: ReactNode;
  children: ReactNode;
  footerChildren?: ReactNode;
}

interface SidebarProps {
  userInfo: UserInfoDto;
  loggedIn: boolean;
  login: () => void;
  logout: () => void;
}

const sidebarTemplate: React.FC<OverlayProps & SidebarProps> = ({
  sideBarContent,
  children,
  footerChildren,
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
          {footerChildren}
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
