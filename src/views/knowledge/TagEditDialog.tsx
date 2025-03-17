import type React from "react";
import { useState, useCallback } from "react";
import { X } from "lucide-react";
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
import { Knowledge } from "@/api";
import useKnowledgeTagApi from "@/hooks/api/useKnowledgeTagApi";
import { t } from "i18next";

interface TagInputModalProps {
  knowledge: Knowledge | null;
  onClose: () => void;
}

export default function TagEditDialog({
  knowledge,
  onClose,
}: Readonly<TagInputModalProps>) {
  const [tags, setTags] = useState<string[]>(knowledge?.tags ?? []);
  const [inputValue, setInputValue] = useState("");
  const { updateKnowledgeTags } = useKnowledgeTagApi({ knowledge });

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
    await updateKnowledgeTags(tags);
    onClose();
  };

  return (
    <Dialog open={knowledge !== null} onOpenChange={onClose}>
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
          <Input
            type="text"
            placeholder="Add a new tag"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
          />
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
