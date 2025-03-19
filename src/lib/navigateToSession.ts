import { NavigateFunction } from "react-router";

export function navigateToSession(
  sessionId: string | null,
  navigate: NavigateFunction,
) {
  if (sessionId === null) void navigate("/");
  else void navigate(`/?session=${sessionId}`);
}
