import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";

export function useLogo() {
  const [logoSrc, setLogoSrc] = useState("/logo.svg");
  const { theme } = useTheme();

  useEffect(() => {
    if (theme === "dark") {
      setLogoSrc("/logo-dark.svg");
    } else {
      setLogoSrc("/logo.svg");
    }
  }, [theme]);

  return logoSrc;
}
