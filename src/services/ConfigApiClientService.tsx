import { client } from "@/api";
import { AuthContext, type IAuthContext } from 'react-oauth2-code-pkce'
import { useContext, useEffect } from "react";

export const useSetApiClientConfig = () => {
    const { token }: IAuthContext = useContext(AuthContext)
    
    useEffect(() => {
      if (token) {
        console.log("token changed")
        client.setConfig({
          headers: {
            Authorization: 'Bearer ' + token,
          },
        });
      }
    }, [token])
    
}