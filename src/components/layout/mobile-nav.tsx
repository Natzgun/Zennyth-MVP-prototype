"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CalendarDays, LayoutDashboard, Plus, Timer, Users } from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Inicio" },
  { href: "/tasks/new", icon: Plus, label: "Nueva", isMain: true },
  { href: "/workspaces", icon: Users, label: "Grupos" },
  { href: "/timeline", icon: CalendarDays, label: "Calendario" },
  { href: "/focus", icon: Timer, label: "Focus" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-border"
      role="navigation"
      aria-label="Navegación móvil"
    >
      <div className="flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center -mt-6"
                aria-label="Nueva tarea"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 active:scale-90 transition-transform duration-150">
                  <Plus className="w-6 h-6 text-on-primary" />
                </div>
                <span className="text-[10px] mt-1.5 text-primary font-semibold">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl min-w-[48px] min-h-[44px] justify-center",
                "transition-colors duration-150",
                isActive ? "text-primary" : "text-text-3"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
