import SidebarTemplate from "@/components/sidebar-template";
import { ReactNode, useContext } from "react";
import { AuthContext } from "react-oauth2-code-pkce";
import { useUserContext } from "@/services/UserContextService.tsx";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  sideBarContent: ReactNode;
  children: ReactNode;
}

// TODO: Logout not working properly
const Sidebar: React.FC<SidebarProps> = ({
  sideBarContent,
  children,
}: Readonly<SidebarProps>) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { token, logOut } = useContext(AuthContext);

  const loggedIn = token.length > 0

  if (!user) {
    return null;
  }

  return (
    <SidebarTemplate
      userInfo={user}
      loggedIn={loggedIn}
      login={() => {
        void navigate('/login')
      }}
      logout={() => {
        console.log("Logging out");
        logOut();
      }}
      sideBarContent={sideBarContent}
    >
      {children}
    </SidebarTemplate>
  );
};

export default Sidebar;
