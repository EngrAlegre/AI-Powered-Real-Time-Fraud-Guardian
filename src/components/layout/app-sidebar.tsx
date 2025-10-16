"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Wallet,
  ShieldAlert,
  BarChart,
  Cpu,
  Gem,
  Radio,
} from "lucide-react";

const AppSidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
    { href: "/live-demo", icon: <Radio />, label: "🔴 Live Demo", badge: "Real-Time" },
    { href: "/transactions", icon: <Wallet />, label: "Transactions" },
    { href: "/alerts", icon: <ShieldAlert />, label: "Alerts" },
    { href: "/analytics", icon: <BarChart />, label: "Analytics" },
    {
      href: "/model-management",
      icon: <Cpu />,
      label: "Model Management",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg">
            <Gem className="text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-sidebar-foreground">
            Fraud Guardian
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className="justify-start"
              >
                <a href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
