import { useState } from "react";
import { addKnowledgeTag, KnowledgeRecord, removeKnowledgeTag } from "@/api";
import { useToast } from "../use-toast";
import { useGetKnowledgeList } from "@/services/GetKnowledgeListService";

interface UseKnowledgeTagApiProps {
  knowledge: KnowledgeRecord | null;
}

interface UseKnowledgeTagApiResponse {
  updateKnowledgeTags: (tags: string[]) => Promise<void>;
  error: string | null;
}

export default function useKnowledgeTagApi({
  knowledge,
}: UseKnowledgeTagApiProps): UseKnowledgeTagApiResponse {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const { updateLocalKnowledge } = useGetKnowledgeList();

  const updateKnowledgeTags = async (tags: string[]) => {
    if (!knowledge) return;
    // Add tags to knowledge if they are not already present
    await addTags(tags);

    // Remove tags from knowledge if they aren't present in prop but are present in the knowledge
    await removeTags(tags);
  };

  const addTags = async (tagsToAdd: string[]) => {
    if (!knowledge) return;

    const tags: string[] = knowledge.tags ?? [];
    let cleanedTags = tagsToAdd.filter((tag) => !tags.includes(tag));

    for (const tag of cleanedTags) {
      try {
        const options = {
          path: {
            id: knowledge.id ?? "",
          },
          query: {
            tag,
          },
        };
        await addKnowledgeTag(options);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
          toast({
            variant: "destructive",
            title: "Failed to add Tag",
            description: error.message,
          });
          cleanedTags = cleanedTags.filter((t) => t !== tag);
        }
      }
    }

    const newTags = tags.concat(cleanedTags);

    // Update the knowledge object with the new tags
    updateLocalKnowledge([{ ...knowledge, tags: newTags }]);
  };

  const removeTags = async (newTags: string[]) => {
    if (!knowledge) return;

    const tags: string[] = knowledge.tags ?? [];

    for (const tag of tags) {
      try {
        if (!newTags.includes(tag)) {
          const options = {
            path: {
              id: knowledge.id ?? "",
            },
            query: {
              tag,
            },
          };
          await removeKnowledgeTag(options);
        }
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
          toast({
            variant: "destructive",
            title: "Failed to remove Tag",
            description: error.message,
          });
          newTags.push(tag);
        }
      }
    }

    // Update the knowledge object with the new tags
    updateLocalKnowledge([{ ...knowledge, tags: newTags }]);
  };

  return { updateKnowledgeTags, error };
}
