import { useState} from 'react';
import { createSession, Session } from '@/api';
import { useToast } from '../use-toast';

interface UseCreateSessionApiResponse {
    session: Session, 
    handleCreateSession: () => Promise<Session | null>;
    error: string | null;
}


export default function useCreateSessionApi(): UseCreateSessionApiResponse {
    const [session, setSession] = useState<Session>({});
    const { toast } = useToast();
    const [error, setError] = useState<string | null>(null);

    const handleCreateSession = async () : Promise<Session | null> => {
        try {
            const response = await createSession();            
            const newSessionId = response.data!;
            
            if (newSessionId) {
                setSession(newSessionId);
                return newSessionId;
            } else {
                setError("Failed to create session. The response was undefined.");
                toast({
                    variant: "destructive", 
                    title: "Failed to create session", 
                    description: "The response was undefined",
                });
            }
        } catch (error:any) {
            toast({
                variant: "destructive", 
                title: "Failed to create session", 
                description: error.message,
            });
            setError(error.message);
        }
        return null;
    };


    return { session, handleCreateSession, error };
}