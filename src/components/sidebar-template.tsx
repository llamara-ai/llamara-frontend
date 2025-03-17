import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar.tsx"
import { ReactNode } from "react";
import { UserInfoDTO } from "@/api";

interface OverlayProps {
  sideBarContent: ReactNode;
  children: ReactNode;
}


interface SidebarProps {
  userInfo: UserInfoDTO;
  logout: () => void;
}



const sidebarTemplate: React.FC<OverlayProps & SidebarProps> = ({ sideBarContent, children, userInfo, logout }) => {  
  return (
      <SidebarProvider>
        <Sidebar collapsible="icon" >
          {sideBarContent}
        <SidebarFooter>
          <NavUser user={userInfo} logout={logout}/>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
          {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default sidebarTemplate;

