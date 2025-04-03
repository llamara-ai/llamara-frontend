import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { KnowledgeRecord } from "@/api";
import useKnowledgeTagApi from "@/hooks/api/useKnowledgeTagApi";
import { t } from "i18next";
import { useGetKnowledgeList } from "@/services/GetKnowledgeListService";

interface TagInputModalProps {
  knowledgeId: string | null;
  onClose: () => void;
}

export default function TagEditDialog({
  knowledgeId,
  onClose,
}: Readonly<TagInputModalProps>) {
  const [knowledge, setKnowledge] = useState<KnowledgeRecord | null>(null);
  const [tags, setTags] = useState<string[]>(knowledge?.tags ?? []);
  const [inputValue, setInputValue] = useState("");
  const { updateKnowledgeTags } = useKnowledgeTagApi({ knowledge });
  const { allKnowledge } = useGetKnowledgeList();

  useEffect(() => {
    if (knowledgeId) {
      const knowledge = allKnowledge.find((k) => k.id === knowledgeId);
      setKnowledge(knowledge ?? null);

      setTags(knowledge?.tags ?? []);
    }
  }, [allKnowledge, knowledgeId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    }
  };

  const addTag = useCallback(
    (tag: string) => {
      if (tag && !tags.includes(tag)) {
        setTags((prevTags) => [...prevTags, tag]);
        setInputValue("");
      }
    },
    [tags],
  );

  const removeTag = useCallback((tagToRemove: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
  }, []);

  const handleSubmit = async () => {
    onClose();
    await updateKnowledgeTags(tags);
  };

  return (
    <Dialog open={knowledgeId !== null} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[400px] overflow-auto">
        <DialogHeader>
          <DialogTitle>{t("knowledgePage.tagDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("knowledgePage.tagDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center"
              >
                {tag}
                <button
                  onClick={() => {
                    removeTag(tag);
                  }}
                  className="ml-1 text-primary"
                >
                  <X size={14} className="" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add a new tag"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
            />
            <Button
              onClick={() => {
                addTag(inputValue.trim());
              }}
              variant={"outline"}
            >
              <Plus size={14} />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => {
              void handleSubmit();
            }}
          >
            {t("knowledgePage.tagDialog.submitButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
