import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getSessions, Session } from "@/api";
import { useCache } from "@/services/CacheService";
import { default as useRefState } from "react-usestateref";
import useCurrentPage from "@/hooks/useCurrentPage";
import { useNavigate } from "react-router";
import { navigateToSession } from "@/lib/navigateToSession";
import { toast } from "sonner";

export interface UseGetSessionsApiResponse {
  sessions: Session[];
  activeSessionId: string | null;
  activeSessionIdRef: React.MutableRefObject<string | null>;
  activeSessionIsNew: boolean;
  setActiveSessionId: (
    sessionId: string | null,
    isNew?: boolean,
    redirect?: boolean,
  ) => void;
  appendSessionLocal: (session: Session | null) => void;
  updateSessionLabelLocal: (sessionId: string, newLabel: string) => void;
  deleteSessionLocal: (sessionId: string) => void;
  animateInSession: Session | null;
  error: string | null;
  loading: boolean;
}

const SessionsContext = createContext<UseGetSessionsApiResponse | null>(null);

export default function GetSessionsProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [sessions, setSessions, sessionsRef] = useRefState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { getCache, setCache } = useCache<Session[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [animateInSession, setAnimateInSession] = useState<Session | null>(
    null,
  ); // This session was added and need fade in animation, null means no animation
  const [activeSessionId, setActiveSessionId, activeSessionIdRef] = useRefState<
    string | null
  >(null);
  const activeSessionIsNewRef = useRef<boolean>(false);

  const navigate = useNavigate();
  const activePage = useCurrentPage();

  useEffect(() => {
    const cachedSessions = getCache("sessions");
    if (cachedSessions) {
      setSessions(cachedSessions);
    } else if (!loading) {
      setAnimateInSession(null);
      setLoading(true);
      getSessions()
        .then((response) => {
          setError(null);
          if (response.data) {
            setSessions(response.data);
            setCache("sessions", response.data);
          } else {
            setSessions([]);
          }
        })
        .catch((error: Error) => {
          toast.error("Failed to fetch sessions", {
            description: error.message,
          });
          setError(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  // Append a session locally, so we don't have to fetch the sessions again
  const appendSessionLocal = (session: Session | null) => {
    if (!session?.id) return;
    setSessions([...sessionsRef.current, session]);
    setAnimateInSession(session);
  };

  // Update the label of a session locally, so we don't have to fetch the sessions again
  const updateSessionLabelLocal = (sessionId: string, newLabel: string) => {
    setSessions(
      sessionsRef.current.map((session) => {
        if (session.id === sessionId) {
          return { ...session, label: newLabel };
        }
        return session;
      }),
    );
  };

  // Delete a session locally, so we don't have to fetch the sessions again
  const deleteSessionLocal = (sessionId: string) => {
    if (activePage === "chatbot" && activeSessionId === sessionId) {
      void navigate("/");
    }

    setSessions(
      sessionsRef.current.filter((session) => session.id !== sessionId),
    );
  };

  // Set active session id and update URL with the new selected session
  const setActiveSessionIdFunc = (
    sessionId: string | null,
    isNew = false,
    redirect = true,
  ) => {
    activeSessionIsNewRef.current = isNew;
    setActiveSessionId(sessionId);
    if (redirect) {
      navigateToSession(sessionId, navigate);
    }
  };

  const value = useMemo(
    () => ({
      sessions,
      activeSessionId,
      activeSessionIdRef,
      activeSessionIsNew: activeSessionIsNewRef.current,
      setActiveSessionId: setActiveSessionIdFunc,
      appendSessionLocal,
      updateSessionLabelLocal,
      deleteSessionLocal,
      animateInSession,
      error,
      loading,
    }),
    [
      sessions,
      activeSessionId,
      activeSessionIdRef,
      setActiveSessionId,
      appendSessionLocal,
      updateSessionLabelLocal,
      deleteSessionLocal,
      animateInSession,
      error,
      loading,
    ],
  );

  return (
    <SessionsContext.Provider value={value}>
      {children}
    </SessionsContext.Provider>
  );
}

export function useGetSessions() {
  const context = useContext(SessionsContext);
  if (!context) {
    throw new Error("useGetSessions must be used within a GetSessionsProvider");
  }
  return context;
}
