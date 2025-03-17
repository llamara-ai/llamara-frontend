import {
  FC,
  createContext,
  ReactNode,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { configuration, SecurityInfoDto } from "@/api";
import { TAuthConfig } from "react-oauth2-code-pkce";
import { toast } from "@/hooks/use-toast.ts";
import { pdfjs } from "react-pdf";

export interface AppContext {
  ready: boolean;
  pdfWorkerReady: boolean;
  securityConfig: SecurityInfoDto;
  authConfig: TAuthConfig;
  imprintUrl: string | null;
  privacyPolicyUrl: string | null;
}

const AppContext = createContext<AppContext | undefined>(undefined);

export const AppContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [ready, setReady] = useState(false);
  const [securityConfig, setSecurityConfig] = useState({} as SecurityInfoDto);
  const [authConfig, setAuthConfig] = useState({} as TAuthConfig);
  const [imprintUrl, setImprintUrl] = useState<string | null>(null);
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState<string | null>(null);
  const [pdfWorkerReady, setPdfWorkerReady] = useState(false);

  useEffect(() => {
    void init();
  }, []);

  const init = async () => {
    try {
      const [workerResponse, configResponse] = await Promise.all([
        fetch("/pdf.worker.mjs"),
        configuration(),
      ]);

      // Handle configResponse, so setUp AppContext
      if (!configResponse.data?.security || !configResponse.data.oidc) {
        throw new Error("Failed to get configuration");
      }
      setSecurityConfig(configResponse.data.security);
      const oidcInfo = configResponse.data.oidc;
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
      if (configResponse.data.imprintLink) {
        setImprintUrl(configResponse.data.imprintLink);
      }
      if (configResponse.data.privacyPolicyLink) {
        setPrivacyPolicyUrl(configResponse.data.privacyPolicyLink);
      }
      setReady(true);

      // Handle workerResponse: Process PDF worker file
      const workerCode = await workerResponse.text();
      const blob = new Blob([workerCode], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      setPdfWorkerReady(true);
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Failed to connect to server",
          description: error.message,
        });
      }
    }
  };

  const value = useMemo(
    () => ({
      ready,
      securityConfig,
      authConfig,
      imprintUrl,
      privacyPolicyUrl,
      pdfWorkerReady,
    }),
    [
      ready,
      securityConfig,
      authConfig,
      imprintUrl,
      privacyPolicyUrl,
      pdfWorkerReady,
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
