import { useState } from 'react';
import { deleteKnowledge } from '@/api';
import { useToast } from '../use-toast';


interface UseDeleteKnowledgeApiProps {
    uuid: string;
}

interface UseDeleteKnowledgeApiResponse {
    handleDeleteKnowledge: () => Promise<void>;
    error: string | null;
}

export default function useDeleteKnowledgeApi({ uuid } : UseDeleteKnowledgeApiProps) : UseDeleteKnowledgeApiResponse {
    const { toast } = useToast();
    const [error, setError] = useState<string | null>(null);
    
    
    const handleDeleteKnowledge = async () => {
        const options = {
            path: {
                id: uuid
            }
        }

        deleteKnowledge(options).then(() => {
            console.log("Deleted knowledge with id:", uuid);
        }).catch((error) => {
            toast({
                variant: "destructive", 
                title: "Failed to delete knowledge", 
                description: error.message,
            });
            setError(error.message);
        });
    };

    return {handleDeleteKnowledge, error};
}