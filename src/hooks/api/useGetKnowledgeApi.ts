import {useEffect, useState} from 'react';
import { Knowledge, getKnowledge } from '@/api';
import { useToast } from '../use-toast';


interface UseGetKnowledgeApiProps {
    uuid: string;
}

interface UseGetKnowledgeApiResponse {
    knowledge: Knowledge | undefined;
    error: string | null;
}


// TODO: Maybe implement like return async function to handle getKnowledge like in useAddFileSourceApi
export default function useGetKnowledgeApi({uuid}: UseGetKnowledgeApiProps) : UseGetKnowledgeApiResponse {
    const { toast } = useToast();
    const [knowledge, setKnowledge] = useState<Knowledge>();
    const [error, setError] = useState<string | null>(null);

    
    useEffect(() => {
        const options = {
            path: {
                id: uuid
            }
        }
        getKnowledge(options).then((response) => {
            setKnowledge(response.data);
        }).catch((error) => {
            toast({
                variant: "destructive", 
                title: "Failed to fetch knowledge", 
                description: error.message,
            });
            setError(error.message);
        });
    }, [uuid]);
    

    return {knowledge, error};
}