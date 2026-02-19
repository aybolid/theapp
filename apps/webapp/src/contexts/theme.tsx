import {
  createContext,
  type FC,
  type PropsWithChildren,
  use,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light" | "system";

type ThemeContext = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContext>({
  theme: "system",
  setTheme: () => null,
});

export const ThemeContextProvider: FC<
  PropsWithChildren<{ defaultTheme?: Theme; storageKey?: string }>
> = ({
  children,
  defaultTheme = "system",
  storageKey = "uitheme",
  ...props
}) => {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      root.classList.add(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      );
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeContext
      {...props}
      value={{
        theme,
        setTheme: (theme: Theme) => {
          localStorage.setItem(storageKey, theme);
          setTheme(theme);
        },
      }}
    >
      {children}
    </ThemeContext>
  );
};

export const useTheme = () => {
  const context = use(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }
  return context;
};
