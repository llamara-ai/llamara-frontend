import { SidebarContent, SidebarGroupLabel } from "@/components/ui/sidebar.tsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SidebarSessionsGroup, SidebarSessionList } from "./SidebarSessionList";
import { groupSessionsByDateForNavbar } from "@/lib/groupSessionsByDateForNavbar";
import { useUserContext } from "@/services/UserContextService";
import { useGetSessions } from "@/services/GetSessionsService";
import LoadingAnimation from "@/components/loading-animation";
import SidebarMainNav from "./SidebarMainNav.tsx";

const SidebarContentFunc = () => {
  const { t } = useTranslation();
  const { sessions, loading } = useGetSessions();

  const [sortedSessions, setSortedSessions] = useState<SidebarSessionsGroup[]>(
    [],
  );

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
    <SidebarContent
      className="flex flex-col"
      style={{
        marginLeft: "env(safe-area-inset-left, 0)",
      }}
    >
      {loading ? (
        <LoadingAnimation
          loadingMessage={t("sidebar.session.loading")}
          className="bg-transparent"
        />
      ) : (
        <GetSessions sortedSessions={sortedSessions} />
      )}

      <SidebarMainNav />
    </SidebarContent>
  );
};

export default SidebarContentFunc;

const GetSessions = ({
  sortedSessions,
}: {
  sortedSessions: SidebarSessionsGroup[];
}) => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const { setActiveSessionId } = useGetSessions();

  const onSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
  };

  return (
    <>
      {user?.anonymous ? (
        <SidebarGroupLabel className="flex-1 overflow-auto pt-0 text-sm mt-3 text-center items-start">
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
