import { useEffect, useState } from "react";
import { getAllKnowledge, Knowledge } from "@/api";
import { useToast } from "../use-toast";
import { useCache } from "@/services/CacheService";

interface UseGetAllKnowledgeApiResponse {
  allKnowledge: Knowledge[];
  error: string | null;
}

export default function useGetAllKnowledgeApi(): UseGetAllKnowledgeApiResponse {
  const { toast } = useToast();
  const [allKnowledge, setAllKnowledge] = useState<Knowledge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { getCache, setCache } = useCache<Knowledge[]>();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    const fetchAllKnowledge = async () => {
      setLoading(true);
      getAllKnowledge()
        .then((response) => {
          setError(null);
          if (response.data) {
            setCache("allKnowledge", response.data, 10);
            setAllKnowledge(response.data);
          } else {
            setCache("allKnowledge", [], 10);
            setAllKnowledge([]);
          }
        })
        .catch((error: Error) => {
          toast({
            variant: "destructive",
            title: "Failed to fetch all knowledge",
            description: error.message,
          });
          setError(error.message);
        });
    };
    const cachedAllKnowledge = getCache("allKnowledge");
    if (cachedAllKnowledge) {
      setAllKnowledge(cachedAllKnowledge);
    } else if (!loading) {
      void fetchAllKnowledge();
    }
  }, [loading]);

  return { allKnowledge, error };
}
