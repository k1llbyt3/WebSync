
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LogoutButton } from "@/components/logout-button";

const navItems = [
  {
    href: "/dashboard",
    icon: Icons.dashboard,
    label: "Dashboard",
  },
  {
    href: "/tasks",
    icon: Icons.tasks,
    label: "Tasks",
  },
  {
    href: "/meetings",
    icon: Icons.meetings,
    label: "Meeting Co-Pilot",
  },
  {
    href: "/reminders",
    icon: Icons.bell,
    label: "Reminders",
  },
  {
    href: "/codegen",
    icon: Icons.codegen,
    label: "Dev Tools",
  },
  {
    href: "/settings",
    icon: Icons.settings,
    label: "Settings",
  },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            tooltip={item.label}
          >
            <Link href={item.href}>
              <item.icon className="h-5 w-5" />
              <span className="group-data-[[data-state=collapsed]]:hidden">{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
      <SidebarMenuItem>
        <LogoutButton />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
