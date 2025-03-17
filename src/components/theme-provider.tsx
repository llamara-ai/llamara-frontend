import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ComputedTheme = "dark" | "light";
type Theme = "system" | ComputedTheme;

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: ComputedTheme;
  setTheme: (theme: Theme) => void;
}

const computeSystemTheme = (theme: Theme) => {
  if (theme === "system") {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    } else {
      return "light";
    }
  }
  return theme;
};

const initialState: ThemeProviderState = {
  theme: computeSystemTheme("system"),
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = computeSystemTheme("system"),
  storageKey = "vite-ui-theme",
  ...props
}: Readonly<ThemeProviderProps>) {
  const [theme, setTheme] = useState<ComputedTheme>(
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    () => (localStorage.getItem(storageKey) as ComputedTheme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    root.classList.add(computeSystemTheme(theme));
  }, [theme]);

  const value = useMemo(
    () => ({
      theme: computeSystemTheme(theme),
      setTheme: (theme: Theme) => {
        localStorage.setItem(storageKey, theme);
        setTheme(computeSystemTheme(theme));
      },
    }),
    [theme, storageKey],
  );

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
