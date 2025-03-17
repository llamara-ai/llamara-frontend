import { useContext, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useLoginApi from './hooks/api/useLoginApi';
import LoadingView from './views/loading/Loading';
import { AuthContext, IAuthContext } from 'react-oauth2-code-pkce';


export default function PrivateRoute () {
    const navigate = useNavigate();
    const { userInfo, loginUser, loading } = useLoginApi();
    const { loginInProgress }: IAuthContext = useContext(AuthContext);
    

    useEffect(() => {
        const fetchNewUserInfoAndRedirect = async () => {
            const userInfo = await loginUser();
            
            if (userInfo === null && window.location.pathname !== '/login') {
                navigate('/login');
            }
        }
        if (!loginInProgress) { // If login progress is finished, so fetch token is finished, then fetch user info and maybe redirect
            fetchNewUserInfoAndRedirect();
        }
        
    }, [loginInProgress]);

    



    // userInfo is not ready at the moment
    if (userInfo === undefined || loading || loginInProgress) { 
        return <LoadingView/>;
    }

    // user is logged in
    return (userInfo !== undefined && userInfo !== null) && <Outlet />;
}