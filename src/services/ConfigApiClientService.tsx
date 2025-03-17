import { AuthContext, type IAuthContext } from "react-oauth2-code-pkce";
import { useContext, useEffect } from "react";
import { client } from "@/api/client.gen";

export const useSetApiClientConfig = () => {
  const { token }: IAuthContext = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      client.setConfig({
        headers: {
          Authorization: "Bearer " + token,
        },
      });
    }
  }, [token]);
};
