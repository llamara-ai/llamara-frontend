import { useEffect, useState } from 'react';
import { prompt } from '@/api';
import { useToast } from '../use-toast';


interface UsePromptApiProps {
    chatModelUID: string | null;
    sessionID: string | null;
    inputPrompt: string;
}

interface UsePromptApiResult {
    response: string;
    loading: boolean;
    error: string | null;	
}

export default function usePromptApi({chatModelUID, sessionID, inputPrompt}:UsePromptApiProps) : UsePromptApiResult {
    const { toast } = useToast();
    const [response, setResponse] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (inputPrompt !== '' && sessionID !== null && chatModelUID !== null) {
            const options = {
                body: inputPrompt,
                query: {
                    sessionId: sessionID,
                    uid: chatModelUID
                },
                headers: {
                    'Content-Type': 'text/plain'
                }
            }
            setLoading(true);
            prompt(options).then((responseObject) => {
                const data = responseObject.data;
                if (data) {
                    setResponse(responseObject.data);
                } else {
                    setError("No response from server");
                    toast({
                        variant: "destructive", 
                        title: "Failed to get response", 
                        description: "No response from server",
                    });
                }
            }).catch((error) => {
                setError(error.message);
                toast({
                    variant: "destructive", 
                    title: "Failed to send prompt or to get response", 
                    description: error.message,
                });
            }).finally(() => {
                setLoading(false);
            });   
        } else if  (inputPrompt !== '' && chatModelUID === null) {
            setError("No chat model selected");
            toast({
                variant: "destructive", 
                title: "No chat model selected", 
                description: "Select a chat model at the sidebar to start chatting",
            });
        } else if (inputPrompt !== ''){
            setError("Provided session id is invalid");
            toast({
                variant: "destructive", 
                title: "Failed to send prompt. Session id is invalid", 
                description: "Something went wrong. Please try again",
            });
        }
    }, [inputPrompt, sessionID, chatModelUID]);
        
    return {response, loading, error};
}