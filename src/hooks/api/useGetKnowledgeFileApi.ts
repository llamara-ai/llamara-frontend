import { useEffect, useState } from "react";
import { getKnowledgeFile } from "@/api";
import { useToast } from "../use-toast";
import { combineErrors } from "@/lib/combineErrors";

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
  const { toast } = useToast();
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
  }, [uuid, toast]);
  return { fileData, error: combineErrors([error, errorFunction]) };
}

export function useGetKnowledgeFileApiFunction() {
  const { toast } = useToast();
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
        toast({
          variant: "destructive",
          title: "Failed to fetch knowledge file",
          description: error.message,
        });
      }
      return undefined;
    }
  };
  return { requestKnowledgeFileApi, error };
}
