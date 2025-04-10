import { useState } from "react";
import { createSession, Session } from "@/api";
import { toast } from "sonner";

interface UseCreateSessionApiResponse {
  session: Session;
  handleCreateSession: () => Promise<Session | null>;
  error: string | null;
}

export default function useCreateSessionApi(): UseCreateSessionApiResponse {
  const [session, setSession] = useState<Session>({});
  const [error, setError] = useState<string | null>(null);

  const handleCreateSession = async (): Promise<Session | null> => {
    try {
      const response = await createSession();
      const session = response.data;

      if (session) {
        setError(null);
        setSession(session);
        return session;
      } else {
        setError("Failed to create session. The response was undefined.");
        toast.error("Failed to create session", {
          description: "The response was undefined",
        });
      }
      // @ts-expect-error except an error from createSession
    } catch (error: Error) {
      toast.error("Failed to create session", {
        description: error.message, // eslint-disable-line
      });
      setError(error.message); // eslint-disable-line
    }
    return null;
  };

  return { session, handleCreateSession, error };
}
