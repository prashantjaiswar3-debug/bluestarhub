
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
  ShieldCheck,
  ScanLine,
  Gift,
  Phone,
  Mail,
  Building,
  FilePlus2,
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
  SidebarSeparator,
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
import { Checkbox } from "@/components/ui/checkbox";


const allNavItems = [
  { href: "/dashboard/admin", icon: LayoutGrid, label: "Assignments", roles: ['admin'] },
  { href: "/dashboard/technician", icon: Wrench, label: "My Jobs", roles: ['technician'] },
  { href: "/dashboard/customer", icon: Users, label: "My Portal", roles: ['customer'] },
  { href: "/dashboard/sales", icon: FileText, label: "Sales & Quotes", roles: ['sales'] },
  { href: "/dashboard/invoices", icon: FilePlus2, label: "Invoices", roles: ['admin', 'sales'] },
];

const roleInfo = {
    admin: { name: "Admin User", email: "admin@bluestar.com", fallback: "AD", id: "ADM-001" },
    technician: { name: "Technician User", email: "tech@bluestar.com", fallback: "TU", id: "TECH-007" },
    customer: { name: "Customer User", email: "customer@bluestar.com", fallback: "CU", id: "CUST-101" },
    sales: { name: "Sales User", email: "sales@bluestar.com", fallback: "SU", id: "SALES-003" },
    default: { name: "Demo User", email: "user@bluestar.com", fallback: "DU", id: "USER-000" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [isRegisterCustomerOpen, setIsRegisterCustomerOpen] = React.useState(false);
  const [newCustomer, setNewCustomer] = React.useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    isCompany: false,
    companyName: ""
  });

  const [isRegisterTechnicianOpen, setIsRegisterTechnicianOpen] = React.useState(false);
  const [newTechnician, setNewTechnician] = React.useState({ name: "", email: "", phone: "", skills: "" });
  
  const [isRegisterSalesOpen, setIsRegisterSalesOpen] = React.useState(false);
  const [newSales, setNewSales] = React.useState({ name: "", email: "", phone: "" });

  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
  const [passwordFields, setPasswordFields] = React.useState({ current: "", new: "", confirm: "" });

  const [isProfileOpen, setIsProfileOpen] = React.useState(false);


  const getRole = () => {
    if (pathname.startsWith('/dashboard/admin')) return 'admin';
    if (pathname.startsWith('/dashboard/technician')) return 'technician';
    if (pathname.startsWith('/dashboard/customer')) return 'customer';
    if (pathname.startsWith('/dashboard/sales') || pathname.startsWith('/dashboard/invoices')) return 'sales';
    return 'admin';
  }
  
  const handleRegisterCustomer = () => {
    if(!newCustomer.name || !newCustomer.email || !newCustomer.phone || !newCustomer.address || (newCustomer.isCompany && !newCustomer.companyName)) {
         toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all required fields to register a new customer.",
        });
        return;
    }
    const generatedPassword = Math.random().toString(36).slice(-8);
    const customerName = newCustomer.isCompany ? newCustomer.companyName : newCustomer.name;
    toast({
      title: "Customer Registered",
      description: `Customer ${customerName} created. Email: ${newCustomer.email}, Password: ${generatedPassword}`,
      duration: 9000,
    });
    setIsRegisterCustomerOpen(false);
    setNewCustomer({ name: "", email: "", phone: "", address: "", isCompany: false, companyName: "" });
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
                    <SidebarMenuButton onClick={() => {}} tooltip={{ children: "Manage Offers" }}>
                      <Gift className="shrink-0" />
                      <span>Manage Offers</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
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
            <SidebarSeparator />
            <div className="p-2 text-xs text-sidebar-foreground/70 space-y-3 flex flex-col items-center">
                <div className="font-semibold">Developed by -</div>
                <div className="w-24 h-auto">
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="fill-current">
                        <path d="M50 10L10 30V70L50 90L90 70V30L50 10ZM50 20L80 35V65L50 80L20 65V35L50 20Z" fillOpacity="0.1"/>
                        <path d="M63.4,26.6,50,18,36.6,26.6,25,44.2v25L50,82l25-12.8v-25Zm-25,4.8L50,38.6,61.6,31.4,70,44.2,50,55.8,30,44.2ZM27.5,47,50,58.6,72.5,47,80,59.8,50,71.4,20,59.8ZM50,61.4,27.5,74.2H72.5Z" transform="translate(0, -5) scale(1.1)"/>
                        <path d="M49.9,2.5c-0.2,0-0.4,0-0.6,0.1L9,24.1c-0.3,0.2-0.5,0.5-0.5,0.9v49c0,0.4,0.2,0.7,0.5,0.9l40.3,21.5c0.2,0.1,0.4,0.1,0.6,0.1s0.4,0,0.6-0.1l40.3-21.5c0.3-0.2,0.5-0.5,0.5-0.9v-49c0-0.4-0.2-0.7-0.5-0.9L50.5,2.6C50.3,2.5,50.1,2.5,49.9,2.5z M48.6,25.9l-22.1,12l-2.8-5.3l25-13.3L48.6,25.9z M21,39.5l28.1,15.2v35.8l-28.1-15V39.5z M79,65.5l-28.1,15V44.7L79,29.5V65.5z M51.4,25.9L73.5,14l2.8,5.3l-25,13.3L51.4,25.9z"/>
                        <text x="50" y="88" textAnchor="middle" fontSize="10" fontFamily="sans-serif" fill="currentColor">DIGITAL FOX</text>
                        <text x="50" y="96" textAnchor="middle" fontSize="6" fontFamily="sans-serif" fill="currentColor" letterSpacing="0.1em">STUDIO</text>
                    </svg>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a href="tel:+919569737176" className="hover:underline">+91 9569737176</a>
                </div>
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <a href="mailto:thefoxcreations3@gmail.com" className="hover:underline truncate">thefoxcreations3@gmail.com</a>
                </div>
            </div>
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
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsProfileOpen(true)}>
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
             <div className="flex items-center space-x-2">
                <Checkbox id="is-company" checked={newCustomer.isCompany} onCheckedChange={(checked) => setNewCustomer({...newCustomer, isCompany: !!checked})} />
                <Label htmlFor="is-company" className="cursor-pointer">Registering as a company?</Label>
            </div>

            {newCustomer.isCompany && (
                <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" value={newCustomer.companyName} onChange={(e) => setNewCustomer({...newCustomer, companyName: e.target.value})} placeholder="e.g., ABC Corporation" />
                </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">{newCustomer.isCompany ? "Contact Person Name" : "Full Name"}</Label>
              <Input id="name" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} placeholder={newCustomer.isCompany ? "e.g., John Doe" : "e.g., John Doe"} />
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
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-md sm:max-w-md w-full h-full sm:h-auto sm:w-auto p-0 sm:p-6">
            <DialogHeader className="p-6 pb-0 sm:pb-6 sm:p-0">
                <DialogTitle>My Profile</DialogTitle>
                <DialogDescription>
                    Review your account details below.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 h-full sm:h-auto">
                {['technician', 'sales'].includes(currentRole) ? (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm max-w-sm mx-auto h-full flex flex-col">
                        <div className="p-6 flex flex-col items-center gap-4 bg-primary text-primary-foreground rounded-t-lg">
                           <div className="flex items-center gap-2">
                             <Gem className="h-6 w-6" />
                             <h3 className="text-lg font-bold">Bluestar Hub</h3>
                           </div>
                           <Avatar className="h-24 w-24 border-4 border-background">
                               <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="profile picture" />
                               <AvatarFallback>{currentUser.fallback}</AvatarFallback>
                           </Avatar>
                        </div>
                        <div className="p-6 space-y-4 text-center flex-1 flex flex-col justify-between">
                            <div>
                               <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                               <p className="text-sm text-muted-foreground uppercase font-semibold">{currentRole}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm bg-muted p-2 rounded-md">
                                <span className="text-muted-foreground">Employee ID</span>
                                <span className="font-mono font-semibold">{currentUser.id}</span>
                            </div>
                            <div className="flex justify-center pt-2">
                                <ScanLine className="h-20 w-20 text-muted-foreground" data-ai-hint="qr code" />
                            </div>
                            <p className="text-xs text-muted-foreground">This card is the property of Bluestar Hub. If found, please return to the nearest office.</p>
                        </div>
                         <div className="px-6 py-4 border-t flex items-center justify-center gap-2 text-primary">
                            <ShieldCheck className="h-5 w-5"/>
                            <span className="font-semibold text-sm">Verified Employee</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 p-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src="https://placehold.co/100x100.png" alt="@user" data-ai-hint="profile picture" />
                            <AvatarFallback>{currentUser.fallback}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{currentUser.name}</h2>
                            <p className="text-muted-foreground">{currentUser.email}</p>
                        </div>
                    </div>
                )}
            </div>
             <DialogFooter className="p-6 pt-0 sm:pt-6 sm:p-0">
                <DialogClose asChild>
                    <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

    

    

    



    