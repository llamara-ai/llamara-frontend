import { useEffect, useState } from "react";
import { getKnowledgeFile } from "@/api";
import { toast } from "sonner";

type FileData = Blob | File | undefined;
interface UseGetKnowledgeFileApiProps {
  uuid: string;
}

interface UseGetKnowledgeFileApiResponse {
  fileData: FileData;
  error: string | null;
}

export default function useGetKnowledgeFileApi({
  uuid,
}: UseGetKnowledgeFileApiProps): UseGetKnowledgeFileApiResponse {
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<Blob | File | undefined>(undefined);
  const { requestKnowledgeFileApi, error: errorFunction } =
    useGetKnowledgeFileApiFunction();

  useEffect(() => {
    requestKnowledgeFileApi(uuid)
      .then((fileData) => {
        setFileData(fileData);
      })
      .catch((error) => {
        if (error instanceof Error) {
          setError(error.message);
        }
      });
  }, [uuid]);
  return {
    fileData,
    error:
      error || errorFunction ? (error ?? "") + (errorFunction ?? "") : null,
  };
}

export function useGetKnowledgeFileApiFunction() {
  const [error, setError] = useState<string | null>(null);

  const requestKnowledgeFileApi = async (uuid: string): Promise<FileData> => {
    const options = {
      path: {
        id: uuid,
      },
    };
    try {
      const response = await getKnowledgeFile(options);
      if (!response.data) {
        throw new Error("Response was undefined, so no data was provided");
      }
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error("Failed to fetch knowledge file", {
          description: error.message,
        });
      }
      return undefined;
    }
  };
  return { requestKnowledgeFileApi, error };
}
