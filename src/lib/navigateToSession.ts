import { NavigateFunction } from "react-router";

export function navigateToSession(
  sessionId: string | null,
  navigate: NavigateFunction,
) {
  if (sessionId === null) void navigate("/", { replace: true });
  else void navigate(`/?session=${sessionId}`, { replace: true });
}
