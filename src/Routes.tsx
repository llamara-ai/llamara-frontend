import {
  BrowserRouter,
  Navigate,
  Route,
  Routes as RoutesReact,
} from "react-router-dom";
import LoginView from "./views/security/LoginView";
import Knowledge from "./views/knowledge/Knowledge";
import Chatbot from "./views/chatbot/Chatbot";
import PrivateRoute from "./PrivateRoute";
import { useSetApiClientConfig } from "./services/ConfigApiClientService";
import { useAppContext } from "@/services/AppContextService.tsx";
import { useSetupUserContext } from "@/services/UserContextService.tsx";
import { Overlay } from "./views/overlays/Overlay";
import GetSessionsProvider from "./services/GetSessionsService";
import GetKnowledgeListProvider from "./services/GetKnowledgeListService";

function Routes() {
  const { securityConfig } = useAppContext();

  // Configure the API client with provided token
  useSetApiClientConfig();

  useSetupUserContext();

  return (
    <BrowserRouter>
      <RoutesReact>
        <Route
          path="/"
          element={
            <PrivateRoute
              forceRedirect={securityConfig.anonymousUserEnabled === false}
            />
          }
        >
          <Route
            path="/"
            index
            element={
              <GetSessionsProvider>
                <Overlay>
                  <Chatbot />
                </Overlay>
              </GetSessionsProvider>
            }
          />
        </Route>
        <Route path="/login" element={<LoginView />} />
        <Route
          path="/knowledge"
          element={<PrivateRoute forceRedirect={true} />}
        >
          <Route
            path="/knowledge"
            index
            element={
              <GetSessionsProvider>
                <GetKnowledgeListProvider>
                  <Overlay disableAddSession={true}>
                    <Knowledge />
                  </Overlay>
                </GetKnowledgeListProvider>
              </GetSessionsProvider>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace={true} />} />
      </RoutesReact>
    </BrowserRouter>
  );
}

export default Routes;
