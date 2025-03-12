import { useEffect, useState } from "react";
import { useWindowSize } from "usehooks-ts";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const { width } = useWindowSize({
    initializeWithValue: true,
  });

  const [isMobile, setIsMobile] = useState<boolean>(width < MOBILE_BREAKPOINT);

  useEffect(() => {
    setIsMobile(width < MOBILE_BREAKPOINT);
  }, [width]);

  return isMobile;
}
