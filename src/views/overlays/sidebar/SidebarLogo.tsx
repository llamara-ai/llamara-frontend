import { SidebarMenu, useSidebar } from "@/components/ui/sidebar";
import { useLogo } from "@/hooks/useLogo";
import { cn } from "@/lib/utils.ts";

export interface SidebarLogoProps {
  className?: string;
}

export function SidebarLogo({ className }: Readonly<SidebarLogoProps>) {
  const { open } = useSidebar();
  const logoSrc = useLogo();

  return (
    <SidebarMenu>
      <a
        href="/"
        className={cn(
          `relative w-full transition-all duration-500 ${open ? "h-[68px]" : "h-8"}`,
          className,
        )}
      >
        <img
          src={logoSrc}
          alt="Logo"
          className={`absolute top-0 left-0 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <img
          src="/favicon.svg"
          alt="Logo Favicon"
          className={`absolute top-0 left-0 transition-opacity w-[32px] duration-300 ${!open ? "opacity-100" : "opacity-0"}`}
        />
      </a>
    </SidebarMenu>
  );
}
