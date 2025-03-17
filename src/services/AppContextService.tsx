import {
  FC,
  createContext,
  ReactNode,
  useContext,
  useState,
  useMemo,
} from "react";
import { configuration, SecurityInfoDto } from "@/api";
import { TAuthConfig } from "react-oauth2-code-pkce";
import { toast } from "@/hooks/use-toast.ts";
import { pdfjs } from "react-pdf";

export interface AppContext {
  ready: boolean;
  setReady: (ready: boolean) => void;
  pdfWorkerReady: boolean;
  setPdfWorkerReady: (ready: boolean) => void;
  securityConfig: SecurityInfoDto;
  setSecurityConfig: (security: SecurityInfoDto) => void;
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
  const [securityConfig, setSecurityConfig] = useState({} as SecurityInfoDto);
  const [authConfig, setAuthConfig] = useState({} as TAuthConfig);
  const [imprintUrl, setImprintUrl] = useState<string | null>(null);
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState<string | null>(null);
  const [pdfWorkerReady, setPdfWorkerReady] = useState(false);

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
      pdfWorkerReady,
      setPdfWorkerReady,
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
      pdfWorkerReady,
      setPdfWorkerReady,
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
    setPdfWorkerReady,
    pdfWorkerReady,
  } = useAppContext();

  if (ready && pdfWorkerReady) {
    return;
  }

  fetch("/pdf.worker.mjs")
    .then((response) => response.text())
    .then((workerCode) => {
      const blob = new Blob([workerCode], { type: "application/javascript" });
      const workerUrl = URL.createObjectURL(blob);
      pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      setPdfWorkerReady(true);
    })
    .catch((error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to get pdf worker script",
        description: error.message,
      });
    });

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
