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
import { toast } from "@/hooks/use-toast.ts";
import { AuthContext } from "react-oauth2-code-pkce";
import { createClient } from "@hey-api/client-fetch";

export interface UserContext {
  ready: boolean;
  setReady: (ready: boolean) => void;

  user: UserInfoDto | null;
  setUser: (info: UserInfoDto | null) => void;
}

const UserContext = createContext<UserContext | undefined>(undefined);

export const UserContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserInfoDto | null>(null);

  const value = useMemo(
    () => ({ loading, setLoading, ready, setReady, user, setUser }),
    [loading, setLoading, ready, setReady, user, setUser],
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
  const { setReady, setUser } = useUserContext();
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
        setUser(response.data);
        setReady(true);
        setLoading(false);
      })

      .catch((error: Error) => {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Failed to connect to server",
          description: error.message,
        });
      });
  }, [token, loginInProgress]);
};
