import { useState } from 'react';
import { updateFileSource } from '@/api';
import { useToast } from '../use-toast';

interface UseUpdateFileSourceApiProps {
    uuid: string;
    file: (Blob | File);
}

interface UseUpdateFileSourceApiResponse {
    handleUpdateFileSource: () => Promise<void>;
    error: string | null;
}

export default function useUpdateFileSourceApiApi({uuid, file} : UseUpdateFileSourceApiProps) : UseUpdateFileSourceApiResponse{
    const { toast } = useToast();
    const [error, setError] = useState<string | null>(null);

    
    const handleUpdateFileSource = async () => {
        const options = {
            body: {
                    file: file
                },
                path: {
                    id: uuid
                }
        }

        updateFileSource(options).then((response) => {
            console.log("Updated knowledge:", response);
        }).catch((error) => {
            toast({
                variant: "destructive", 
                title: "Failed to update knowledge", 
                description: error.message,
            });
            setError(error.message);
        });
        
    };

    return {handleUpdateFileSource, error};
}