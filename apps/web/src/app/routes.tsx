import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/layout";
import { Dashboard } from "./components/dashboard";
import { MyLoads } from "./components/my-loads";
import { SavedLoads } from "./components/saved-loads";
import { Settings } from "./components/settings";
import { Login } from "./components/login";
import { ForgotPassword } from "./components/forgot-password";
import { ResetPassword } from "./components/reset-password";
import { Admin } from "./components/admin";
import Loads from "../pages/Loads";
import React from "react";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "loads", Component: Loads },
      { path: "load-board", Component: () => <Navigate to="/loads" replace /> },
      { path: "my-loads", Component: MyLoads },
      { path: "saved-loads", Component: SavedLoads },
      { path: "admin", Component: Admin },
      { path: "admin/users", Component: () => <Admin view="users" /> },
      { path: "admin/stats", Component: () => <Admin view="stats" /> },
      { path: "settings", Component: Settings },
      { path: "*", Component: () => <Navigate to="/" replace /> },
    ],
  },
]);
