import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout";
import { Dashboard } from "./components/dashboard";
import { LoadBoard } from "./components/load-board";
import { MyLoads } from "./components/my-loads";
import { SavedLoads } from "./components/saved-loads";
import { Settings } from "./components/settings";
import { Login } from "./components/login";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "load-board", Component: LoadBoard },
      { path: "my-loads", Component: MyLoads },
      { path: "saved-loads", Component: SavedLoads },
      { path: "settings", Component: Settings },
    ],
  },
]);