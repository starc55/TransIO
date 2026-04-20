import { RouterProvider } from "react-router";
import { router } from "./routes";
import React from "react";
import { AppStateProvider } from "./context/app-state";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AppStateProvider>
  );
}
