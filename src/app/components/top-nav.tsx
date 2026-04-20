import {
  Search,
  Bell,
  Menu,
  User,
  Moon,
  Sun,
  X,
  LogOut,
  LogIn,
  CheckCheck,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import logo from "../../imports/logo.png";
import React from "react";
import { useAppState } from "../context/app-state";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

interface TopNavProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export function TopNav({ onMenuClick, sidebarOpen }: TopNavProps) {
  const navigate = useNavigate();
  const {
    darkMode,
    toggleDarkMode,
    notifications,
    unreadNotifications,
    profile,
    isAuthenticated,
    logout,
    searchQuery,
    setSearchQuery,
    markAllNotificationsRead,
  } = useAppState();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-14 sm:h-16 border-b border-border/80 bg-card/95 backdrop-blur-xl flex justify-between items-center px-3 sm:px-4 lg:px-6 gap-2 sm:gap-4 shadow-sm z-50"
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        className="xl:hidden h-9 w-9 sm:h-10 sm:w-10 hover:bg-primary/10 hover:text-primary relative cursor-pointer"
      >
        {sidebarOpen ? (
          <X className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
        ) : (
          <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
        )}
      </Button>

      <div className="flex items-center gap-1 sm:gap-1">
        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center overflow-hidden">
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

      <div className="flex-1 max-w-xl lg:max-w-2xl hidden md:flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search loads, broker, lane, tags..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10 bg-input-background/80 border-border text-foreground placeholder:text-muted-foreground h-9 sm:h-10 focus-visible:ring-primary/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="hidden sm:flex h-9 w-9 sm:h-10 sm:w-10 hover:bg-primary/10 hover:text-primary cursor-pointer"
        >
          {darkMode ? (
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
          ) : (
            <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
          )}
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 sm:h-10 sm:w-10 hover:bg-primary/10 hover:text-primary cursor-pointer"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 min-w-2.5 h-2.5 px-1 bg-destructive rounded-full ring-2 ring-card text-[10px] leading-none text-white flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-[22rem] border-border bg-popover/98 p-0"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  Platform updates and activity
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllNotificationsRead}
                className="h-8 px-2 text-xs hover:bg-primary/10 hover:text-primary cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark all
              </Button>
            </div>
            <div className="max-h-96 overflow-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-sm text-center text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="px-4 py-3 border-b border-border/70 last:border-b-0 hover:bg-primary/5"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          notification.read ? "bg-border" : "bg-primary"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {notification.description}
                        </p>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                          {notification.createdAt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 sm:h-10 sm:w-10 hover:bg-primary/10 cursor-pointer"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary/30 to-sky-400/20 flex items-center justify-center ring-2 ring-primary/20">
                <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 border-border bg-popover/98"
          >
            {isAuthenticated ? (
              <>
                <DropdownMenuLabel className="space-y-1">
                  <p className="text-sm font-semibold text-foreground capitalize">
                    {profile?.name}
                  </p>
                  <p className="text-xs font-normal text-muted-foreground">
                    {profile?.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/settings")}
                  className="cursor-pointer hover:bg-primary/10"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="cursor-pointer hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold text-foreground">
                    Guest mode
                  </p>
                  <p className="text-xs font-normal text-muted-foreground">
                    Login to access your loads
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/login")}
                  className="cursor-pointer hover:bg-primary/10"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}
