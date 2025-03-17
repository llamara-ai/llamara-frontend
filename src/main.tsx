import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Routes from './Routes';
import {init as initLanguage} from "@/locales/Languages";
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/theme-provider';
import CacheProvider from './services/CacheService';
import LoadingView from './views/loading/Loading';
import { AuthProvider, TAuthConfig } from 'react-oauth2-code-pkce';
import useGetBackendInformation from './hooks/api/useGetBackendInformation';
import { LoadingProvider } from './services/LoadingService';
import LoadingOverlay from './components/loading-overlay';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <CacheProvider>
        <LoadingProvider> 
          <App />
          <Toaster />
          <LoadingOverlay />
        </LoadingProvider>
      </CacheProvider>
    </ThemeProvider>
  </StrictMode>
)


function App() {
  initLanguage();

  const {isAnonymousMode, oidcInfo} = useGetBackendInformation();    

  // Wait for backend information
  if (isAnonymousMode === undefined || oidcInfo === undefined) {
      return <LoadingView/>;
  }

  // Check if backend information is reachable
  if (oidcInfo.authServerUrl === undefined 
      || oidcInfo.clientId === undefined
      || oidcInfo.authorizationPath === undefined
      || oidcInfo.logoutPath === undefined
      || oidcInfo.tokenPath === undefined) {
      return <LoadingView error={"Server not reachable"}/>;
  }

  const authConfig: TAuthConfig = {
    clientId: oidcInfo.clientId,
    authorizationEndpoint: oidcInfo.authServerUrl + oidcInfo.authorizationPath,
    logoutEndpoint: oidcInfo.authServerUrl + oidcInfo.logoutPath,
    tokenEndpoint: oidcInfo.authServerUrl + oidcInfo.tokenPath,
    redirectUri: window.location.origin,
    scope: "profile openid microprofile-jwt", 
    decodeToken: true,
    autoLogin: false
  }

  return (
    <AuthProvider authConfig={authConfig}>
      <Routes/>
    </AuthProvider>
  );
}