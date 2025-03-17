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
import LoadingAnimation from "@/components/loading-animation";

const SessionModelSidebar = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { models } = useGetModelsApi();
  const { sessions, loading } = useGetSessions();

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

  useEffect(() => {
    setSortedSessions(
      groupSessionsByDateForNavbar({
        sessions,
        last7DaysLabel: t("sidebar.session.recent7days"),
        last30DaysLabel: t("sidebar.session.recent30days"),
        recentYearLabel: t("sidebar.session.recentYear"),
        noSessionsLabel: t("sidebar.session.noSessions"),
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
        {loading ? (
          <LoadingAnimation
            loadingMessage={t("sidebar.session.loading")}
            className="bg-transparent"
          />
        ) : (
          <GetSessions sortedSessions={sortedSessions} />
        )}
      </SidebarContent>
    </>
  );
};

export default SessionModelSidebar;

const GetSessions = ({
  sortedSessions,
}: {
  sortedSessions: SidebarSessionsGroup[];
}) => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const navigate = useNavigate();

  const onSelectSession = (sessionId: string) => {
    void navigate(`/?session=${sessionId}`);
  };

  return (
    <>
      {user?.anonymous ? (
        <SidebarGroupLabel style={{ marginTop: 10, textAlign: "center" }}>
          {t("sidebar.session.anonymousModeActive")}
        </SidebarGroupLabel>
      ) : (
        <SidebarSessionList
          title={t("sidebar.session.title")}
          items={sortedSessions}
          setOnClick={onSelectSession}
        />
      )}
    </>
  );
};
