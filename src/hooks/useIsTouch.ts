import { useMemo } from "react";

export function useIsTouch() {
  return useMemo(
    () => "ontouchstart" in window || navigator.maxTouchPoints > 0,
    [],
  );
}
