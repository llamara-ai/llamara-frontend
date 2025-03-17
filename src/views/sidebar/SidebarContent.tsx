import {
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar.tsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatModelContainer } from "@/api";
import useGetModelsApi from "@/hooks/api/useGetModelsApi";
import {
  useReadSelectedModel,
  useWriteSelectedModel,
} from "@/hooks/useLocalStorage";
import { SidebarSessionsGroup, SidebarSessionList } from "./SidebarSessionList";
import { SidebarModelSelector as ChatbotSidebarHeader } from "./SidebarModelSelector";
import { useToast } from "@/hooks/use-toast";
import { groupSessionsByDateForNavbar } from "@/lib/groupSessionsByDateForNavbar";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/services/AppContextService.tsx";
import { UseGetSessionsApiResponse } from "@/hooks/api/useGetSessionsApi";

// No need to provide onSelectedModel if not provided only store the selected model in local storage
interface SidebarProps {
  useSessionsApiInstance: UseGetSessionsApiResponse;
  onSelectedModel?: (modelUid: string | null) => void;
}

const SessionModelSidebar = ({
  useSessionsApiInstance,
  onSelectedModel,
}: Readonly<SidebarProps>) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { sessions } = useSessionsApiInstance;

  const { models } = useGetModelsApi();
  const { securityConfig } = useAppContext();

  const [selectedModel, setSelectedModel] = useState<ChatModelContainer | null>(
    useReadSelectedModel(),
  );
  const [sortedSessions, setSortedSessions] = useState<SidebarSessionsGroup[]>(
    [],
  );

  // Update parent component with selected model
  // If no method is provided store the selected model in local storage
  // Chatbot component will read the selected model from local storage
  useEffect(() => {
    if (onSelectedModel) {
      if (selectedModel?.uid) {
        onSelectedModel(selectedModel.uid);
      } else {
        onSelectedModel(null);
      }
    }
  }, [selectedModel]);

  // Update selected model in local storage
  useWriteSelectedModel(selectedModel);

  // check once if previous selected model is available
  // otherwise show notification and reset local storage
  useEffect(() => {
    if (selectedModel && !models.includes(selectedModel) && models.length > 0) {
      toast({
        variant: "destructive",
        title: "The selected model is not available",
        description:
          "Previous model is no longer available. Please select a new model.",
      });
      setSelectedModel(null);
    }
  }, []);

  const onSelectSession = (sessionId: string) => {
    void navigate(`/?session=${sessionId}`);
  };

  useEffect(() => {
    setSortedSessions(
      groupSessionsByDateForNavbar({
        sessions,
        last7DaysLabel: t("chatbot.sidebar.recent7days"),
        last30DaysLabel: t("chatbot.sidebar.recent30days"),
        recentYearLabel: t("chatbot.sidebar.recentYear"),
        noSessionsLabel: t("chatbot.sidebar.noSessions"),
      }),
    );
  }, [sessions, t]);

  return (
    <>
      <SidebarHeader>
        <ChatbotSidebarHeader
          models={models}
          selectedModel={selectedModel}
          setActiveModel={setSelectedModel}
        />
      </SidebarHeader>
      <SidebarContent>
        {securityConfig.anonymousUserEnabled ? (
          <SidebarGroupLabel style={{ marginTop: 10, textAlign: "center" }}>
            {t("chatbot.sidebar.anonymousModeActive")}
          </SidebarGroupLabel>
        ) : (
          <SidebarSessionList
            title={t("chatbot.sidebar.title")}
            items={sortedSessions}
            setOnClick={onSelectSession}
            useSessionsApiInstance={useSessionsApiInstance}
          />
        )}
      </SidebarContent>
    </>
  );
};

export default SessionModelSidebar;
