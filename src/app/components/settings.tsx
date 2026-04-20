import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { User, Bell, Shield, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppState } from "../context/app-state";
import { toast } from "sonner";
import React from "react";

export function Settings() {
  const {
    darkMode,
    setDarkMode,
    profile,
    updateProfile,
    notifications,
    markAllNotificationsRead,
  } = useAppState();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  });

  useEffect(() => {
    if (profile) {
      setForm(profile);
    }
  }, [profile]);

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 space-y-6 bg-background">
      <div>
        <h1 className="mb-2 text-foreground text-2xl sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your account preferences
        </p>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card className="p-5 sm:p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-foreground text-lg sm:text-xl">
              Profile Settings
            </h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground text-sm">
                Full Name
              </Label>
              <Input
                id="fullName"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className="bg-input-background border-border text-foreground h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="text-foreground text-sm">
                Company
              </Label>
              <Input
                id="company"
                value={form.company}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    company: event.target.value,
                  }))
                }
                className="bg-input-background border-border text-foreground h-10"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="bg-input-background border-border text-foreground h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground text-sm">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  className="bg-input-background border-border text-foreground h-10"
                />
              </div>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 sm:h-11 cursor-pointer"
              onClick={() => {
                updateProfile(form);
                toast.success("Profile saved");
              }}
            >
              Save Changes
            </Button>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-foreground text-lg sm:text-xl">
              Notifications
            </h3>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-foreground text-sm sm:text-base">
                  Email Notifications
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Receive updates about new loads
                </p>
              </div>
              <Switch defaultChecked className="flex-shrink-0" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-foreground text-sm sm:text-base">
                  Load Alerts
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Get notified about saved load updates
                </p>
              </div>
              <Switch defaultChecked className="flex-shrink-0" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-foreground text-sm sm:text-base">
                  Rate Changes
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Alert me when rates change significantly
                </p>
              </div>
              <Switch className="flex-shrink-0" />
            </div>
            <div className="rounded-xl border border-border bg-background/70 px-4 py-3">
              <p className="text-sm text-foreground">
                Unread notifications:{" "}
                {notifications.filter((item) => !item.read).length}
              </p>
              <Button
                variant="ghost"
                className="mt-2 h-9 px-0 text-primary hover:bg-transparent hover:text-primary/80 cursor-pointer"
                onClick={markAllNotificationsRead}
              >
                Mark notifications as read
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Moon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-foreground text-lg sm:text-xl">Appearance</h3>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-foreground text-sm sm:text-base">
                Dark Mode
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Toggle dark theme
              </p>
            </div>
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
              className="flex-shrink-0"
            />
          </div>
        </Card>

        <Card className="p-5 sm:p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-foreground text-lg sm:text-xl">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="text-foreground text-sm"
              >
                Current Password
              </Label>
              <Input
                id="currentPassword"
                type="password"
                className="bg-input-background border-border text-foreground h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground text-sm">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                className="bg-input-background border-border text-foreground h-10"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-foreground text-sm"
              >
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                className="bg-input-background border-border text-foreground h-10"
              />
            </div>
            <Button
              variant="outline"
              className="border-border text-foreground hover:bg-primary/10 h-10 sm:h-11 cursor-pointer"
              onClick={() =>
                toast.success("Password form is ready to connect to backend")
              }
            >
              Update Password
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
