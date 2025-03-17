import { useState } from "react";
import { deleteSession } from "@/api/sdk.gen";
import { useTranslation } from "react-i18next";
import { useToast } from "../use-toast";
import { UseGetSessionsApiResponse } from "./useGetSessionsApi";

interface UseDeleteSessionApiProps {
  sessionId: string;
  useSessionsApiInstance: UseGetSessionsApiResponse;
}

interface UseDeleteSessionApiResponse {
  handleDeleteSession: () => Promise<void>;
  error: string | null;
}

// Return a function that deletes a session
export default function useDeleteSessionApi({
  sessionId,
  useSessionsApiInstance,
}: UseDeleteSessionApiProps): UseDeleteSessionApiResponse {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const { deleteSessionLocal } = useSessionsApiInstance;

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleDeleteSession = async () => {
    const options = {
      path: {
        sessionId: sessionId,
      },
    };

    deleteSession(options)
      .then((response) => {
        setError(null);
        toast({
          title: t("chatbot.deleteSessionSuccessful"),
        });
        deleteSessionLocal(sessionId); // Update session list locally
        console.log("Delete session response:", response);
      })
      .catch((error: Error) => {
        toast({
          variant: "destructive",
          title: "Failed to delete session",
          description: error.message,
        });
        setError(error.message);
      });
  };
  return { handleDeleteSession, error };
}
