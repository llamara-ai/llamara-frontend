import { useState } from "react";
import { updateFileSource } from "@/api";
import { useToast } from "../use-toast";

interface UseUpdateFileSourceApiResponse {
  handleUpdateFileSource: (uuid: string, file: Blob | File) => Promise<void>;
  error: string | null;
}

export default function useUpdateFileSourceApiApi(): UseUpdateFileSourceApiResponse {
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/require-await
  const handleUpdateFileSource = async (uuid: string, file: Blob | File) => {
    const options = {
      body: {
        file: file,
      },
      path: {
        id: uuid,
      },
    };

    updateFileSource(options)
      .then((response) => {
        setError(null);
        console.log("Updated knowledge:", response);
      })
      .catch((error: Error) => {
        toast({
          variant: "destructive",
          title: "Failed to update knowledge",
          description: error.message,
        });
        setError(error.message);
      });
  };

  return { handleUpdateFileSource, error };
}
