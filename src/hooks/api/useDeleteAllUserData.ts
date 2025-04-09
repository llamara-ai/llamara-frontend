import { useState } from "react";
import { deleteUserData } from "@/api/sdk.gen";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface UseDeleteAllUserDataResponse {
  deleteAllUserData: () => Promise<void>;
  error: string | null;
}

export default function useDeleteAllUserData(): UseDeleteAllUserDataResponse {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const deleteAllUserData = async () => {
    try {
      await deleteUserData();
      setError(null);
      toast.success(t("chatbot.deleteSessionSuccessful"));
      console.log("Delete all user data");
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to delete user data", {
          description: error.message,
        });
        setError(error.message);
      }
    }
  };
  return { deleteAllUserData, error };
}
