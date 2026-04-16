import {
  Package,
  TrendingUp,
  Clock,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "./ui/card";
import { Link } from "react-router";
import React from "react";

export function Dashboard() {
  const stats = [
    {
      label: "Available Loads",
      value: "1,248",
      change: "+12.5%",
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "up",
    },
    {
      label: "Active Loads",
      value: "36",
      change: "+8.2%",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      trend: "up",
    },
    {
      label: "Pending Offers",
      value: "12",
      change: "-3.1%",
      icon: Clock,
      color: "text-accent-foreground",
      bgColor: "bg-accent/30",
      trend: "down",
    },
    {
      label: "Total Revenue",
      value: "$42,850",
      change: "+15.3%",
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-primary/10",
      trend: "up",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "New load available",
      location: "Chicago, IL → Dallas, TX",
      time: "2 min ago",
    },
    {
      id: 2,
      action: "Load booked",
      location: "Los Angeles, CA → Phoenix, AZ",
      time: "15 min ago",
    },
    {
      id: 3,
      action: "Payment received",
      location: "Miami, FL → Atlanta, GA",
      time: "1 hour ago",
    },
  ];

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="mb-2 text-foreground text-2xl sm:text-3xl font-semibold">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Welcome back! Here's an overview of your freight operations.
          </p>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          Last updated: <span className="text-foreground">Just now</span>
        </div>
      </div>

      {/* Stats Grid - Auto-fit responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="p-5 sm:p-6 bg-card border-border hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                  {stat.label}
                </p>
                <h2 className="mb-2 text-foreground text-2xl sm:text-3xl font-bold">
                  {stat.value}
                </h2>
                <div className="flex items-center gap-1">
                  <ArrowUpRight
                    className={`h-3.5 w-3.5 ${
                      stat.trend === "up"
                        ? "text-green-500 rotate-0"
                        : "text-destructive rotate-90"
                    }`}
                  />
                  <p
                    className={`text-xs sm:text-sm font-medium ${
                      stat.trend === "up"
                        ? "text-green-500"
                        : "text-destructive"
                    }`}
                  >
                    {stat.change}
                  </p>
                  <span className="text-xs text-muted-foreground ml-1">
                    vs last month
                  </span>
                </div>
              </div>
              <div
                className={`p-3 sm:p-3.5 rounded-xl ${stat.bgColor} ring-1 ring-inset ring-white/10`}
              >
                <stat.icon className={`h-6 w-6 sm:h-7 sm:w-7 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Actions - Takes 2 columns on large screens */}
        <Card className="lg:col-span-2 p-5 sm:p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-foreground text-lg sm:text-xl font-semibold">
              Quick Actions
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Link
              to="/load-board"
              className="p-5 border border-border rounded-xl hover:bg-accent hover:border-primary/50 transition-all duration-200 text-left group"
            >
              <div className="mb-3">
                <div className="p-2.5 bg-primary/10 rounded-lg w-fit">
                  <Package className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h4 className="mb-1 text-foreground font-semibold group-hover:text-primary transition-colors">
                Browse Load Board
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Find available loads
              </p>
            </Link>
            <Link
              to="/my-loads"
              className="p-5 border border-border rounded-xl hover:bg-accent hover:border-primary/50 transition-all duration-200 text-left group"
            >
              <div className="mb-3">
                <div className="p-2.5 bg-primary/10 rounded-lg w-fit">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h4 className="mb-1 text-foreground font-semibold group-hover:text-primary transition-colors">
                View Active Loads
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Manage current shipments
              </p>
            </Link>
            <button className="p-5 border border-border rounded-xl hover:bg-accent hover:border-primary/50 transition-all duration-200 text-left group">
              <div className="mb-3">
                <div className="p-2.5 bg-primary/10 rounded-lg w-fit">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h4 className="mb-1 text-foreground font-semibold group-hover:text-primary transition-colors">
                View Analytics
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Track your performance
              </p>
            </button>
          </div>
        </Card>

        {/* Recent Activity - Takes 1 column */}
        <Card className="p-5 sm:p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-foreground text-lg sm:text-xl font-semibold">
              Recent Activity
            </h3>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0"
              >
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {activity.location}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
