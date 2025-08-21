"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gem,
  Home,
  LayoutGrid,
  Users,
  Wrench,
  FileText,
  UserCircle,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/admin", icon: LayoutGrid, label: "Assignments" },
  { href: "/dashboard/technician", icon: Wrench, label: "Technician View" },
  { href: "/dashboard/customer", icon: Users, label: "Customer Portal" },
  { href: "/dashboard/sales", icon: FileText, label: "Sales & Quotes" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <div className="flex items-center gap-2 p-2">
                <Gem className="size-7 text-primary" />
                <h1 className="text-xl font-semibold">Bluestar Hub</h1>
              </div>
            </SidebarHeader>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={{ children: item.label }}
                      >
                        <item.icon className="shrink-0"/>
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2">
            <div className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-sidebar-accent">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="profile picture" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">Admin User</span>
                <span className="text-xs text-muted-foreground truncate">
                  admin@bluestar.com
                </span>
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/">
                  <SidebarMenuButton tooltip={{ children: "Log Out" }}>
                    <LogOut className="shrink-0" />
                    <span>Log Out</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <h2 className="text-lg font-semibold md:text-xl">
                    {navItems.find(item => pathname.startsWith(item.href))?.label || 'Dashboard'}
                </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
