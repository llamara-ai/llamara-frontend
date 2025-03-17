import SidebarTemplate from "@/components/sidebar-template";
import { ReactNode, useContext } from 'react'
import { AuthContext } from 'react-oauth2-code-pkce'
import { useUserContext } from '@/services/UserContextService.tsx'

interface SidebarProps {
  sideBarContent: ReactNode;
  children: ReactNode;
}

// TODO: Logout not working properly
const Sidebar : React.FC<SidebarProps> = ({sideBarContent, children}) => {
    const { user } = useUserContext();

    const { logOut } = useContext(AuthContext);

    if (!user) {
        return null;
    }

    return (
        <SidebarTemplate userInfo={user}
                logout={() => {
                    console.log('Logging out');
                    logOut();
                }}
                sideBarContent={sideBarContent}
        >
            {children}
        </SidebarTemplate>
    )
}

export default Sidebar;
