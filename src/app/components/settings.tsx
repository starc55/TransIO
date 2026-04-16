import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { User, Bell, Shield, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export function Settings() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 space-y-6 bg-background">
      <div>
        <h1 className="mb-2 text-foreground text-2xl sm:text-3xl">Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your account preferences</p>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Profile Settings */}
        <Card className="p-5 sm:p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-foreground text-lg sm:text-xl">Profile Settings</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-foreground text-sm">First Name</Label>
                <Input id="firstName" defaultValue="John" className="bg-input-background border-border text-foreground h-10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-foreground text-sm">Last Name</Label>
                <Input id="lastName" defaultValue="Doe" className="bg-input-background border-border text-foreground h-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
              <Input id="email" type="email" defaultValue="john.doe@example.com" className="bg-input-background border-border text-foreground h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground text-sm">Phone</Label>
              <Input id="phone" type="tel" defaultValue="(555) 123-4567" className="bg-input-background border-border text-foreground h-10" />
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 sm:h-11">Save Changes</Button>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-5 sm:p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-foreground text-lg sm:text-xl">Notifications</h3>
          </div>
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-foreground text-sm sm:text-base">Email Notifications</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Receive updates about new loads</p>
              </div>
              <Switch defaultChecked className="flex-shrink-0" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-foreground text-sm sm:text-base">Load Alerts</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Get notified about saved load updates</p>
              </div>
              <Switch defaultChecked className="flex-shrink-0" />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <h4 className="text-foreground text-sm sm:text-base">Rate Changes</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">Alert me when rates change significantly</p>
              </div>
              <Switch className="flex-shrink-0" />
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-5 sm:p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Moon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-foreground text-lg sm:text-xl">Appearance</h3>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-foreground text-sm sm:text-base">Dark Mode</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">Toggle dark theme</p>
            </div>
            <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} className="flex-shrink-0" />
          </div>
        </Card>

        {/* Security */}
        <Card className="p-5 sm:p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-foreground text-lg sm:text-xl">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-foreground text-sm">Current Password</Label>
              <Input id="currentPassword" type="password" className="bg-input-background border-border text-foreground h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-foreground text-sm">New Password</Label>
              <Input id="newPassword" type="password" className="bg-input-background border-border text-foreground h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-foreground text-sm">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" className="bg-input-background border-border text-foreground h-10" />
            </div>
            <Button variant="outline" className="border-border text-foreground hover:bg-accent h-10 sm:h-11">Update Password</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}