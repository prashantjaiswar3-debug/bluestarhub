
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Gem,
  LayoutGrid,
  Users,
  Wrench,
  FileText,
  UserCircle,
  LogOut,
  Settings,
  Bell,
  UserPlus,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";


const allNavItems = [
  { href: "/dashboard/admin", icon: LayoutGrid, label: "Assignments", roles: ['admin'] },
  { href: "/dashboard/technician", icon: Wrench, label: "My Jobs", roles: ['technician'] },
  { href: "/dashboard/customer", icon: Users, label: "My Portal", roles: ['customer'] },
  { href: "/dashboard/sales", icon: FileText, label: "Sales & Quotes", roles: ['sales'] },
];

const roleInfo = {
    admin: { name: "Admin User", email: "admin@bluestar.com", fallback: "AD" },
    technician: { name: "Technician User", email: "tech@bluestar.com", fallback: "TU" },
    customer: { name: "Customer User", email: "customer@bluestar.com", fallback: "CU" },
    sales: { name: "Sales User", email: "sales@bluestar.com", fallback: "SU" },
    default: { name: "Demo User", email: "user@bluestar.com", fallback: "DU" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [isRegisterCustomerOpen, setIsRegisterCustomerOpen] = React.useState(false);
  const [newCustomer, setNewCustomer] = React.useState({ name: "", email: "", phone: "", address: "" });

  const [isRegisterTechnicianOpen, setIsRegisterTechnicianOpen] = React.useState(false);
  const [newTechnician, setNewTechnician] = React.useState({ name: "", email: "", phone: "", skills: "" });
  
  const [isRegisterSalesOpen, setIsRegisterSalesOpen] = React.useState(false);
  const [newSales, setNewSales] = React.useState({ name: "", email: "", phone: "" });

  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
  const [passwordFields, setPasswordFields] = React.useState({ current: "", new: "", confirm: "" });


  const getRole = () => {
    if (pathname.startsWith('/dashboard/admin')) return 'admin';
    if (pathname.startsWith('/dashboard/technician')) return 'technician';
    if (pathname.startsWith('/dashboard/customer')) return 'customer';
    if (pathname.startsWith('/dashboard/sales')) return 'sales';
    return 'admin';
  }
  
  const handleRegisterCustomer = () => {
    if(!newCustomer.name || !newCustomer.email || !newCustomer.phone || !newCustomer.address) {
         toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields to register a new customer.",
        });
        return;
    }
    const generatedPassword = Math.random().toString(36).slice(-8);
    toast({
      title: "Customer Registered",
      description: `Customer ${newCustomer.name} created. Email: ${newCustomer.email}, Password: ${generatedPassword}`,
      duration: 9000,
    });
    setIsRegisterCustomerOpen(false);
    setNewCustomer({ name: "", email: "", phone: "", address: "" });
  }

  const handleRegisterTechnician = () => {
    if(!newTechnician.name || !newTechnician.email || !newTechnician.phone || !newTechnician.skills) {
         toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields to register a new technician.",
        });
        return;
    }
    const generatedPassword = Math.random().toString(36).slice(-8);
    toast({
      title: "Technician Registered",
      description: `Technician ${newTechnician.name} created. Email: ${newTechnician.email}, Password: ${generatedPassword}`,
      duration: 9000,
    });
    setIsRegisterTechnicianOpen(false);
    setNewTechnician({ name: "", email: "", phone: "", skills: "" });
  }

  const handleRegisterSales = () => {
    if(!newSales.name || !newSales.email || !newSales.phone) {
         toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields to register a new sales user.",
        });
        return;
    }
    const generatedPassword = Math.random().toString(36).slice(-8);
    toast({
      title: "Sales User Registered",
      description: `Sales user ${newSales.name} created. Email: ${newSales.email}, Password: ${generatedPassword}`,
      duration: 9000,
    });
    setIsRegisterSalesOpen(false);
    setNewSales({ name: "", email: "", phone: "" });
  }

  const handleChangePassword = () => {
    if (!passwordFields.current || !passwordFields.new || !passwordFields.confirm) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill all password fields." });
      return;
    }
    if (passwordFields.new !== passwordFields.confirm) {
      toast({ variant: "destructive", title: "Passwords do not match", description: "The new password and confirmation do not match." });
      return;
    }
    toast({ title: "Password Updated", description: "Your password has been changed successfully." });
    setIsChangePasswordOpen(false);
    setPasswordFields({ current: "", new: "", confirm: "" });
  };

  const currentRole = getRole();
  const navItems = allNavItems.filter(item => item.roles.includes(currentRole));

  const currentUser = roleInfo[currentRole] || roleInfo.default;
  const dashboardLabel = navItems.find(item => pathname.startsWith(item.href))?.label || 'Dashboard';


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
               {currentRole === 'technician' && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setIsRegisterCustomerOpen(true)}
                    tooltip={{ children: "Register Customer" }}
                  >
                    <UserPlus className="shrink-0" />
                    <span>Register Customer</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
               {currentRole === 'admin' && (
                <>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsRegisterCustomerOpen(true)} tooltip={{ children: "Register Customer" }}>
                      <UserPlus className="shrink-0" />
                      <span>Register Customer</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsRegisterTechnicianOpen(true)} tooltip={{ children: "Register Technician" }}>
                      <UserPlus className="shrink-0" />
                      <span>Register Technician</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsRegisterSalesOpen(true)} tooltip={{ children: "Register Sales" }}>
                      <UserPlus className="shrink-0" />
                      <span>Register Sales</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2">
            <div className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-sidebar-accent">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="profile picture" />
                <AvatarFallback>{currentUser.fallback}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground truncate">
                  {currentUser.email}
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
                    {dashboardLabel}
                </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsChangePasswordOpen(true)}>
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
      <Dialog open={isRegisterCustomerOpen} onOpenChange={setIsRegisterCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Customer</DialogTitle>
            <DialogDescription>
              Enter the customer's details below to create a new account and generate login credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} placeholder="e.g., John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} placeholder="e.g., john.doe@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} placeholder="e.g., 9876543210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} placeholder="e.g., 123 Main St, Anytown" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleRegisterCustomer}>Register & Generate Credentials</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isRegisterTechnicianOpen} onOpenChange={setIsRegisterTechnicianOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Technician</DialogTitle>
            <DialogDescription>
              Enter the technician's details below to create a new account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tech-name">Full Name</Label>
              <Input id="tech-name" value={newTechnician.name} onChange={(e) => setNewTechnician({...newTechnician, name: e.target.value})} placeholder="e.g., Raj Patel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tech-email">Email Address</Label>
              <Input id="tech-email" type="email" value={newTechnician.email} onChange={(e) => setNewTechnician({...newTechnician, email: e.target.value})} placeholder="e.g., raj.patel@bluestar.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tech-phone">Phone Number</Label>
              <Input id="tech-phone" value={newTechnician.phone} onChange={(e) => setNewTechnician({...newTechnician, phone: e.target.value})} placeholder="e.g., 9876543210" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="tech-skills">Skills</Label>
              <Input id="tech-skills" value={newTechnician.skills} onChange={(e) => setNewTechnician({...newTechnician, skills: e.target.value})} placeholder="e.g., Installation, Repair" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleRegisterTechnician}>Register Technician</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
       <Dialog open={isRegisterSalesOpen} onOpenChange={setIsRegisterSalesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Sales User</DialogTitle>
            <DialogDescription>
              Enter the sales user's details below to create a new account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sales-name">Full Name</Label>
              <Input id="sales-name" value={newSales.name} onChange={(e) => setNewSales({...newSales, name: e.target.value})} placeholder="e.g., Priya Sharma" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-email">Email Address</Label>
              <Input id="sales-email" type="email" value={newSales.email} onChange={(e) => setNewSales({...newSales, email: e.target.value})} placeholder="e.g., priya.sharma@bluestar.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-phone">Phone Number</Label>
              <Input id="sales-phone" value={newSales.phone} onChange={(e) => setNewSales({...newSales, phone: e.target.value})} placeholder="e.g., 9876543210" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleRegisterSales}>Register Sales User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your password here. After saving, you will be logged out and need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" value={passwordFields.current} onChange={(e) => setPasswordFields({...passwordFields, current: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={passwordFields.new} onChange={(e) => setPasswordFields({...passwordFields, new: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" type="password" value={passwordFields.confirm} onChange={(e) => setPasswordFields({...passwordFields, confirm: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleChangePassword}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
