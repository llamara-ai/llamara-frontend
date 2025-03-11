import { useEffect, useState } from "react";
import { useWindow } from "@/hooks/useWindow.ts";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const { innerWidth } = useWindow();

  const [isMobile, setIsMobile] = useState<boolean>(
    innerWidth < MOBILE_BREAKPOINT,
  );

  useEffect(() => {
    setIsMobile(innerWidth < MOBILE_BREAKPOINT);
  }, [innerWidth]);

  return isMobile;
}
