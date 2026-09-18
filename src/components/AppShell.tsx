import * as React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Bot,
  CalendarDays,
  FileText,
  HeartPulse,
  LayoutDashboard,
  Menu,
  Moon,
  Settings as SettingsIcon,
  Stethoscope,
  Sun,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Disclaimer } from "@/components/Disclaimer";
import { Logo } from "@/components/Logo";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profile", label: "Health profile", icon: User },
  { to: "/risk", label: "Risk assessment", icon: HeartPulse },
  { to: "/tracker", label: "Health tracker", icon: Activity },
  { to: "/assistant", label: "Jeeva Assistant", icon: Bot },
  { to: "/doctors", label: "Find doctors", icon: Stethoscope },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/reports", label: "Health reports", icon: FileText },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { notifications } = useApp();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <nav className="flex flex-col gap-1 p-3">
      {nav.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <item.icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            {item.to === "/notifications" && unread > 0 && (
              <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1 text-[11px]">
                {unread}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const { settings, update, profile, auth } = useApp();
  const [open, setOpen] = React.useState(false);
  const dark = settings.theme === "dark";
  const displayName = auth.guest ? "Guest user" : auth.name || profile.name;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="border-t border-sidebar-border p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">{displayName}</p>
          <p>{auth.guest ? "Demo mode" : profile.email}</p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur md:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="px-5 py-5">
                <Logo />
              </SheetTitle>
              <NavLinks onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold md:text-xl">{title}</h1>
            {description && <p className="truncate text-xs text-muted-foreground md:text-sm">{description}</p>}
          </div>

          <div className="flex items-center gap-2">
            {actions}
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => update({ settings: { ...settings, theme: dark ? "light" : "dark" } })}
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-6">
          <Disclaimer compact />
          {children}
        </main>
      </div>
    </div>
  );
}
