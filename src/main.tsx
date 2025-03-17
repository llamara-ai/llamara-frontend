import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Routes from "./Routes";
import { init as initLanguage } from "@/locales/Languages";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./components/theme-provider";
import CacheProvider from "./services/CacheService";
import LoadingView from "./views/loading/Loading";
import { AuthProvider } from "react-oauth2-code-pkce";
import { LoadingProvider } from "./services/LoadingService";
import LoadingOverlay from "./components/loading-overlay";
import {
  AppContextProvider,
  useAppContext,
} from "@/services/AppContextService.tsx";
import { UserContextProvider } from "@/services/UserContextService.tsx";

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppContextProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <CacheProvider>
          <LoadingProvider>
            <InitComponent />
            <App />
            <Toaster />
            <LoadingOverlay />
          </LoadingProvider>
        </CacheProvider>
      </ThemeProvider>
    </AppContextProvider>
  </StrictMode>,
);

function InitComponent() {
  initLanguage();
  return null;
}

function App() {
  const { ready, authConfig } = useAppContext();

  // Wait for app context to be ready
  if (!ready) {
    return <LoadingView />;
  }

  return (
    <AuthProvider authConfig={authConfig}>
      <UserContextProvider>
        <Routes />
      </UserContextProvider>
    </AuthProvider>
  );
}
