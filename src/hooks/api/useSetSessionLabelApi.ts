import { useState } from "react";
import { setSessionLabel as setSessionLabelApiCall, Session } from "@/api";
import { useToast } from "../use-toast";
import { UseGetSessionsApiResponse } from "./useGetSessionsApi";

interface UseSetSessionLabelApiProps {
  sessionId: string;
  useSessionsApiInstance: UseGetSessionsApiResponse;
}

interface UseSetSessionLabelApiResponse {
  setSessionLabel: (label: string) => Promise<Session | null>;
  error: string | null;
}

export default function useSetSessionLabelApi({
  sessionId,
  useSessionsApiInstance,
}: UseSetSessionLabelApiProps): UseSetSessionLabelApiResponse {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const { updateSessionLabelLocal } = useSessionsApiInstance;

  const setSessionLabel = async (label: string) => {
    try {
      const options = {
        path: {
          sessionId,
        },
        query: {
          label,
        },
      };
      await setSessionLabelApiCall(options);
      updateSessionLabelLocal(sessionId, label);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Failed to create session",
          description: error.message,
        });
        setError(error.message);
      }
    }
    return null;
  };

  return { setSessionLabel, error };
}
