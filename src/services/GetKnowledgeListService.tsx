import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getAllKnowledge, Knowledge } from "@/api";
import { useCache } from "@/services/CacheService";
import { useToast } from "@/hooks/use-toast";

interface UseGetAllKnowledgeApiResponse {
  allKnowledge: Knowledge[];
  updateLocalKnowledge: (knowledge: Knowledge | null) => Promise<void>;
  deleteLocalKnowledge: (knowledge: Knowledge) => Promise<void>;
  addLocalKnowledge: (knowledge: Knowledge) => Promise<void>;
  error: string | null;
}

const knowledgeListCacheKey = "allKnowledge";
const knowledgeListLoadingCacheKey = "allKnowledgeLoading";

const KnowledgeListContext =
  createContext<UseGetAllKnowledgeApiResponse | null>(null);

export default function GetKnowledgeListProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { toast } = useToast();
  const [allKnowledge, setAllKnowledge] = useState<Knowledge[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { getCache, setCache } = useCache<Knowledge[]>();
  const { getCache: getCacheLoading, setCache: setCacheLoading } =
    useCache<boolean>();

  useEffect(() => {
    void fetchAllKnowledge();
  }, []);

  const fetchAllKnowledge = async () => {
    const cachedAllKnowledge = getCache(knowledgeListCacheKey);
    const cachedLoading = getCacheLoading(knowledgeListLoadingCacheKey);

    if (cachedAllKnowledge) {
      setAllKnowledge(cachedAllKnowledge);
    } else if (!loading && !cachedLoading) {
      setLoading(true);
      setCacheLoading(knowledgeListLoadingCacheKey, true, 120);
      try {
        const response = await getAllKnowledge();
        setError(null);
        if (response.data) {
          setCache("allKnowledge", response.data, 120);
          setAllKnowledge(response.data);
        }
      } catch (error) {
        if (error instanceof Error) {
          toast({
            variant: "destructive",
            title: "Failed to fetch all knowledge",
            description: error.message,
          });
          setError(error.message);
        }
      }
      setCacheLoading(knowledgeListLoadingCacheKey, false, 10);
      setLoading(false);
    }
  };

  // delete Knowledge in local state
  const deleteLocalKnowledge = async (knowledge: Knowledge) => {
    //Refetch all knowledge if not available
    if (allKnowledge.length === 0) {
      await fetchAllKnowledge();
    }

    const updatedKnowledge = allKnowledge.filter((k) => k.id !== knowledge.id);
    setAllKnowledge(updatedKnowledge);
    setCache("allKnowledge", updatedKnowledge, 120);
  };

  // add multiple knowledge to local state
  const addLocalKnowledge = async (knowledge: Knowledge) => {
    //Refetch all knowledge if not available
    if (allKnowledge.length === 0) {
      await fetchAllKnowledge();
    }

    // Check if knowledge already exists, if yes then update it
    const existingKnowledge = allKnowledge.find((k) => k.id === knowledge.id);
    if (existingKnowledge) {
      toast({
        variant: "default",
        title: "File already exists",
        description: "Updated the file",
      });
      await updateLocalKnowledge(knowledge);
    } else {
      const updatedKnowledge = [...allKnowledge, knowledge];

      setAllKnowledge(updatedKnowledge);
      setCache("allKnowledge", updatedKnowledge, 120);
    }
  };

  // update Knowledge in local state
  const updateLocalKnowledge = async (newKnowledge: Knowledge | null) => {
    if (!newKnowledge) return;

    //Refetch all knowledge if not available
    if (allKnowledge.length === 0) {
      await fetchAllKnowledge();
    }

    const filteredKnowledges = allKnowledge.filter(
      (k) => k.id !== newKnowledge.id,
    );
    const updatedKnowledges = [...filteredKnowledges, newKnowledge];

    setAllKnowledge(updatedKnowledges);
    setCache("allKnowledge", updatedKnowledges, 120);
  };

  const contextValue = useMemo(
    () => ({
      allKnowledge,
      addLocalKnowledge,
      deleteLocalKnowledge,
      updateLocalKnowledge,
      error,
    }),
    [allKnowledge, error],
  );

  return (
    <KnowledgeListContext.Provider value={contextValue}>
      {children}
    </KnowledgeListContext.Provider>
  );
}

export function useGetKnowledgeList() {
  const context = useContext(KnowledgeListContext);
  if (!context) {
    throw new Error(
      "useGetKnowledgeList must be used within a GetKnowledgeListProvider",
    );
  }
  return context;
}
