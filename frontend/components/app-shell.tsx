"use client";

import { NavLink, useLocation } from "react-router-dom";
import { Activity } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const links = [
  { path: "/", label: "Home" },
  { path: "/dashboard", label: "Check Risk" },
  { path: "/models", label: "How Accurate" },
  { path: "/what-if", label: "Try Changes" },
  { path: "/history", label: "Past Results" },
  { path: "/about", label: "How It Works" }
];

const routeMeta: Record<string, { title: string; subtitle: string }> = {
  "/": {
    title: "Cardiovascular Risk Tool Overview",
    subtitle: "See what data we use, how we train, and what the model can do"
  },
  "/dashboard": {
    title: "Check Your Risk",
    subtitle: "Enter health details to get a risk score and clear explanation"
  },
  "/models": {
    title: "Model Accuracy",
    subtitle: "Compare how well each model performs"
  },
  "/what-if": {
    title: "Try Health Changes",
    subtitle: "Compare your current profile with a changed profile"
  },
  "/history": {
    title: "Past Checks",
    subtitle: "Review previous risk results over time"
  },
  "/about": {
    title: "How The Model Was Trained",
    subtitle: "Learn the dataset, steps, and saved model files"
  }
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const current = routeMeta[pathname] ?? routeMeta["/"];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex w-full items-center justify-between px-4 py-3 md:px-8 xl:px-10">
          <div className="flex items-center gap-3">
            <div className="rounded-md border border-border p-2 text-primary">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">CardioIntel</p>
              <p className="text-xs text-muted-foreground">Cardiovascular Risk Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        <div className="w-full border-t border-border/70 px-4 py-2 md:px-8 xl:px-10">
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="w-full space-y-5 px-4 py-5 md:px-8 xl:px-10">
        <section className="rounded-lg border border-border bg-card p-4">
          <h1 className="text-2xl font-semibold tracking-tight">{current.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{current.subtitle}</p>
        </section>
        <section className="space-y-5">{children}</section>
      </main>
    </div>
  );
}
