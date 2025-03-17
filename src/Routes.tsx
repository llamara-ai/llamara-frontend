import {
  BrowserRouter,
  Navigate,
  Route,
  Routes as RoutesReact,
} from "react-router-dom";
import LoginView from "./views/security/LoginView";
import Upload from "./views/upload/Upload";
import Chatbot from "./views/chatbot/Chatbot";
import PrivateRoute from "./PrivateRoute";
import { useSetApiClientConfig } from "./services/ConfigApiClientService";
import { useAppContext } from "@/services/AppContextService.tsx";
import { useSetupUserContext } from "@/services/UserContextService.tsx";

function Routes() {
  const { securityConfig } = useAppContext();

  // Configure the API client with provided token
  useSetApiClientConfig();

  useSetupUserContext();

  return (
    <BrowserRouter>
      <RoutesReact>
        {securityConfig.anonymousUserEnabled ? (
          <Route path="/" index element={<Chatbot />} />
        ) : (
          <Route path="/" element={<PrivateRoute />}>
            <Route path="/" index element={<Chatbot />} />
          </Route>
        )}
        <Route path="/login" element={<LoginView />} />
        <Route path="/upload" element={<PrivateRoute />}>
          <Route path="/upload" index element={<Upload />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace={true} />} />
      </RoutesReact>
    </BrowserRouter>
  );
}

export default Routes;
