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
import { useUserContext } from "@/services/UserContextService.tsx";

interface Header {
  onClickNewSession: () => void;
}

export default function Header({ onClickNewSession }: Readonly<Header>) {
  const { t } = useTranslation();
  const { user } = useUserContext();

  return (
    <header
      className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        marginLeft: "env(safe-area-inset-left, 0px)",
        marginRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        {(user?.name ?? user?.username) && (
          <>
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb className="content-center w-5 h-5">
              <BreadcrumbList>
                <BreadcrumbItem className="">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={onClickNewSession}
                        className="text-sm font-medium text-primary hover:text-primary dark:text-primary dark:hover:text-primary"
                      >
                        <Plus className="content-center w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>{t("chatbot.newSession")}</TooltipContent>
                  </Tooltip>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </>
        )}
      </div>
    </header>
  );
}
