import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type StorefrontTheme = {
  activeTheme: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: string;
  buttonColor: string;
  buttonBGColor: string;
  buttonBorderColor: string;
  productColumns: number;
};

type ThemeContextType = {
  theme: StorefrontTheme;
  loading: boolean;
  error: boolean;
  refreshTheme: () => Promise<void>;
};

const DEFAULT_THEME: StorefrontTheme = {
  activeTheme: "default",
  primaryColor: "#2563eb",
  secondaryColor: "#64748b",
  backgroundColor: "#ffffff",
  surfaceColor: "#f8fafc",
  textColor: "#171717",
  mutedTextColor: "#64748b",
  borderColor: "#e5e7eb",
  fontFamily: "Arial, sans-serif",
  borderRadius: "8px",
  buttonStyle: "solid",
  buttonBGColor: "#2563eb",
  buttonColor: "#fff",
  buttonBorderColor: "#2563eb",
  productColumns: 4,
};

const RAMAN_THEME: StorefrontTheme = {
  activeTheme: "raman",
  primaryColor: "#444",
  secondaryColor: "#171717",
  backgroundColor: "#ffffff",
  surfaceColor: "#f8fafc",
  textColor: "#171717",
  mutedTextColor: "#64748b",
  borderColor: "#e5e7eb",
  fontFamily: "Muli",
  borderRadius: "8px",
  buttonStyle: "rounded",
  buttonBGColor: "#2563eb",
  buttonColor: "#fff",
  buttonBorderColor: "#2563eb",
  productColumns: 3,
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyTheme(theme: StorefrontTheme) {
  const root = document.documentElement;

  root.dataset.theme = theme.activeTheme;

  const variables: Record<string, string> = {
    "--theme-primary": theme.primaryColor,
    "--theme-secondary": theme.secondaryColor,
    "--theme-background": theme.backgroundColor,
    "--theme-surface": theme.surfaceColor,
    "--theme-text": theme.textColor,
    "--theme-muted-text": theme.mutedTextColor,
    "--theme-border": theme.borderColor,
    "--theme-font": theme.fontFamily,
    "--theme-radius": theme.borderRadius,
    "--button-bg-color": theme.buttonBGColor,
    "--button-text-color": theme.buttonColor,
    "--button-border-color": theme.buttonBorderColor,
  };

  Object.entries(variables).forEach(([name, value]) => {
    root.style.setProperty(name, value);
  });

  root.style.setProperty(
    "--theme-columns",
    String([2, 3, 4, 5, 6].includes(theme.productColumns)
      ? theme.productColumns
      : 4)
  );

  root.dataset.buttonStyle = ["solid", "rounded", "square"].includes(
    theme.buttonStyle
  )
    ? theme.buttonStyle
    : "solid";
}

export function StorefrontThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<StorefrontTheme>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refreshTheme = useCallback(async () => {
    try {
      setTheme(RAMAN_THEME)
      // const response = await fetch("/api/storefront-theme");

      // if (!response.ok) {
      //   throw new Error("Failed to load storefront theme");
      // }

      // const settings = (await response.json()) as Partial<StorefrontTheme>;

      // setTheme({
      //   ...DEFAULT_THEME,
      //   ...settings,
      // });

      setError(false);
    } catch (err) {
      console.error("Storefront theme loading failed:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshTheme();
  }, [refreshTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, loading, error, refreshTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useStorefrontTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useStorefrontTheme must be used inside StorefrontThemeProvider"
    );
  }

  return context;
}