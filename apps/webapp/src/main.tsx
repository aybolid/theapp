import "@theapp/ui/globals.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { TooltipProvider } from "@theapp/ui/components/tooltip";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeContextProvider } from "./contexts/theme";
import { queryClient } from "./lib/query";
import { router } from "./lib/router";

const root = document.getElementById("root");
if (!root) {
  throw new Error("Root element not found");
}
createRoot(root).render(
  <StrictMode>
    <TooltipProvider>
      <ThemeContextProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeContextProvider>
    </TooltipProvider>
  </StrictMode>,
);
