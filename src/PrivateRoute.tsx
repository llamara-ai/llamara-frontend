import { useContext, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import LoadingView from "./views/loading/Loading";
import { AuthContext, IAuthContext } from "react-oauth2-code-pkce";
import { useUserContext } from "@/services/UserContextService.tsx";

interface PrivateRoute {
  forceRedirect: boolean;
}

export default function PrivateRoute(forceRedirect: Readonly<PrivateRoute>) {
  const navigate = useNavigate();
  const { ready, user } = useUserContext();
  const { loginInProgress }: IAuthContext = useContext(AuthContext);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (
      user === null &&
      window.location.pathname !== "/login" &&
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      forceRedirect
    ) {
      void navigate("/login");
    }
  }, [ready]);

  // userInfo is not ready at the moment
  if (!ready || loginInProgress) {
    return <LoadingView />;
  }

  // user is logged in
  return user !== null && <Outlet />;
}
