import { RouterProvider } from "react-router";
import { router } from "./routes";
import React from "react";
import { AppStateProvider } from "./context/app-state";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AppStateProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </AppStateProvider>
  );
}
