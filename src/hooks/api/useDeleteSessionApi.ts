import { useState } from "react";
import { deleteSession } from "@/api/sdk.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface UseDeleteSessionApiProps {
  sessionId: string;
  deleteSessionLocal: (sessionId: string) => void;
}

interface UseDeleteSessionApiResponse {
  handleDeleteSession: () => Promise<void>;
  error: string | null;
}

// Return a function that deletes a session
export default function useDeleteSessionApi({
  sessionId,
  deleteSessionLocal,
}: UseDeleteSessionApiProps): UseDeleteSessionApiResponse {
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
        setError(null);
        toast(t("chatbot.deleteSessionSuccessful"));
        deleteSessionLocal(sessionId); // Update session list locally
        console.log("Delete session with id:", response);
      })
      .catch((error: Error) => {
        toast.error("Failed to delete session", {
          description: error.message,
        });
        setError(error.message);
      });
  };
  return { handleDeleteSession, error };
}
