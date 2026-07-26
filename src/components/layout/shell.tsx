"use client";

import { useState } from "react";
import { useZenStore } from "@/lib/store";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { usePathname } from "next/navigation";
import { LandingHero } from "@/components/landing/hero";

export function ShellLayout({ children }: { children: React.ReactNode }) {
  const { isOnboarded } = useZenStore();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Landing page for non-onboarded visitors (smoke test)
  if (!isOnboarded && pathname === "/") {
    return <LandingHero />;
  }

  // Onboarding flow (no shell)
  if (pathname === "/onboarding") {
    return <>{children}</>;
  }

  // Non-onboarded user trying to access app pages → show landing
  if (!isOnboarded) {
    return <LandingHero />;
  }

  // Normal app shell
  return (
    <div className="min-h-dvh bg-bg">
      <Sidebar collapsed={isSidebarCollapsed} onCollapsedChange={setIsSidebarCollapsed} />
      <main className={`min-h-dvh pb-24 transition-[margin] duration-200 md:pb-0 ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
