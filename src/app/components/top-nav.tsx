import { Search, Bell, Menu, User, Moon, Sun, X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logo from "../../imports/logo.png";
import React from "react";

interface TopNavProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function TopNav({ onMenuClick, sidebarOpen }: TopNavProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-card flex justify-between items-center px-3 sm:px-4 lg:px-6 gap-2 sm:gap-4 shadow-sm z-50">
      {/* Menu button for mobile/tablet */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="xl:hidden h-9 w-9 sm:h-10 sm:w-10 hover:bg-accent relative"
      >
        {sidebarOpen ? (
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
        ) : (
          <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
        )}
      </Button>

      {/* Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center overflow-hidden">
          <ImageWithFallback
            src={logo}
            alt="TransIO Logo"
            className="w-full h-full object-contain opacity-100"
          />
        </div>
        <span className="hidden sm:block font-semibold text-base sm:text-lg text-foreground tracking-tight">
          Trans<span className="text-primary">IO</span>
        </span>
      </div>

      {/* Search bar */}
      <div className="flex-1 max-w-xl lg:max-w-2xl hidden md:flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search origin, destination..."
            className="pl-10 bg-input-background border-border text-foreground placeholder:text-muted-foreground h-9 sm:h-10"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDarkMode(!darkMode)}
          className="hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 hover:bg-accent hover:text-accent-foreground"
        >
          {darkMode ? (
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
          ) : (
            <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
          )}
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 sm:h-10 sm:w-10 hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
          <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-card"></span>
        </Button>

        {/* User profile */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-9 w-9 sm:h-10 sm:w-10 hover:bg-accent"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/20">
            <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </div>
        </Button>
      </div>
    </header>
  );
}
