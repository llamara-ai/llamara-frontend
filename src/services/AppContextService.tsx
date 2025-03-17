import {
  FC,
  createContext,
  ReactNode,
  useContext,
  useState,
  useMemo,
} from "react";
import { configuration, SecurityInfoDTO } from "@/api";
import { TAuthConfig } from "react-oauth2-code-pkce";
import { toast } from "@/hooks/use-toast.ts";

export interface AppContext {
  ready: boolean;
  setReady: (ready: boolean) => void;

  securityConfig: SecurityInfoDTO;
  setSecurityConfig: (security: SecurityInfoDTO) => void;
  authConfig: TAuthConfig;
  setAuthConfig: (authConfig: TAuthConfig) => void;
  imprintUrl: string | null;
  setImprintUrl: (imprintUrl: string | null) => void;
  privacyPolicyUrl: string | null;
  setPrivacyPolicyUrl: (privacyPolicyUrl: string | null) => void;
}

const AppContext = createContext<AppContext | undefined>(undefined);

export const AppContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [ready, setReady] = useState(false);
  const [securityConfig, setSecurityConfig] = useState({} as SecurityInfoDTO);
  const [authConfig, setAuthConfig] = useState({} as TAuthConfig);
  const [imprintUrl, setImprintUrl] = useState<string | null>(null);
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      ready,
      setReady,
      securityConfig,
      setSecurityConfig,
      authConfig,
      setAuthConfig,
      imprintUrl,
      setImprintUrl,
      privacyPolicyUrl,
      setPrivacyPolicyUrl,
    }),
    [
      ready,
      setReady,
      securityConfig,
      setSecurityConfig,
      authConfig,
      setAuthConfig,
      imprintUrl,
      setImprintUrl,
      privacyPolicyUrl,
      setPrivacyPolicyUrl,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within a AppContextProvider");
  }
  return context;
};

export function useInitAppContext() {
  const {
    ready,
    setReady,
    setSecurityConfig,
    setAuthConfig,
    setImprintUrl,
    setPrivacyPolicyUrl,
  } = useAppContext();

  if (ready) {
    return;
  }

  configuration()
    .then((response) => {
      if (!response.data?.security || !response.data.oidc) {
        throw new Error("Failed to get configuration");
      }
      setSecurityConfig(response.data.security);

      const oidcInfo = response.data.oidc;
      if (
        oidcInfo.authServerUrl === undefined ||
        oidcInfo.clientId === undefined ||
        oidcInfo.authorizationPath === undefined ||
        oidcInfo.logoutPath === undefined ||
        oidcInfo.tokenPath === undefined
      ) {
        throw new Error("Failed to get configuration");
      }

      const authConfig: TAuthConfig = {
        clientId: oidcInfo.clientId,
        authorizationEndpoint:
          oidcInfo.authServerUrl + oidcInfo.authorizationPath,
        logoutEndpoint: oidcInfo.authServerUrl + oidcInfo.logoutPath,
        tokenEndpoint: oidcInfo.authServerUrl + oidcInfo.tokenPath,
        redirectUri: window.location.origin,
        scope: "profile openid microprofile-jwt",
        decodeToken: true,
        autoLogin: false,
      };

      setAuthConfig(authConfig);

      if (response.data.imprintLink) {
        setImprintUrl(response.data.imprintLink);
      }
      if (response.data.privacyPolicyLink) {
        setPrivacyPolicyUrl(response.data.privacyPolicyLink);
      }

      setReady(true);
    })

    .catch((error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to connect to server",
        description: error.message,
      });
    });
}
