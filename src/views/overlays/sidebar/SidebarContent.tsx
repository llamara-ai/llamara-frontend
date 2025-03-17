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
  readSelectedModel,
  useWriteSelectedModel,
} from "@/hooks/useLocalStorage";
import { SidebarSessionsGroup, SidebarSessionList } from "./SidebarSessionList";
import { SidebarModelSelector as ChatbotSidebarHeader } from "./SidebarModelSelector";
import { useToast } from "@/hooks/use-toast";
import { groupSessionsByDateForNavbar } from "@/lib/groupSessionsByDateForNavbar";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/services/UserContextService";
import { useGetSessions } from "@/services/GetSessionsService";

const SessionModelSidebar = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { models } = useGetModelsApi();
  const { sessions } = useGetSessions();

  const [selectedModel, setSelectedModel] = useState<ChatModelContainer | null>(
    readSelectedModel(),
  );
  const [sortedSessions, setSortedSessions] = useState<SidebarSessionsGroup[]>(
    [],
  );

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
        {user?.anonymous ? (
          <SidebarGroupLabel style={{ marginTop: 10, textAlign: "center" }}>
            {t("chatbot.sidebar.anonymousModeActive")}
          </SidebarGroupLabel>
        ) : (
          <SidebarSessionList
            title={t("chatbot.sidebar.title")}
            items={sortedSessions}
            setOnClick={onSelectSession}
          />
        )}
      </SidebarContent>
    </>
  );
};

export default SessionModelSidebar;
