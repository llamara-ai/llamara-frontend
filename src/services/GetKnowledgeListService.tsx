import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getAllKnowledge, KnowledgeRecord } from "@/api";
import { useCache } from "@/services/CacheService";
import { default as useRefState } from "react-usestateref";
import { toast } from "sonner";

interface UseGetAllKnowledgeApiResponse {
  allKnowledge: KnowledgeRecord[];
  updateLocalKnowledge: (newKnowledgeArray: KnowledgeRecord[] | null) => void;
  deleteLocalKnowledge: (knowledge: KnowledgeRecord) => void;
  addLocalKnowledge: (knowledgeArray: KnowledgeRecord[]) => void;
  error: string | null;
}

const knowledgeListCacheKey = "allKnowledge";
const knowledgeListLoadingCacheKey = "allKnowledgeLoading";

const KnowledgeListContext =
  createContext<UseGetAllKnowledgeApiResponse | null>(null);

export default function GetKnowledgeListProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [allKnowledge, setAllKnowledge, allKnowledgeRef] = useRefState<
    KnowledgeRecord[]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { getCache, setCache } = useCache<KnowledgeRecord[]>();
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
      setCacheLoading(knowledgeListLoadingCacheKey, true, 30);
      try {
        const response = await getAllKnowledge();
        setError(null);
        if (response.data) {
          setCache("allKnowledge", response.data);
          setAllKnowledge(response.data);
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error("Failed to fetch all knowledge", {
            description: error.message,
          });
          setError(error.message);
        }
      }
      setCacheLoading(knowledgeListLoadingCacheKey, false, 30);
      setLoading(false);
    }
  };

  // delete Knowledge in local state
  const deleteLocalKnowledge = (knowledge: KnowledgeRecord) => {
    const updatedKnowledge = allKnowledgeRef.current.filter(
      (k) => k.id !== knowledge.id,
    );
    setAllKnowledge(updatedKnowledge);
    setCache("allKnowledge", updatedKnowledge);
  };

  // add multiple knowledge to local state
  const addLocalKnowledge = (knowledgeArray: KnowledgeRecord[]) => {
    const knowledgeToAdd: KnowledgeRecord[] = [];

    for (const knowledge of knowledgeArray) {
      // Check if knowledge already exists, if yes then update it
      const existingKnowledge = allKnowledgeRef.current.find(
        (k) => k.id === knowledge.id,
      );
      if (existingKnowledge) {
        updateLocalKnowledge([knowledge]);
      } else {
        knowledgeToAdd.push(knowledge);
      }
    }
    const updatedKnowledge = allKnowledgeRef.current.concat(knowledgeToAdd);
    setAllKnowledge(updatedKnowledge);
    setCache("allKnowledge", updatedKnowledge);
  };

  // update Knowledge in local state
  const updateLocalKnowledge = (
    newKnowledgeArray: KnowledgeRecord[] | null,
  ) => {
    if (!newKnowledgeArray) return;

    let filteredKnowledge = allKnowledgeRef.current;
    for (const newKnowledge of newKnowledgeArray) {
      filteredKnowledge = filteredKnowledge.filter(
        (k) => k.id !== newKnowledge.id,
      );
    }
    const updatedKnowledge = filteredKnowledge.concat(newKnowledgeArray);
    setAllKnowledge(updatedKnowledge);
    setCache("allKnowledge", updatedKnowledge);
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
