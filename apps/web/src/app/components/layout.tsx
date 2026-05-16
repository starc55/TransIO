import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { TopNav } from "./top-nav";
import { Sidebar } from "./sidebar";
import React from "react";
import { useAppState } from "../context/app-state";
import { motion } from "motion/react";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { authReady, profileLoading, isAuthenticated } = useAppState();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!authReady || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Preparing workspace...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopNav
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <motion.main
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex-1 overflow-auto bg-background transition-all duration-300"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
