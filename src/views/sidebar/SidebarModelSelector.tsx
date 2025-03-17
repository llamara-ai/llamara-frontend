import { ChevronsUpDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
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

export interface SidebarModelSelectorProps {
  models: ChatModelContainer[];
  selectedModel?: ChatModelContainer | null;
  setActiveModel: (model: ChatModelContainer) => void;
}

export function SidebarModelSelector({
  models: modelsInput,
  selectedModel: selectedModelInput,
  setActiveModel,
}: Readonly<SidebarModelSelectorProps>) {
  const { isMobile, open } = useSidebar();
  const logoSrc = useLogo();

  /* TODO: Remove this part if backend implement to give type over rest endpoint */
  const models = addModelLogo(modelsInput);
  let selectedModel = undefined;
  if (selectedModelInput) {
    selectedModel = addModelLogo([selectedModelInput])[0];
  }

  /* ------------------ */

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
                    src={selectedModel.logo}
                    alt={selectedModel.label}
                    className="w-6 h-6 invert"
                  />
                </div>
              )}
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {selectedModel ? (
                    <>{selectedModel.label}</>
                  ) : (
                    <>{t("chatbot.sidebar.modelSelectionInstruction")}</>
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
              {t("chatbot.sidebar.modelSelectionInstruction")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {models.map((model, index) => (
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
                        src={model.logo}
                        alt={model.label}
                        className="w-5 h-5 invert"
                      />
                    </div>
                    {model.label}
                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
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

//TODO: Only until backend implement forwarding model type

interface ChatModelContainerWithLogo extends ChatModelContainer {
  logo: string;
}

const azureIcon = "azure.svg";
const openaiIcon = "openai.svg";
const ollamaIcon = "ollama.svg";
const botIcon = "bot.svg";

const addModelLogo = (models: ChatModelContainer[]) => {
  const modelsWithLogo: ChatModelContainerWithLogo[] = [];
  models.forEach((model) => {
    if (!model.label || !model.uid) return;
    let icon;
    if (model.uid.includes("azure")) {
      icon = azureIcon;
    } else if (model.uid.includes("openai")) {
      icon = openaiIcon;
    } else if (model.uid.includes("llama")) {
      icon = ollamaIcon;
    } else {
      icon = botIcon;
    }

    modelsWithLogo.push({
      label: model.label,
      uid: model.uid,
      description: model.description,
      logo: icon,
    });
  });

  return modelsWithLogo;
};
