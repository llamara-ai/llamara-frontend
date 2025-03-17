import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/breadcrumb.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { SidebarTrigger } from "@/components/ui/sidebar.tsx";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Plus } from "lucide-react";

interface ChatbotHeaderProps {
  onClickNewSession: () => void;
}

export default function ChatbotHeader({
  onClickNewSession,
}: Readonly<ChatbotHeaderProps>) {
  const { t } = useTranslation();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb className="content-center w-5 h-5">
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onClickNewSession}
                    className="text-sm font-medium text-primary hover:text-primary-foreground dark:text-primary dark:hover:text-primary-foreground"
                  >
                    <Plus className="content-center w-5 h-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t("chatbot.newSession")}</TooltipContent>
              </Tooltip>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
}
