import "@theapp/ui/globals.css";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { App } from "@theapp/webapp/app";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}
createRoot(root).render(
  <StrictMode>
    <App />
    <TanStackDevtools plugins={[formDevtoolsPlugin()]} />
  </StrictMode>,
);
