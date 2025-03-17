import {
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar"
import { useLogo } from '@/hooks/useLogo';


export function SidebarHeader() {
  const { open } = useSidebar();
  const logoSrc = useLogo();

  return (
    <SidebarMenu>
      <a href="/" className="w-230 relative">
        <img 
          src={logoSrc}  
          alt="Logo" 
          className={`absolute top-0 left-0 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        <img 
          src="/favicon.svg" 
          alt="Logo Favicon" 
          className={`absolute top-0 left-0 transition-opacity duration-300 ${!open ? 'opacity-100' : 'opacity-0'}`}
          style={{maxHeight: 32}}
        />
      </a>
    </SidebarMenu>
  )
}
