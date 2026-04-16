import { NavLink } from "react-router";
import {
  LayoutDashboard,
  PackageSearch,
  Package,
  Bookmark,
  Settings,
  X,
} from "lucide-react";
import { cn } from "./ui/utils";
import { Button } from "./ui/button";
import React from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: PackageSearch, label: "Load Board", path: "/load-board" },
  { icon: Package, label: "My Loads", path: "/my-loads" },
  { icon: Bookmark, label: "Saved Loads", path: "/saved-loads" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* 🔥 Overlay (mobile only) */}
      {isOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed xl:static top-0 left-0 h-full bg-card border-r border-border z-50",
          "transition-transform duration-300 ease-in-out w-64",

          // mobile behavior
          "xl:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",

          // desktop always visible
          "xl:shadow-none shadow-2xl"
        )}
      >
        {/* Header (mobile only) */}
        <div className="xl:hidden flex items-center justify-between px-4 py-4 border-b border-border">
          <h2 className="text-foreground font-semibold text-lg">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={() => onClose?.()} // mobileda yopiladi
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition",
                  "hover:bg-accent/50",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border text-xs text-center text-muted-foreground">
          <p>TransIO Platform</p>
          <p>v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
