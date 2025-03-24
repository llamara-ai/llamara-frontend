import { useEffect, useState } from "react";
import { useWindowSize } from "usehooks-ts";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const { width, height } = useWindowSize({
    initializeWithValue: true,
  });

  const [isMobile, setIsMobile] = useState<boolean>(
    Math.min(width, height) < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    setIsMobile(Math.min(width, height) < MOBILE_BREAKPOINT);
  }, [width]);

  return isMobile;
}
