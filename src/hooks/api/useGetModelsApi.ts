import { useEffect, useState } from "react";
import { ChatModelContainer, ChatModelProvider, getModels } from "@/api";
import { useCache } from "@/services/CacheService";
import { toast } from "sonner";

interface UseAvailableModelsResponse {
  models: ChatModelContainer[];
  error: string | null;
  getModelProviderFromUid: (
    currentSelectedModelId: string | null,
  ) => ChatModelProvider | undefined;
}

export default function useAvailableModels(): UseAvailableModelsResponse {
  const [models, setModels] = useState<ChatModelContainer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { getCache, setCache } = useCache<ChatModelContainer[]>();

  useEffect(() => {
    const cachedModels = getCache("models");
    if (cachedModels) {
      setError(null);
      setModels(cachedModels);
    } else if (!loading) {
      setLoading(true);
      getModels()
        .then((response) => {
          if (response.data) {
            setCache("models", response.data);
            setModels(response.data);
          } else {
            setCache("models", []);
            setModels([]);
          }
        })
        .catch((error: Error) => {
          toast.error("Failed to fetch available models", {
            description: error.message,
          });
          setError(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [loading]);

  const getModelProviderFromUid = (
    currentSelectedModelId: string | null,
  ): ChatModelProvider | undefined => {
    return models.find((model) => model.uid === currentSelectedModelId)
      ?.provider;
  };

  return { models, getModelProviderFromUid, error };
}
