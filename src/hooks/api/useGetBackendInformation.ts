import { useEffect, useState } from 'react';
import { configuration, InfoDTO, OidcInfoDTO } from '@/api';
import { useToast } from '../use-toast';
import { useCache } from '@/services/CacheService';

interface UseIsAnonymousModeApiResponse {
    isAnonymousMode: boolean | undefined;
    oidcInfo: OidcInfoDTO | undefined;
    loading: boolean;
    error: string | null;
}


export default function useGetBackendInformation(): UseIsAnonymousModeApiResponse {
    const { toast } = useToast();
    const [ isAnonymousMode, setIsAnonymousMode ] = useState<boolean | undefined>(undefined);
    const [ oidcInfo, setOidcInfo ] = useState<OidcInfoDTO | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [ loading, setLoading ] = useState<boolean>(false);
    const { getCache, setCache } = useCache<InfoDTO | undefined>();

    useEffect(() => {
        const fetchInfos = async () => {
            setLoading(true);
            try {
                const response = await configuration();
                if (!response.data?.security) {
                    throw new Error("No data returned from backend");
                }
                setOidcInfo(response.data.oidc);
                setIsAnonymousMode(response.data.security.anonymousUserEnabled);
                setCache('backendInfo', response.data, null);
                setLoading(false);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    toast({
                        variant: "destructive", 
                        title: "Failed to check if anonymous mode is active", 
                        description: error.message,
                    });
                    setError(error.message);
                }
                setLoading(false);
            }
        };
        const cachedInfo = getCache('backendInfo');
        if (cachedInfo?.security) {
            setOidcInfo(cachedInfo.oidc);
            setIsAnonymousMode(cachedInfo.security.anonymousUserEnabled);
        } else if (!loading) {
            fetchInfos();
        }
    }, []);

    return { isAnonymousMode, oidcInfo, loading, error };
    
}