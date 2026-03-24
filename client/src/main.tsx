import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Apply Discord dark theme to the document root
// The `dark` class enables shadcn dark mode tokens
// The `discord` class enables Discord-specific overrides in index.css
document.documentElement.classList.add("dark");
document.body.classList.add("discord");

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found in index.html");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);