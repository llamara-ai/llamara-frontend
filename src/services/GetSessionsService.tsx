import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getSessions, Session } from "@/api";
import { useCache } from "@/services/CacheService";
import { useToast } from "@/hooks/use-toast";

export interface UseGetSessionsApiResponse {
  sessions: Session[];
  appendSessionLocal: (session: Session | null) => void;
  updateSessionLabelLocal: (sessionId: string, newLabel: string) => void;
  deleteSessionLocal: (sessionId: string) => void;
  animateInSession: Session | null;
  error: string | null;
}

const SessionsContext = createContext<UseGetSessionsApiResponse | null>(null);

export default function GetSessionsProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { getCache, setCache } = useCache<Session[]>();
  const [loading, setLoading] = useState<boolean>(false);
  const [animateInSession, setAnimateInSession] = useState<Session | null>(
    null,
  ); // This session was added and need fade in animation, null means no animation

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
            setCache("sessions", response.data, 10);
          } else {
            setSessions([]);
          }
        })
        .catch((error: Error) => {
          toast({
            variant: "destructive",
            title: "Failed to fetch sessions",
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
    setSessions([...sessions, session]);
    const cachedSessions = getCache("sessions");
    if (cachedSessions) {
      setSessions([...cachedSessions, session]);
    }
    setAnimateInSession(session);
  };

  // Update the label of a session locally, so we don't have to fetch the sessions again
  const updateSessionLabelLocal = (sessionId: string, newLabel: string) => {
    setSessions(
      sessions.map((session) => {
        if (session.id === sessionId) {
          return { ...session, label: newLabel };
        }
        return session;
      }),
    );
  };

  // Delete a session locally, so we don't have to fetch the sessions again
  const deleteSessionLocal = (sessionId: string) => {
    setSessions(sessions.filter((session) => session.id !== sessionId));
  };

  const value = useMemo(
    () => ({
      sessions,
      appendSessionLocal,
      updateSessionLabelLocal,
      deleteSessionLocal,
      animateInSession,
      error,
    }),
    [
      sessions,
      appendSessionLocal,
      updateSessionLabelLocal,
      deleteSessionLocal,
      animateInSession,
      error,
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
    throw new Error("useGetSessions must be used within a SessionsProvider");
  }
  return context;
}
