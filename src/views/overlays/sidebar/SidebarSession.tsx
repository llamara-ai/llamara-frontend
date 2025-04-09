import { Check, DeleteIcon, FilePenIcon } from "lucide-react";

import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useSetSessionLabelApi from "@/hooks/api/useSetSessionLabelApi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useDeleteSessionApi from "@/hooks/api/useDeleteSessionApi";
import { SessionSidebarItem } from "./SidebarSessionList";
import { useGetSessions } from "@/services/GetSessionsService";
import useStateRef from "react-usestateref";

interface SessionProps {
  subItem: SessionSidebarItem;
  setOnClick: (uid: string, label: string) => void;
  highlightSession: boolean;
}

export function SidebarSession({
  subItem,
  setOnClick,
  highlightSession,
}: Readonly<SessionProps>) {
  const { t } = useTranslation();
  const {
    animateInSession,
    deleteSessionLocal,
    updateSessionLabelLocal,
    setActiveSessionId,
  } = useGetSessions();

  const { setSessionLabel } = useSetSessionLabelApi({
    sessionId: subItem.uid,
    updateSessionLabelLocal,
  });
  const { handleDeleteSession } = useDeleteSessionApi({
    sessionId: subItem.uid,
    deleteSessionLocal,
  });

  const [hover, setHover] = useState<boolean>(false); // indicates if the mouse is hovering over the session
  const [open, setOpen] = useState<boolean>(false); // indicates if the dropdown menu is open

  const [editMode, setEditMode] = useState<boolean>(false); // edit mode for the session label, means the user can enter new label
  const [editedLabel, setEditedLabel, editedLabelRef] = useStateRef<string>(
    subItem.title,
  );

  const [isDeleted, setIsDeleted] = useState<boolean>(false); // show the session as deleted
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // show that the delete animation is in progress

  const inputRef = useRef<HTMLInputElement>(null);

  // Select the input text when the edit mode is enabled
  useEffect(() => {
    if (editMode && inputRef.current) {
      inputRef.current.select();
    }
  }, [editMode]);

  // Submit edit when clicking outside the input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        onSubmitLabel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editMode]);

  // If the session is deleted, don't show it
  if (isDeleted) {
    return null;
  }

  const onEditKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmitLabel();
    }
  };

  const onSubmitLabel = () => {
    void setSessionLabel(editedLabelRef.current);
    subItem.title = editedLabelRef.current;
    setOpen(false);
    setEditMode(false);
  };

  const onSubmitDelete = () => {
    setIsDeleting(true);
    setActiveSessionId(null);
    setTimeout(() => {
      void handleDeleteSession();
      setIsDeleted(true);
    }, 400);
  };

  return (
    <>
      <style>
        {fadeInKeyframes}
        {fadeOutKeyframes}
      </style>
      <TooltipProvider delayDuration={500}>
        {/* 1 second delay until tooltip is shown */}
        <SidebarMenuSubItem
          style={getStyle(isDeleting, animateInSession?.id === subItem.uid)}
        >
          {subItem.isNotAvailableMessage ? (
            <SidebarMenuSubButton asChild>
              <button className="flex items-center justify-between text-center w-full">
                <span>{subItem.title}</span>
              </button>
            </SidebarMenuSubButton>
          ) : (
            <SidebarMenuSubButton asChild className="bg-secondary">
              {editMode ? (
                <div
                  className="flex items-center justify-between text-center w-full"
                  onKeyDown={(e) => {
                    onEditKeyDown(e);
                  }}
                >
                  <input
                    type="text"
                    ref={inputRef}
                    value={editedLabel}
                    onChange={(e) => {
                      setEditedLabel(e.target.value);
                    }}
                    className="grow border bg-secondary rounded w-5/6"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      onSubmitLabel();
                    }}
                    className="w-1/6 px-1"
                  >
                    <Check className="h-full w-full text-primary" />
                  </button>
                </div>
              ) : (
                <div
                  className={`flex items-center justify-between text-center w-full ${highlightSession ? "bg-secondary" : "bg-transparent"}`}
                  onMouseEnter={() => {
                    setHover(true);
                  }}
                  onMouseLeave={() => {
                    setHover(false);
                  }}
                  onBlur={() => {
                    setHover(false);
                  }}
                >
                  <button
                    className="grow text-left overflow-hidden text-ellipsis whitespace-nowrap"
                    onClick={() => {
                      setOnClick(subItem.uid, subItem.title);
                    }}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                          {subItem.title}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {subItem.formattedTimestamp}
                      </TooltipContent>
                    </Tooltip>
                  </button>

                  <div className="h-full px-2 shrink-0">
                    <DropdownMenu
                      onOpenChange={(open) => {
                        setOpen(open);
                      }}
                    >
                      <DropdownMenuTrigger asChild>
                        <button
                          className={`rounded-full h-full w-full transition-opacity duration-300 ${hover || open ? "opacity-100" : "opacity-0"}`}
                        >
                          <div className="flex flex-row items-center justify-center gap-x-1">
                            <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                            <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                            <div className="h-1 w-1 rounded-full bg-muted-foreground" />
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" sideOffset={8}>
                        <DropdownMenuItem
                          onClick={() => {
                            setOpen(false);
                            setEditMode(true);
                          }}
                        >
                          <FilePenIcon className="mr-2 h-4 w-4" />
                          {t("sidebar.session.buttonEditLabel")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            onSubmitDelete();
                          }}
                        >
                          <DeleteIcon className="mr-2 h-4 w-4" />
                          {t("sidebar.session.buttonDelete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )}
            </SidebarMenuSubButton>
          )}
        </SidebarMenuSubItem>
      </TooltipProvider>
    </>
  );
}

const fadeOutStyle = {
  animation: "fadeOut 0.4s ease-out",
};

const fadeInStyle = {
  animation: "fadeIn 0.4s ease-in-out",
};

const fadeInKeyframes = `
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;

const fadeOutKeyframes = `
    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }
  `;

const getStyle = (isDeleting: boolean, animate: boolean) => {
  if (isDeleting) {
    return fadeOutStyle;
  }
  if (animate) {
    return fadeInStyle;
  }
  return {};
};
