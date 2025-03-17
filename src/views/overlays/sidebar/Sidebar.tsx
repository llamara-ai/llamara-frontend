import { ReactNode } from "react";
import { useUserContext } from "@/services/UserContextService.tsx";
import SidebarContent from "./SidebarContent";
import { SidebarUser } from "@/views/overlays/sidebar/SidebarUser";
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
        <SidebarContent />
        <SidebarFooter>
          <SidebarUser />
        </SidebarFooter>
        <SidebarRail />
      </RootSidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  );
};

export default Sidebar;
