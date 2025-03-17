import { useState } from "react";
import { deleteSession } from "@/api/sdk.gen";
import { useTranslation } from "react-i18next";
import { useToast } from "../use-toast";

interface UseDeleteSessionApiProps {
  sessionId: string;
}

interface UseDeleteSessionApiResponse {
  handleDeleteSession: () => Promise<void>;
  error: string | null;
}

// Return a function that deletes a session
export default function useDeleteSessionApi({
  sessionId,
}: UseDeleteSessionApiProps): UseDeleteSessionApiResponse {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleDeleteSession = async () => {
    const options = {
      path: {
        sessionId: sessionId,
      },
    };

    deleteSession(options)
      .then((response) => {
        toast({
          title: t("chatbot.deleteSessionSuccessful"),
        });
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
