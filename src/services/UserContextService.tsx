import {
  FC,
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { login, UserInfoDto } from "@/api";
import { AuthContext } from "react-oauth2-code-pkce";
import { toast } from "sonner";
import { createClient } from "@/api/client";

export interface UserContext {
  ready: boolean;
  setReady: (ready: boolean) => void;

  user: UserInfoDto | null;
  setUser: (info: UserInfoDto | null) => void;
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
}

export type UserRole = "admin" | "user";

const UserContext = createContext<UserContext | undefined>(undefined);

export const UserContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserInfoDto | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);

  const value = useMemo(
    () => ({
      loading,
      setLoading,
      ready,
      setReady,
      user,
      setUser,
      role,
      setRole,
    }),
    [loading, setLoading, ready, setReady, user, setUser, role, setRole],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};

export const useSetupUserContext = () => {
  const { token, loginInProgress } = useContext(AuthContext);
  const { setReady, setUser, setRole } = useUserContext();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (loginInProgress || loading) {
      return;
    }

    setLoading(true);

    const client = createClient();
    if (token) {
      client.setConfig({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    login({
      client,
    })
      .then((response) => {
        if (response.response.status === 401) {
          setUser(null);
          setReady(true);
          setLoading(false);
          return;
        }

        if (!response.data) {
          throw new Error("Failed to get user info");
        }
        setUser(response.data[200]);
        setRole(getUserRole(response.data[200].roles));
        setReady(true);
        setLoading(false);
      })

      .catch((error: Error) => {
        setLoading(false);
        toast.error("Failed to connect to server", {
          description: error.message,
        });
      });
  }, [token, loginInProgress]);
};

function getUserRole(roles: string[] | undefined): UserRole | null {
  if (!roles) {
    return null;
  }
  if (roles.includes("admin")) {
    return "admin";
  }
  return "user";
}
