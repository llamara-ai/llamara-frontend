import { useState } from "react";
import { deleteKnowledge } from "@/api";
import { toast } from "sonner";

interface UseDeleteKnowledgeApiResponse {
  handleDeleteKnowledge: (uuid: string) => Promise<void>;
  error: string | null;
}

export default function useDeleteKnowledgeApi(): UseDeleteKnowledgeApiResponse {
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleDeleteKnowledge = async (uuid: string) => {
    const options = {
      path: {
        id: uuid,
      },
    };
    deleteKnowledge(options)
      .then(() => {
        setError(null);
        console.log("Deleted knowledge with id:", uuid);
      })
      .catch((error: Error) => {
        toast.error("Failed to delete knowledge", {
          description: error.message,
        });
        setError(error.message);
      });
  };

  return { handleDeleteKnowledge, error };
}
