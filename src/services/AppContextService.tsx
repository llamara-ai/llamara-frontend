import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { configuration, SecurityInfoDto } from "@/api";
import { TAuthConfig } from "react-oauth2-code-pkce";
import { pdfjs } from "react-pdf";
import { toast } from "sonner";

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
      if (
        !configResponse.data?.[200].security ||
        !configResponse.data[200].oidc
      ) {
        throw new Error("Failed to get configuration");
      }
      setSecurityConfig(configResponse.data[200].security);
      const oidcInfo = configResponse.data[200].oidc;
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
      if (oidcInfo.audience != null) {
        authConfig.extraAuthParameters = {};
        authConfig.extraAuthParameters.audience = oidcInfo.audience;
      }
      setAuthConfig(authConfig);
      if (configResponse.data[200].imprintLink) {
        setImprintUrl(configResponse.data[200].imprintLink);
      }
      if (configResponse.data[200].privacyPolicyLink) {
        setPrivacyPolicyUrl(configResponse.data[200].privacyPolicyLink);
      }
      setReady(true);

      // Handle workerResponse: Process PDF worker file
      const workerCode = await workerResponse.text();
      const blob = new Blob([workerCode], { type: "application/javascript" });
      pdfjs.GlobalWorkerOptions.workerSrc = URL.createObjectURL(blob);
      setPdfWorkerReady(true);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Failed to connect to server", {
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
