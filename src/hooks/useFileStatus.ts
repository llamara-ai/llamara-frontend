import { Knowledge } from "@/api";
import { useEffect, useRef } from "react";
import { getKnowledgeApiFunction } from "./api/useGetKnowledgeApi";
import { useGetKnowledgeList } from "../services/GetKnowledgeListService";

const fetchTimeout = 5000;

export interface FileStatusResponse {
  registerFiles: (newFiles: string[]) => Promise<void>;
  knowledgeList: Knowledge[];
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
    startInterval();
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
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [knowledgeListRef.current]);

  const startInterval = () => {
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        void checkFileStatus();
      }, fetchTimeout);
    }
  };

  return { registerFiles, knowledgeList: knowledgeListRef.current };
}
