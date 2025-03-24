import { ReactNode } from "react";
import { useUserContext } from "@/services/UserContextService.tsx";
import SidebarHeader from "@/views/overlays/sidebar/SidebarHeader";
import SidebarContent from "@/views/overlays/sidebar/SidebarContent";
import SidebarUser from "@/views/overlays/sidebar/SidebarUser";
import {
  Sidebar as RootSidebar,
  SidebarFooter,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar.tsx";

interface SidebarProps {
  children: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
}: Readonly<SidebarProps>) => {
  const { user } = useUserContext();

  if (!user) {
    return null;
  }

  return (
    <>
      <RootSidebar collapsible="icon">
        <SidebarHeader />
        <SidebarContent />
        <SidebarFooter
          style={{
            marginLeft: "env(safe-area-inset-left, 0)",
            marginBottom: "env(safe-area-inset-bottom, 0.25rem)",
          }}
        >
          <SidebarUser />
        </SidebarFooter>
        <SidebarRail />
      </RootSidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  );
};

export default Sidebar;
