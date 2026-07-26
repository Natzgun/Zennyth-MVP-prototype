"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useZenStore } from "@/lib/store";
import { useTheme } from "./theme-provider";
import {
  LayoutDashboard,
  Plus,
  BarChart3,
  CalendarDays,
  Timer,
  Settings,
  Users,
  Flame,
  Sparkles,
  Zap,
  Sun,
  Moon,
  Menu,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/tasks/new", icon: Plus, label: "Nueva Tarea" },
  { href: "/workspaces", icon: Users, label: "Grupos" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/timeline", icon: CalendarDays, label: "Calendario" },
  { href: "/focus", icon: Timer, label: "Focus" },
  { href: "/settings", icon: Settings, label: "Config" },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const { user, streak, tier } = useZenStore();
  const { resolved, toggle } = useTheme();

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 hidden h-dvh flex-col overflow-hidden border-r border-border bg-surface transition-[width] duration-200 md:flex",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn("flex items-center pb-4", collapsed ? "flex-col justify-center gap-2 px-3 pt-3" : "justify-between p-6")}>
        <Link href="/" className="group flex items-center gap-3" aria-label="Inicio" title="Inicio">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20 transition-transform duration-200 group-hover:scale-105">
            <Sparkles className="w-5 h-5 text-on-primary" />
          </div>
          <div className={cn(collapsed && "hidden")}>
            <h1 className="text-lg font-bold text-text-1 tracking-tight">
              Zennyth
            </h1>
            <p className="text-[10px] text-text-3 uppercase tracking-[0.2em]">
              Study Flow
            </p>
          </div>
        </Link>
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-text-2 transition-colors hover:bg-bg-subtle hover:text-text-1", collapsed && "order-first")}
          aria-label={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
          title={collapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3" role="navigation" aria-label="Navegación principal">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.label}
              title={item.label}
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-semibold",
                "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                collapsed ? "justify-center" : "gap-3",
                isActive
                  ? "bg-primary-subtle text-primary"
                  : "text-text-2 hover:text-text-1 hover:bg-bg-subtle"
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && item.label}
              {!collapsed && item.href === "/focus" && (
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-md bg-primary-subtle text-primary font-bold">
                  PRO
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Upgrade CTA */}
      {tier === "free" && (
          <div className="mb-2 px-3">
            <Link
              href="/pricing"
              aria-label="Upgrade a Pro"
              title="Upgrade a Pro"
              className={cn("group flex rounded-xl border border-primary/10 bg-gradient-to-r from-primary-subtle to-accent-subtle px-3 py-3 transition-all duration-200 hover:border-primary/20", collapsed ? "justify-center" : "gap-2.5")}
            >
              <Zap className="h-4 w-4 shrink-0 text-primary transition-colors group-hover:text-primary-hover" />
              {!collapsed && <div className="min-w-0">
                <p className="text-xs font-bold text-text-1">Upgrade a Pro</p>
                <p className="text-[10px] text-text-3">Scheduling + IA</p>
              </div>}
          </Link>
        </div>
      )}

      {/* Bottom section */}
      <div className="space-y-3 p-4">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className={cn("flex w-full rounded-xl px-3 py-2 text-text-2 transition-colors hover:bg-bg-subtle", collapsed ? "justify-center" : "gap-2")}
          aria-label={resolved === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          title={resolved === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {resolved === "dark" ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
          {!collapsed && <span className="text-xs font-medium">
            {resolved === "dark" ? "Modo claro" : "Modo oscuro"}
          </span>}
        </button>

        {streak.currentStreak > 0 && (
          <div className={cn("flex rounded-xl border border-warning/10 bg-warning-subtle px-3 py-2.5", collapsed ? "justify-center" : "gap-2")} title={`${streak.currentStreak} días seguidos`}>
            <Flame className="w-4 h-4 text-warning" />
            {!collapsed && <span className="text-xs font-bold text-warning">
              {streak.currentStreak} días seguidos
            </span>}
          </div>
        )}

        <div className={cn("flex items-center px-3 py-2.5", collapsed ? "justify-center" : "gap-3")} title={user.name || "Estudiante"}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-white">
            {user.name ? user.name[0].toUpperCase() : "Z"}
          </div>
          {!collapsed && <div className="min-w-0">
            <p className="text-sm font-semibold text-text-1 truncate">
              {user.name || "Estudiante"}
            </p>
            <p className="text-[11px] text-text-3 truncate">
              {user.university || "Universidad"}
            </p>
          </div>}
        </div>
      </div>
    </aside>
  );
}
