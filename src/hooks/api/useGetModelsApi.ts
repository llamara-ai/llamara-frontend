import {useEffect, useState} from 'react';
import { ChatModelContainer, getModels } from '@/api';
import { useToast } from '../use-toast';
import { useCache } from '@/services/CacheService';



interface UseAvailableModelsResponse {
    models: ChatModelContainer[];
    error: string | null;
}


export default function useAvailableModels() : UseAvailableModelsResponse {
    const { toast } = useToast();
    const [models, setModels] = useState<ChatModelContainer[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [ loading, setLoading ] = useState<boolean>(false);
    const { getCache, setCache } = useCache<ChatModelContainer[]>();
    
    useEffect(() => {
        const cachedModels = getCache('models');
        if (cachedModels) {
            setModels(cachedModels);
        } else if (!loading) {
            setLoading(true);
            getModels().then((response) => {
                if (response.data) {
                    setCache('models', response.data, 10);
                    setModels(response.data);
                } else {
                    setCache('models', [], 10);
                    setModels([]);
                }
            }).catch((error) => {
                toast({
                    variant: "destructive", 
                    title: "Failed to fetch available models", 
                    description: error.message,
                });
                setError(error.message);
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [loading]);
    

    return {models, error};
}