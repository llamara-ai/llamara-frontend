import { Knowledge } from "@/api";
import { Button } from "@/components/ui/button";
import {
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import useAddFileSourceApi from "@/hooks/api/useAddFileSourceApi";
import useUpdateFileSourceApi from "@/hooks/api/useUpdateFileSourceApi";
import { useEffect, useState, useCallback, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { useDropzone } from "react-dropzone";
import { UploadIcon } from "lucide-react";
import useFileStatus from "@/hooks/useFileStatus";
import { useToast } from "@/hooks/use-toast";

interface UploadFileDialogProps {
  knowledge?: Readonly<Knowledge> | null;
  onClose: () => void;
  resetSelectedFiles: boolean;
}

type UploadStatus = "idle" | "uploading" | "success" | "error";

// If providing knowledge call update file source otherwise upload new file
export default function UploadFileDialog({
  knowledge,
  onClose,
  resetSelectedFiles,
}: Readonly<UploadFileDialogProps>) {
  const onDrop = useCallback((acceptedFiles: SetStateAction<File[] | null>) => {
    setFiles(acceptedFiles);
  }, []);
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const { handleUpdateFileSource } = useUpdateFileSourceApi();
  const { handleAddFileSource } = useAddFileSourceApi();
  const { registerFiles } = useFileStatus();

  const { t } = useTranslation();
  const { toast } = useToast();

  const [updateMode] = useState<boolean>(knowledge !== null);

  const [files, setFiles] = useState<File[] | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");

  useEffect(() => {
    if (resetSelectedFiles) {
      setFiles(null);
    }
  }, [resetSelectedFiles]);

  useEffect(() => {
    if (status === "success") {
      // Close the dialog after a short delay to allow the user to see the success state
      const timer = setTimeout(() => {
        setTimeout(() => {
          setStatus("idle");
          setFiles(null);
          onClose();
        }, 10);
      }, 1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [status, onClose]);

  //handles the file updating
  async function handleFileUpload() {
    if (!files) {
      console.error("Try to upload/update files, but no files provided");
      return;
    }
    setStatus("uploading");

    // Remove white spaces from file names
    let removedWhiteSpaces = false;
    const cleanedFiles: File[] = files.map((file) => {
      if (file.name.includes(" ")) {
        removedWhiteSpaces = true;
        return new File([file], file.name.replace(/ /g, "_"), {
          type: file.type,
        });
      }
      return file;
    });

    // If white spaces were removed, show a toast
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (removedWhiteSpaces) {
      toast({
        title: t("knowledgePage.uploadFileDialog.whiteSpaces"),
      });
    }

    // If knowledge provided call update file source
    if (updateMode) {
      if (!knowledge?.id) {
        console.error("Try to update file, no knowledge id provided");
        setStatus("error");
        return;
      }
      await handleUpdateFileSource(knowledge.id, cleanedFiles[0]);
      await registerFiles([knowledge.id]);
    } else {
      const fileId = await handleAddFileSource(cleanedFiles);
      if (fileId) await registerFiles(fileId);
    }
    setStatus("success");
    setFiles(null);
  }

  const getButtonText = () => {
    if (files) {
      return t("knowledgePage.uploadFileDialog.fileSelected", {
        count: files.length,
      });
    }
    return updateMode
      ? t("knowledgePage.uploadFileDialog.selectFile")
      : t("knowledgePage.uploadFileDialog.selectFiles");
  };

  const getUploadedFileText = () => {
    if (files && files.length > 0) {
      return files.map((file) => file.name).join(", ");
    }
    return null;
  };

  return (
    <DialogPortal>
      <DialogOverlay className="fixed inset-0 z-50 bg-black bg-opacity-30 backdrop-blur-sm" />
      <DialogContent className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-lg transform -translate-x-1/2 -translate-y-1/2 gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg">
        <DialogTitle>
          {updateMode
            ? t("knowledgePage.uploadFileDialog.update")
            : t("knowledgePage.uploadFileDialog.upload")}
        </DialogTitle>
        <DialogDescription>
          <span
            {...getRootProps()}
            className="block border-dashed border-2 p-6 text-center text-(--muted) border-(--muted) hover:text-primary hover:border-primary cursor-pointer"
          >
            <input {...getInputProps()} multiple={!updateMode} />
            <UploadIcon className="inline pr-0 scale-150" />
            <span className="inline pl-4 text-2xl">{getButtonText()}</span>
          </span>
          <span className="pt-5">{getUploadedFileText()}</span>
        </DialogDescription>
        <DialogFooter>
          {status === "idle" && (
            <Button
              disabled={!files}
              size="sm"
              className="ml-auto gap-1.5 "
              onClick={() => void handleFileUpload()}
            >
              {updateMode
                ? t("knowledgePage.uploadFileDialog.update")
                : t("knowledgePage.uploadFileDialog.upload")}
            </Button>
          )}
          {status === "uploading" && <Spinner />}
          {status === "success" && (
            <span className="text-green-500">
              {t("knowledgePage.uploadFileDialog.success")}
            </span>
          )}
          {status === "error" && (
            <span className="text-red-500">
              {t("knowledgePage.uploadFileDialog.error")}
            </span>
          )}
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  );
}
