import { useEffect, useRef } from "react";
import { keepAliveAnonymousSession as keepAliveAnonymousSessionApi } from "@/api";
import { useAppContext } from "@/services/AppContextService";

// This hook will keep the session alive by sending a request to the server
// but only when the tab is visible
export function useKeepAliveSession(sessionId: string | null) {
  const { securityConfig } = useAppContext();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const keepAliveAnonymousSession = () => {
    const options = {
      path: {
        sessionId: sessionId ?? "",
      },
    };
    void keepAliveAnonymousSessionApi(options);
  };

  useEffect(() => {
    const startTimer = () => {
      const sessionTimeout = securityConfig.anonymousUserSessionTimeout;
      if (
        securityConfig.anonymousUserEnabled &&
        sessionTimeout &&
        sessionId &&
        !document.hidden
      ) {
        // Forming in milliseconds and reducing 20% of the session timeout
        const timeoutInSec = sessionTimeout * 800;
        timerRef.current = setInterval(keepAliveAnonymousSession, timeoutInSec);
      }
    };

    const stopTimer = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTimer();
      } else {
        startTimer();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    startTimer();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopTimer();
    };
  }, [sessionId]);
}
