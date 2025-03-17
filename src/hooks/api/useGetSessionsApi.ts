import { useEffect, useState } from "react";
import { getSessions, Session } from "@/api";
import { useToast } from "../use-toast";
import { useCache } from "@/services/CacheService";

export interface UseGetSessionsApiResponse {
  sessions: Session[];
  appendSessionLocal: (session: Session | null) => void;
  updateSessionLabelLocal: (sessionId: string, newLabel: string) => void;
  deleteSessionLocal: (sessionId: string) => void;
  animateInSession: Session | null;
  error: string | null;
}

export default function useGetSessionsApi(): UseGetSessionsApiResponse {
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

  return {
    sessions,
    appendSessionLocal,
    updateSessionLabelLocal,
    deleteSessionLocal,
    animateInSession,
    error,
  };
}
