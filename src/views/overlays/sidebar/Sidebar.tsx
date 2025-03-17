import SidebarTemplate from "@/components/sidebar-template";
import { ReactNode, useContext } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { useUserContext } from "@/services/UserContextService.tsx";
import { useNavigate } from "react-router-dom";
import SidebarContent from "./SidebarContent";
import RedirectButton from "./RedirectButton";
import { SidebarUser } from "@/views/overlays/sidebar/SidebarUser";

interface SidebarProps {
  children: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({
  children,
}: Readonly<SidebarProps>) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { token, logOut } = useContext(AuthContext);

  const loggedIn = token.length > 0;

  if (!user) {
    return null;
  }

  return (
    <SidebarTemplate
      sideBarContent={<SidebarContent />}
      footerChildren={
        <>
          <RedirectButton />
          <SidebarUser
            user={user}
            loggedIn={loggedIn}
            login={() => {
              void navigate("/login");
            }}
            logout={() => {
              console.log("Logging out");
              logOut();
            }}
          />
        </>
      }
    >
      {children}
    </SidebarTemplate>
  );
};

export default Sidebar;
