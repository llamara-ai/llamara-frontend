import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Routes from "./Routes";
import { init as initLanguage } from "@/locales/Languages";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider, useTheme } from "./components/theme-provider";
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
import { SidebarProvider } from "@/components/ui/sidebar.tsx";

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
  const { theme } = useTheme();

  useEffect(() => {
    const color = theme === "dark" ? "#161618" : "#f5f5f5";

    const metaThemeColor = document.querySelector("meta[name='theme-color']");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", color);
    } else {
      const newMeta = document.createElement("meta");
      newMeta.setAttribute("name", "theme-color");
      newMeta.setAttribute("content", color);
      document.head.appendChild(newMeta);
    }
  }, [theme]);

  // Wait for app context to be ready
  if (!ready) {
    return <LoadingView />;
  }

  return (
    <AuthProvider authConfig={authConfig}>
      <UserContextProvider>
        <SidebarProvider>
          <Routes />
        </SidebarProvider>
      </UserContextProvider>
    </AuthProvider>
  );
}
