import { useEffect, useState } from "react";
import { KnowledgeRecord, getKnowledge } from "@/api";
import { useCache } from "@/services/CacheService";
import { toast } from "sonner";

interface UseGetKnowledgeApiProps {
  uuid: string | null;
}

export interface UseGetKnowledgeApiResponse {
  knowledge: KnowledgeRecord | undefined;
  error: string | null;
}

export default function useGetKnowledgeApi({
  uuid,
}: UseGetKnowledgeApiProps): UseGetKnowledgeApiResponse {
  const [knowledge, setKnowledge] = useState<KnowledgeRecord>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { getCache, setCache } = useCache<KnowledgeRecord | null>();
  const { getCache: getCacheLoading, setCache: setCacheLoading } =
    useCache<boolean>();
  const { getCache: getCacheNotFound, setCache: setCacheNotFound } =
    useCache<boolean>();

  const cacheNotFoundKey = uuid
    ? "knowledge" + uuid + "notfound"
    : "knowledgeNotfound";
  const cacheLoadingKey = uuid
    ? "knowledge" + uuid + "loading"
    : "knowledgeLoading";
  const cacheKey = uuid ? "knowledge" + uuid : "knowledge";

  useEffect(() => {
    if (!uuid) return;

    const cachedNotFound = getCacheNotFound(cacheNotFoundKey);
    if (cachedNotFound) {
      setError("Knowledge not found");
      return;
    }

    const cachedLoading = getCacheLoading(cacheLoadingKey);
    const cached = getCache(cacheKey);

    if (cached) {
      setKnowledge(cached);
    } else if (!loading && !cachedLoading) {
      setCacheLoading(cacheLoadingKey, true, null);
      setLoading(true);

      const options = {
        path: {
          id: uuid,
        },
      };

      getKnowledge(options)
        .then((response) => {
          setError(null);
          if (response.data === undefined) {
            setCacheNotFound(cacheNotFoundKey, true, null);
            throw new Error("Knowledge not found");
          } else {
            setCache(cacheKey, response.data);
          }
          setKnowledge(response.data);
        })
        .catch((error: Error) => {
          toast.error("Failed to fetch knowledge", {
            description: error.message,
          });
          setError(error.message);
        })
        .finally(() => {
          setLoading(false);
          setCacheLoading(cacheLoadingKey, false, 120);
        });
    } else if (cachedLoading) {
      const timer = setTimeout(() => {
        // Trigger the useEffect to run again
        setLoading((prev) => !prev);
      }, 1000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [uuid, getCache, setCache, loading]);

  return { knowledge, error };
}

export async function getKnowledgeApiFunction(
  uuid: string,
): Promise<KnowledgeRecord | null> {
  const options = {
    path: {
      id: uuid,
    },
  };
  try {
    const response = await getKnowledge(options);
    if (response.data === undefined) {
      throw new Error("Knowledge not found");
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
  return null;
}
