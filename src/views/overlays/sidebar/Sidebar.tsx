import SidebarTemplate from "@/components/sidebar-template";
import { ReactNode } from "react";
import { useUserContext } from "@/services/UserContextService.tsx";
import SidebarContent from "./SidebarContent";
import { SidebarUser } from "@/views/overlays/sidebar/SidebarUser";

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
    <SidebarTemplate
      sideBarContent={<SidebarContent />}
      footerChildren={<SidebarUser />}
    >
      {children}
    </SidebarTemplate>
  );
};

export default Sidebar;
