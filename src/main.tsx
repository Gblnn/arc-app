import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./WEB/css/clash-grotesk.css";
import "./style.css";
import { ThemeProvider } from "./components/theme-provider.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ThemeProvider defaultTheme="dark">
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ThemeProvider>
);
