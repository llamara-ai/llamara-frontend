import {useEffect, useState} from 'react';
import { UserInfoDTO, login } from '@/api';
import { useToast } from '../use-toast';
import { useCache } from '@/services/CacheService';



interface UseLoginApiResponse {
    userInfo: UserInfoDTO | undefined | null;
    loginUser: () => Promise<UserInfoDTO | null | undefined>;
    loading: boolean;
    resetUserInfo: () => void;
    error: string | null;
}

// UserInfoDTO is undefined if request is not done yet, loading indicates
// is null if rest return 401, so user is not logged in
// return UserInfoDTO if user is logged in
export default function useLoginApi() : UseLoginApiResponse {
    const { toast } = useToast();
    const { getCache, setCache } = useCache<UserInfoDTO | null | undefined>();
    
    const [userInfo, setUserInfo] = useState<UserInfoDTO | null | undefined>(undefined);
    const [error, setError] = useState<string | null>(null);
    const [ loading, setLoading ] = useState<boolean>(false);

    useEffect(() => {
        const cachedUserInfo = getCache('userInfo');
        console.log(cachedUserInfo)

        if (cachedUserInfo) {
            setUserInfo(cachedUserInfo);
        }
        else if (!loading) {
            console.log("reload user info")
            loginUser();
        }
    }, []);

    const loginUser = async (): Promise<UserInfoDTO | null | undefined> => {
        setLoading(true);
        try {
            const response = await login<false>()
            if (response.response.status === 401) {
                setCache('userInfo', null, null);
                setUserInfo(null);
                setLoading(false);
                return null;
            }

            setUserInfo(response.data);
            setCache('userInfo', response.data, null);
            setLoading(false);
            return response.data;

        } catch (error: unknown) {
            if (error instanceof Error) {
                toast({
                    variant: "destructive", 
                    title: "Failed fetch user information", 
                    description: error.message,
                });
                setError(error.message);
            }
        }
        setLoading(false);
        setUserInfo(null);
        return null;
    }

    const resetUserInfo = () => {
        setCache('userInfo', undefined, null);
        setUserInfo(undefined);
    }

    return {userInfo, loginUser, resetUserInfo, loading, error};
}
