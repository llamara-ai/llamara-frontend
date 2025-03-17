import { ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatModelContainer } from "@/api";
import { t } from "i18next";
import { useLogo } from "@/hooks/useLogo";
import { getLogoFromModelProvider } from "@/lib/getLogoFromModelProvider";

export interface SidebarModelSelectorProps {
  models: ChatModelContainer[];
  selectedModel?: ChatModelContainer | null;
  setActiveModel: (model: ChatModelContainer) => void;
}

export function SidebarModelSelector({
  models,
  selectedModel,
  setActiveModel,
}: Readonly<SidebarModelSelectorProps>) {
  const { isMobile, open } = useSidebar();
  const logoSrc = useLogo();

  const onClickSelectModel = (model: ChatModelContainer) => {
    setActiveModel(model);
  };

  return (
    <SidebarMenu>
      <a href="/" className="w-230 relative">
        <img
          src={logoSrc}
          alt="Logo"
          className={`absolute top-0 left-0 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        <img
          src="/favicon.svg"
          alt="Logo Favicon"
          className={`absolute top-0 left-0 transition-opacity duration-300 ${!open ? "opacity-100" : "opacity-0"}`}
          style={{ maxHeight: 32 }}
        />
      </a>
      <SidebarMenuItem
        className={`transition-all duration-500 ${open ? "mt-20" : "mt-10"}`}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {selectedModel && (
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-black text-white">
                  <img
                    src={getLogoFromModelProvider(selectedModel.provider)}
                    alt={selectedModel.label}
                    className="w-6 h-6 invert"
                  />
                </div>
              )}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold inline-block">
                  {selectedModel ? (
                    <>{selectedModel.label}</>
                  ) : (
                    <>
                      {open ? (
                        t("sidebar.session.modelSelectionInstruction")
                      ) : (
                        <div className="text-center">?</div>
                      )}
                    </>
                  )}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t("sidebar.session.modelSelectionInstruction")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {models.map((model) => (
              <Tooltip key={model.uid}>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    key={model.uid}
                    onClick={() => {
                      onClickSelectModel(model);
                    }}
                    className="gap-2 p-2"
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm bg-black">
                      <img
                        src={
                          model.provider &&
                          getLogoFromModelProvider(model.provider)
                        }
                        alt={model.label}
                        className="w-5 h-5 invert"
                      />
                    </div>
                    {model.label}
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>
                  {model.description ? (
                    <span>{model.description}</span>
                  ) : (
                    <span>{model.label}</span>
                  )}
                </TooltipContent>
              </Tooltip>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
