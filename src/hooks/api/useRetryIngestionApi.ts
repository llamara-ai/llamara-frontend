import { retryFailedIngestion } from "@/api";
import { useState } from "react";
import { toast } from "sonner";

interface UseRetryIngestionApiResponse {
  retryIngestion: (knowledgeId: string) => Promise<null>;
  error: string | null;
}

export default function useRetryIngestionApi(): UseRetryIngestionApiResponse {
  const [error, setError] = useState<string | null>(null);

  const retryIngestion = async (knowledgeId: string) => {
    const options = {
      path: {
        id: knowledgeId,
      },
    };
    try {
      await retryFailedIngestion(options);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed retry ingestion!", {
          description: error.message,
        });
        setError(error.message);
      }
    }
    return null;
  };

  return { retryIngestion, error };
}
