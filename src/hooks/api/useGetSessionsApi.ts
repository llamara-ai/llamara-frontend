import {useEffect, useState} from 'react';
import { getSessions, Session } from '@/api';
import { useToast } from '../use-toast';
import { useCache } from '@/services/CacheService';

interface UseGetSessionsApiResponse {
    sessions: Session[];
    error: string | null;
}

export default function useGetSessionsApi() : UseGetSessionsApiResponse {
    const { toast } = useToast();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [error, setError] = useState<string | null>(null);
    const { getCache, setCache } = useCache<Session[]>();
    const [ loading, setLoading ] = useState<boolean>(false);

    useEffect(() => {
        const cachedSessions = getCache('sessions');
        if (cachedSessions) {
            setSessions(cachedSessions);
        } else if (!loading) {
            setLoading(true);
            getSessions().then((response) => {
                if (response.data) {
                    setSessions(response.data);
                    setCache('sessions', response.data, 10);
                } else {
                    setSessions([]);
                }
            }).catch((error) => {
                toast({
                    variant: "destructive",
                    title: "Failed to fetch sessions",
                    description: error.message,
                });
                setError(error.message);
            }).finally(() => {
                setLoading(false)
            });
        }
    }, []);

    return {sessions, error};
}