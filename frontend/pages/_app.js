import "../styles/globals.css";
import { useState, useEffect, createContext, useContext } from "react";
import { Toaster } from "react-hot-toast";

const ThemeContext = createContext({ dark: true, toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

export default function App({ Component, pageProps }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setDark(saved === "dark");
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      <div className={dark ? "dark noise" : "light noise"}>
        <Component {...pageProps} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: dark ? "#111118" : "#fff",
              color: dark ? "#F0F0FF" : "#0A0A1F",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontFamily: "'DM Sans', sans-serif",
            },
            success: { iconTheme: { primary: "#00FF87", secondary: "#0A0A0F" } },
            error: { iconTheme: { primary: "#FF6B6B", secondary: "#fff" } },
          }}
        />
      </div>
    </ThemeContext.Provider>
  );
}
