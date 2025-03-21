import { Knowledge } from "@/api";
import { useEffect, useRef } from "react";
import { getKnowledgeApiFunction } from "./api/useGetKnowledgeApi";
import { useGetKnowledgeList } from "../services/GetKnowledgeListService";

const fetchTimeout = 5000;

export interface FileStatusResponse {
  registerFiles: (newFiles: string[]) => Promise<void>;
  knowledgeList: Knowledge[];
  // Expose for testing only
  _checkFileStatus?: () => Promise<void>;
}

export default function useFileStatus(): FileStatusResponse {
  const knowledgeListRef = useRef<Knowledge[]>([]);
  const { updateLocalKnowledge, addLocalKnowledge } = useGetKnowledgeList();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const registerFiles = async (newFiles: string[]) => {
    const addedKnowledge: Knowledge[] = [];
    for (const fileId of newFiles) {
      const knowledge = await getKnowledgeApiFunction(fileId);
      if (knowledge) {
        addedKnowledge.push(knowledge);
        if (knowledge.ingestionStatus === "PENDING") {
          knowledgeListRef.current.push(knowledge);
        }
      }
    }
    addLocalKnowledge(addedKnowledge);
  };

  const checkFileStatus = async () => {
    const knowledgeList: Knowledge[] = [];
    for (const knowledgeFromList of knowledgeListRef.current) {
      if (!knowledgeFromList.id) return;
      const updatedKnowledge = await getKnowledgeApiFunction(
        knowledgeFromList.id,
      );
      if (updatedKnowledge) knowledgeList.push(updatedKnowledge);

      if (updatedKnowledge?.ingestionStatus !== "PENDING") {
        knowledgeListRef.current = knowledgeListRef.current.filter(
          (k) => k.id !== updatedKnowledge?.id,
        );
      }
    }
    updateLocalKnowledge(knowledgeList);
  };

  useEffect(() => {
    if (knowledgeListRef.current.length > 0) {
      intervalRef.current = setInterval(() => {
        checkFileStatus().catch(console.error);
      }, fetchTimeout);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [knowledgeListRef.current.length]);

  return {
    registerFiles,
    knowledgeList: knowledgeListRef.current,
    _checkFileStatus: checkFileStatus,
  };
}
