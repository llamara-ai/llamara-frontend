import {
  Sidebar,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar.tsx";
import { ReactNode } from "react";

interface OverlayProps {
  sideBarContent: ReactNode;
  children: ReactNode;
  footerChildren?: ReactNode;
}

const sidebarTemplate: React.FC<OverlayProps> = ({
  sideBarContent,
  children,
  footerChildren,
}) => {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        {sideBarContent}
        <SidebarFooter>{footerChildren}</SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default sidebarTemplate;
