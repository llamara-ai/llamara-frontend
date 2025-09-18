import { useState } from "react";
import { ChatMessageRecord, getHistory } from "@/api";
import { useCache } from "@/services/CacheService";
import { toast } from "sonner";

interface FetchHistoryProps {
  sessionId: string | null;
}

interface UseGetHistoryApiResponse {
  fetchHistory: ({
    sessionId,
  }: FetchHistoryProps) => Promise<ChatMessageRecord[]>;
  loading: boolean;
  error: string | null;
}

export default function useGetHistoryApi(): UseGetHistoryApiResponse {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { getCache, setCache } = useCache<ChatMessageRecord[]>();
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);

  const fetchHistory = async ({
    sessionId,
  }: FetchHistoryProps): Promise<ChatMessageRecord[]> => {
    const cachedHistory = getCache("history");
    // Check if the session id is the same as the last one
    // if not equal refetch data
    if (cachedHistory && sessionId === lastSessionId) {
      return cachedHistory;
    }
    if (!loading && sessionId !== "" && sessionId !== null) {
      setLoading(true);
      const options = {
        path: {
          sessionId: sessionId,
        },
      };

      try {
        const response = await getHistory(options);
        if (response.data) {
          setError(null);
          setCache("history" + sessionId, response.data[200]);
          setLoading(false);
          setLastSessionId(sessionId);
          return response.data[200];
        } else {
          toast.error("Failed to fetch history", {
            description:
              "The given session id is invalid. Try again, or create new session.",
          });
          setError("Given session id is invalid");
          setLoading(false);
          return [];
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error("Failed to fetch history", {
            description: error.message,
          });
          setLoading(false);
          setError(error.message);
          return [];
        }
      }
    }
    setLoading(false);
    return [];
  };

  return { fetchHistory, loading, error };
}
