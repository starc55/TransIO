import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { TopNav } from "./top-nav";
import { Sidebar } from "./sidebar";
import React from "react";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on desktop when resizing
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1200) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopNav 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        sidebarOpen={sidebarOpen}
      />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className={`flex-1 overflow-auto bg-background transition-all duration-300`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}