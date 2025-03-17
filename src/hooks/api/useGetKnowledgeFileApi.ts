import { useState } from "react";
import { getKnowledgeFile } from "@/api";
import { useToast } from "../use-toast";

interface UseGetKnowledgeFileApiProps {
  uuid: string;
}

interface UseGetKnowledgeFileApiResponse {
  handleGetKnowledgeFile: () => Promise<void>;
  error: string | null;
}

//TODO: Response type is unknown, maybe need to be called in knew tab to download file, but not sure about this
export default function useGetKnowledgeFileApi({
  uuid,
}: UseGetKnowledgeFileApiProps): UseGetKnowledgeFileApiResponse {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleGetKnowledgeFile = async () => {
    const options = {
      path: {
        id: uuid,
      },
    };

    getKnowledgeFile(options)
      .then(() => {
        setError(null);
        //TODO: Response type is unkown
      })
      .catch((error: Error) => {
        toast({
          variant: "destructive",
          title: "Failed to fetch knowledge file",
          description: error.message,
        });
        setError(error.message);
      });
  };

  return { handleGetKnowledgeFile, error };
}
