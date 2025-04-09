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
import { getLogoFromModelProvider } from "@/lib/getLogoFromModelProvider";
import { useEffect } from "react";

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

  // If there is only one model, select it by default
  useEffect(() => {
    if (models.length === 1) {
      setActiveModel(models[0]);
    }
  }, [models]);

  const onClickSelectModel = (model: ChatModelContainer) => {
    setActiveModel(model);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem className={`transition-all duration-500`}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground p-2"
            >
              {selectedModel && (
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg dark:text-white">
                  <img
                    src={getLogoFromModelProvider(selectedModel.provider)}
                    alt={selectedModel.label}
                    className="w-6 h-6 dark:invert"
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
                        <div className="ml-2">
                          {t("sidebar.session.modelSelectionInstruction")}
                        </div>
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
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
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
                    className={`gap-2 p-2 ${selectedModel && model.uid === selectedModel.uid ? "bg-secondary" : ""}`}
                  >
                    <div className="flex size-6 items-center justify-center rounded-sm">
                      <img
                        src={
                          model.provider &&
                          getLogoFromModelProvider(model.provider)
                        }
                        alt={model.label}
                        className="w-5 h-5 dark:invert"
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
