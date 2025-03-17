import SidebarTemplate from "@/components/sidebar-template";
import useLoginApi from "@/hooks/api/useLoginApi";
import { ReactNode} from "react"

interface SidebarProps {
    sideBarContent: ReactNode;
    children: ReactNode;
  }
  

//TODO: Implement logout
const Sidebar : React.FC<SidebarProps> = ({sideBarContent, children}) => {    
    const {userInfo} = useLoginApi();

    if (!userInfo) {
        return null;
    }

    return (    
        <SidebarTemplate userInfo={userInfo} 
                logout={() => {console.log("logout")}} 
                sideBarContent={sideBarContent}
        >
            {children}
        </SidebarTemplate>
    )
}

export default Sidebar;