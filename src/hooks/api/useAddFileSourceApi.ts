import { addFileSource, Uuid } from "@/api";
import { useState } from "react";
import { useToast } from "../use-toast";

interface UseAddFileSourceApiResponse {
  fileUUIDs: Uuid[];
  handleAddFileSource: (files: (Blob | File)[]) => Promise<string[] | null>;
  error: string | null;
}

export default function useAddFileSourceApi(): UseAddFileSourceApiResponse {
  const [fileUUIDs, setFileUUIDs] = useState<Uuid[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAddFileSource = async (files: (Blob | File)[]) => {
    const options = {
      body: {
        files: files,
      },
    };
    try {
      const response = await addFileSource(options);
      if (response.data) {
        setError(null);
        setFileUUIDs(response.data);
        return response.data;
      } else {
        throw new Error("Request was undefined");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Failed to add files to the knowledge!",
          description: error.message,
        });
        setError(error.message);
      }
    }
    return null;
  };

  return { fileUUIDs, handleAddFileSource, error };
}
