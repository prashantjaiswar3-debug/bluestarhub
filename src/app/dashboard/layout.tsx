
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import Image from "next/image";
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
  FilePlus2,
  Trash2,
  Edit,
  Upload,
  Home,
  UserCog,
  ShoppingCart,
  Boxes,
  Building,
  Receipt,
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
import { Card, CardContent } from "@/components/ui/card";
import QRCode from "react-qr-code";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyInfo, Technician } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";


const allNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard", roles: ['admin', 'sales', 'technician', 'customer', 'supervisor', 'freelance'] },
  { href: "/dashboard/sales", icon: LayoutGrid, label: "Jobs Management", roles: ['admin','sales', 'supervisor'] },
  { href: "/dashboard/technician", icon: Wrench, label: "My Jobs", roles: ['technician', 'freelance'] },
  { href: "/dashboard/technician/expenses", icon: Receipt, label: "My Expenses", roles: ['technician', 'freelance'] },
  { href: "/dashboard/customer", icon: Users, label: "My Portal", roles: ['customer'] },
  { href: "/dashboard/quotations", icon: FileText, label: "Quotations", roles: ['sales', 'supervisor'] },
  { href: "/dashboard/invoices", icon: FilePlus2, label: "Invoices", roles: ['admin', 'sales', 'supervisor'] },
  { href: "/dashboard/purchases", icon: ShoppingCart, label: "Purchases", roles: ['admin', 'sales', 'supervisor'] },
  { href: "/dashboard/inventory", icon: Boxes, label: "Inventory", roles: ['admin', 'sales', 'supervisor'] },
  { href: "/dashboard/vendors", icon: Building, label: "Vendors", roles: ['admin', 'sales', 'supervisor'] },
  { href: "/dashboard/admin/users", icon: UserCog, label: "User Management", roles: ['admin'] },
];

const initialCompanyInfo: CompanyInfo = {
    name: "Bluestar Electronics",
    logo: "https://raw.githubusercontent.com/prashantjaiswar3-debug/Bluestar/refs/heads/main/bluestarlogo1.png",
    email: "bluestar.elec@gmail.com",
    phone: "+91 9766661333",
    gstin: "27AAPFU0939F1Z5",
    bank: {
        accountHolder: 'Bluestar Electronics',
        accountNumber: '123456789012',
        bankName: 'Global Bank',
        ifscCode: 'GBL0000123',
        qrCode: ''
    }
};

const initialRoleInfo = {
    admin: { name: "Vaibhav Rodge", email: "vaibhav.rodge@bluestar.com", fallback: "VR", id: "ADM-001", avatar: "https://placehold.co/100x100.png", phone: "9876543210" },
    technician: { name: "Technician User", email: "tech@bluestar.com", fallback: "TU", id: "TECH-007", avatar: "https://placehold.co/100x100.png", phone: "9876543211", type: "Fixed" },
    freelance: { name: "Freelancer User", email: "freelance@bluestar.com", fallback: "FU", id: "TECH-F01", avatar: "https://placehold.co/100x100.png", phone: "9876543215", type: "Freelance" },
    customer: { name: "Customer User", email: "customer@bluestar.com", fallback: "CU", id: "CUST-101", avatar: "https://placehold.co/100x100.png", phone: "9876543212" },
    sales: { name: "Vaibhav Rodge", email: "vaibhav.rodge@bluestar.com", fallback: "VR", id: "SALES-001", avatar: "https://placehold.co/100x100.png", phone: "9876543213" },
    supervisor: { name: "Raj Patel", email: "raj.patel@bluestar.com", fallback: "RP", id: "TECH-007", avatar: "https://placehold.co/100x100.png", phone: "9876543211", type: "Fixed" },
    default: { name: "Demo User", email: "user@bluestar.com", fallback: "DU", id: "USER-000", avatar: "https://placehold.co/100x100.png", phone: "9876543214" },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [roleInfo, setRoleInfo] = React.useState(initialRoleInfo);
  const [companyInfo, setCompanyInfo] = React.useState(initialCompanyInfo);

  const [isRegisterCustomerOpen, setIsRegisterCustomerOpen] = React.useState(false);
  const [newCustomer, setNewCustomer] = React.useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    isCompany: false,
    companyName: "",
    gstin: "",
  });

  const [isRegisterTechnicianOpen, setIsRegisterTechnicianOpen] = React.useState(false);
  const [newTechnician, setNewTechnician] = React.useState({ name: "", email: "", phone: "", skills: "", type: "Fixed" as Technician['type'] });
  
  const [isRegisterSalesOpen, setIsRegisterSalesOpen] = React.useState(false);
  const [newSales, setNewSales] = React.useState({ name: "", email: "", phone: "" });

  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false);
  const [passwordFields, setPasswordFields] = React.useState({ current: "", new: "", confirm: "" });

  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [newAvatar, setNewAvatar] = React.useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const [isManageOffersOpen, setIsManageOffersOpen] = React.useState(false);
  const [isCompanyProfileOpen, setIsCompanyProfileOpen] = React.useState(false);
  
  const [editableCompanyInfo, setEditableCompanyInfo] = React.useState(companyInfo);
  const qrCodeInputRef = React.useRef<HTMLInputElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  
  React.useEffect(() => {
    const storedCompanyInfo = localStorage.getItem('companyInfo');
    if (storedCompanyInfo) {
      setCompanyInfo(JSON.parse(storedCompanyInfo));
    }
  }, []);

  React.useEffect(() => {
    setEditableCompanyInfo(companyInfo);
  }, [companyInfo, isCompanyProfileOpen]);

  const getRole = () => {
    if (pathname.startsWith('/dashboard/admin')) return 'admin';
    if (pathname.startsWith('/dashboard/technician/freelance')) return 'freelance';
    if (pathname.startsWith('/dashboard/technician')) return 'technician';
    if (pathname.startsWith('/dashboard/customer')) return 'customer';
    if (pathname.startsWith('/dashboard/sales') || pathname.startsWith('/dashboard/invoices') || pathname.startsWith('/dashboard/quotations') || pathname.startsWith('/dashboard/purchases') || pathname.startsWith('/dashboard/inventory') || pathname.startsWith('/dashboard/vendors')) {
        const supervisor = initialRoleInfo.supervisor;
        if (supervisor.name === "Raj Patel") return 'supervisor';
        return 'sales';
    }
    if (pathname === '/dashboard') return 'admin';
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
    setNewCustomer({ name: "", email: "", phone: "", address: "", isCompany: false, companyName: "", gstin: "" });
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
      description: `${newTechnician.type} Technician ${newTechnician.name} created. Email: ${newTechnician.email}, Password: ${generatedPassword}`,
      duration: 9000,
    });
    setIsRegisterTechnicianOpen(false);
    setNewTechnician({ name: "", email: "", phone: "", skills: "", type: "Fixed" });
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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewAvatar(event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

   const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditableCompanyInfo(prev => ({ ...prev, logo: event.target?.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditableCompanyInfo(prev => ({ ...prev, bank: { ...prev.bank!, qrCode: event.target?.result as string }}));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleProfileSave = () => {
    if (newAvatar) {
        setRoleInfo(prev => ({
            ...prev,
            [currentRole]: { ...prev[currentRole as keyof typeof prev], avatar: newAvatar }
        }));
    }
    toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    setIsEditingProfile(false);
    setNewAvatar(null);
  }
  
  const handleCompanyProfileSave = () => {
    setCompanyInfo(editableCompanyInfo);
    localStorage.setItem('companyInfo', JSON.stringify(editableCompanyInfo));
    toast({title: "Company Profile Updated", description: "Your company details have been saved."});
    setIsCompanyProfileOpen(false);
  }

  const currentRole = getRole();
  const navItems = allNavItems.filter(item => {
    if (item.href === '/dashboard/technician' && currentRole === 'freelance') return false;
    return item.roles.includes(currentRole)
  });

  const dashboardLabel = navItems.find(item => pathname.startsWith(item.href) && item.href !== '/dashboard')?.label || 'Dashboard';
  const currentUser = roleInfo[currentRole as keyof typeof roleInfo] || roleInfo.default;

  const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${currentUser.name}
EMAIL:${currentUser.email}
TEL:${currentUser.phone}
END:VCARD`;

  return (
    <SidebarProvider>
      <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
        <Sidebar>
          <SidebarContent>
            <SidebarHeader>
              <div className="flex items-center justify-center p-2">
                 <Image src={companyInfo.logo} alt="Bluestar Logo" width={200} height={80} className="w-48 h-auto" unoptimized/>
              </div>
            </SidebarHeader>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
                 if(item.href === '/dashboard/technician' && currentRole === 'technician') {
                    // Default to My Jobs for fixed technicians
                    return (
                      <SidebarMenuItem key={item.href}>
                        <Link href="/dashboard/technician">
                           <SidebarMenuButton
                            isActive={isActive}
                            tooltip={{ children: item.label }}
                          >
                            <item.icon className="shrink-0"/>
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    )
                }
                 if(item.href === '/dashboard/technician/expenses' && isEditingProfile) {
                     return null;
                 }
                
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
                    <SidebarMenuButton onClick={() => setIsCompanyProfileOpen(true)} tooltip={{ children: "Company Profile" }}>
                      <Building className="shrink-0" />
                      <span>Company Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => setIsManageOffersOpen(true)} tooltip={{ children: "Manage Offers" }}>
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
                <AvatarImage src={currentUser.avatar} alt="@user" data-ai-hint="profile picture" />
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
        <div className="flex flex-1 flex-col overflow-y-auto">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <h2 className="text-lg font-semibold md:text-xl">
                    {dashboardLabel}
                </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-sidebar-accent">
                <Bell className="h-5 w-5" />
                <span className="sr-only">Notifications</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-sidebar-accent" onClick={() => setIsChangePasswordOpen(true)}>
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-sidebar-accent" onClick={() => setIsProfileOpen(true)}>
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-2 sm:p-4 md:p-6">{children}</main>
        </div>
      </div>
       <Dialog open={isCompanyProfileOpen} onOpenChange={setIsCompanyProfileOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Company Profile</DialogTitle>
                <DialogDescription>
                    Update your company's details. These will be reflected across the app.
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] p-1">
              <div className="grid gap-6 py-4 pr-5">
                  <div className="space-y-2">
                      <Label htmlFor="company-name-edit">Company Name</Label>
                      <Input id="company-name-edit" value={editableCompanyInfo.name} onChange={(e) => setEditableCompanyInfo(prev => ({...prev, name: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                      <Label>Company Logo</Label>
                      <div className="flex items-center gap-4">
                          <Input type="file" ref={logoInputRef} onChange={handleLogoChange} accept="image/*" className="hidden" />
                          <div className="w-32 h-16 flex items-center justify-center rounded-md border bg-muted">
                            {editableCompanyInfo.logo ? (
                                <Image src={editableCompanyInfo.logo} alt="Company Logo Preview" width={120} height={60} className="object-contain h-full w-auto" unoptimized/>
                            ) : (
                                <div className="text-muted-foreground text-xs text-center">No Logo</div>
                            )}
                          </div>
                          <Button variant="outline" onClick={() => logoInputRef.current?.click()}>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Logo
                          </Button>
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="company-email-edit">Email</Label>
                      <Input id="company-email-edit" type="email" value={editableCompanyInfo.email} onChange={(e) => setEditableCompanyInfo(prev => ({...prev, email: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="company-phone-edit">Phone</Label>
                      <Input id="company-phone-edit" value={editableCompanyInfo.phone} onChange={(e) => setEditableCompanyInfo(prev => ({...prev, phone: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="company-gstin-edit">GSTIN</Label>
                      <Input id="company-gstin-edit" value={editableCompanyInfo.gstin || ''} onChange={(e) => setEditableCompanyInfo(prev => ({...prev, gstin: e.target.value}))} />
                  </div>

                  <div className="space-y-4 rounded-md border p-4">
                    <h4 className="font-medium text-sm">Bank Details for Payments</h4>
                    <div className="space-y-2">
                        <Label htmlFor="bank-account-holder">Account Holder Name</Label>
                        <Input id="bank-account-holder" value={editableCompanyInfo.bank?.accountHolder || ''} onChange={(e) => setEditableCompanyInfo(prev => ({...prev, bank: {...prev.bank!, accountHolder: e.target.value}}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Input id="bank-name" value={editableCompanyInfo.bank?.bankName || ''} onChange={(e) => setEditableCompanyInfo(prev => ({...prev, bank: {...prev.bank!, bankName: e.target.value}}))} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="bank-account-number">Account Number</Label>
                            <Input id="bank-account-number" value={editableCompanyInfo.bank?.accountNumber || ''} onChange={(e) => setEditableCompanyInfo(prev => ({...prev, bank: {...prev.bank!, accountNumber: e.target.value}}))} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bank-ifsc">IFSC Code</Label>
                            <Input id="bank-ifsc" value={editableCompanyInfo.bank?.ifscCode || ''} onChange={(e) => setEditableCompanyInfo(prev => ({...prev, bank: {...prev.bank!, ifscCode: e.target.value}}))} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Payment QR Code</Label>
                        <div className="flex items-center gap-4">
                            <Input type="file" ref={qrCodeInputRef} onChange={handleQrCodeChange} accept="image/*" className="hidden" />
                            <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center border">
                              {editableCompanyInfo.bank?.qrCode ? (
                                  <Image src={editableCompanyInfo.bank.qrCode} alt="QR Code Preview" width={80} height={80} className="object-contain" unoptimized/>
                              ) : (
                                  <div className="text-muted-foreground text-xs text-center">No Image</div>
                              )}
                            </div>
                            <Button variant="outline" onClick={() => qrCodeInputRef.current?.click()}>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload QR
                            </Button>
                        </div>
                    </div>
                  </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
                 <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                </DialogClose>
                 <Button onClick={handleCompanyProfileSave}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isManageOffersOpen} onOpenChange={setIsManageOffersOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Offers</DialogTitle>
            <DialogDescription>
              Add, edit, or remove promotional offers displayed to customers.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1">
            <div className="grid gap-6 py-4 pr-5">
              <Card>
                  <CardContent className="p-4 grid gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="offer-title">Offer Title</Label>
                          <Input id="offer-title" placeholder="e.g., Upgrade Your Security" />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="offer-description">Offer Description</Label>
                          <Textarea id="offer-description" placeholder="e.g., Get 20% off on all new smart camera installations." />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor="offer-image">Image URL</Label>
                          <Input id="offer-image" placeholder="https://placehold.co/600x400.png" />
                      </div>
                      <Button className="w-full">Add New Offer</Button>
                  </CardContent>
              </Card>
              <div>
                  <h3 className="text-lg font-medium mb-4">Current Offers</h3>
                  <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                          <Image src="https://placehold.co/600x400.png" alt="Offer 1" width={100} height={60} className="rounded-md" />
                          <div className="flex-1">
                              <p className="font-semibold">Upgrade Your Security</p>
                              <p className="text-sm text-muted-foreground">Get 20% off on all new smart camera installations.</p>
                          </div>
                          <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                      </div>
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                          <Image src="https://placehold.co/600x400.png" alt="Offer 2" width={100} height={60} className="rounded-md" />
                          <div className="flex-1">
                              <p className="font-semibold">Peace of Mind Plan</p>
                              <p className="text-sm text-muted-foreground">Sign up for our Annual Maintenance Contract and get the first month free.</p>
                          </div>
                          <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                      </div>
                  </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isRegisterCustomerOpen} onOpenChange={setIsRegisterCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Customer</DialogTitle>
            <DialogDescription>
              Enter the customer's details below to create a new account and generate login credentials.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-1">
            <div className="grid gap-4 py-4 pr-5">
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
                <Label htmlFor="gstin">GSTIN (Optional)</Label>
                <Input id="gstin" value={newCustomer.gstin} onChange={(e) => setNewCustomer({...newCustomer, gstin: e.target.value})} placeholder="e.g., 27AAPFU0939F1Z5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} placeholder="e.g., 123 Main St, Anytown" />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleRegisterCustomer} className="whitespace-normal">Register & Generate Credentials</Button>
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
            <div className="space-y-2">
                <Label htmlFor="tech-type">Technician Type</Label>
                <Select value={newTechnician.type} onValueChange={(value: Technician['type']) => setNewTechnician(prev => ({...prev, type: value}))}>
                    <SelectTrigger id="tech-type">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Fixed">Fixed</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                </Select>
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
              <Label htmlFor="new-password">New Password</Label>              <Input id="new-password" type="password" value={passwordFields.new} onChange={(e) => setPasswordFields({...passwordFields, new: e.target.value})} />
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
      <Dialog open={isProfileOpen} onOpenChange={(open) => { setIsProfileOpen(open); if (!open) { setIsEditingProfile(false); setNewAvatar(null); } }}>
        <DialogContent className="sm:max-w-md w-full h-full sm:h-auto p-0 flex flex-col">
            <DialogHeader className="p-6 pb-0 sm:pb-6 flex-row items-center justify-between">
                <div>
                    <DialogTitle>My Profile</DialogTitle>
                    <DialogDescription>
                        {isEditingProfile ? "Update your profile picture." : "Review your account details below."}
                    </DialogDescription>
                </div>
                 {!isEditingProfile && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                )}
            </DialogHeader>
            <div className="py-4 px-6 flex-1 overflow-y-auto">
                {isEditingProfile ? (
                    <div className="flex flex-col items-center gap-4">
                         <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                         <Avatar className="h-32 w-32 cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                            <AvatarImage src={newAvatar || currentUser.avatar} alt="@user" />
                            <AvatarFallback>{currentUser.fallback}</AvatarFallback>
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                                <Upload className="h-8 w-8"/>
                            </div>
                        </Avatar>
                        <p className="text-sm text-muted-foreground">Click the image to upload a new one.</p>
                    </div>
                ) : ['technician', 'sales', 'admin', 'supervisor', 'freelance'].includes(currentRole) ? (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm max-w-sm mx-auto h-full flex flex-col">
                        <div className="p-6 flex flex-col items-center gap-4 bg-primary text-primary-foreground rounded-t-lg">
                           <div className="w-32 h-auto">
                             <Image src={companyInfo.logo} alt="Company Logo" width={160} height={64} className="w-full h-auto" unoptimized/>
                           </div>
                           <Avatar className="h-24 w-24 border-4 border-background">
                               <AvatarImage src={currentUser.avatar} alt="@user" />
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
                            <div className="flex justify-center pt-2 bg-white p-2 rounded-md">
                                <QRCode
                                  value={vCard}
                                  size={80}
                                  className="h-20 w-20"
                                  viewBox={`0 0 80 80`}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">This card is the property of {companyInfo.name}. If found, please return to the nearest office.</p>
                        </div>
                         <div className="px-6 py-4 border-t flex items-center justify-center gap-2 text-primary">
                            <ShieldCheck className="h-5 w-5"/>
                            <span className="font-semibold text-sm">Verified Employee</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-4 p-6">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={currentUser.avatar} alt="@user" />
                            <AvatarFallback>{currentUser.fallback}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                            <h2 className="text-xl font-bold">{currentUser.name}</h2>
                            <p className="text-muted-foreground">{currentUser.email}</p>
                        </div>
                    </div>
                )}
            </div>
             <DialogFooter className="p-6 pt-0">
                {isEditingProfile ? (
                     <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={() => { setIsEditingProfile(false); setNewAvatar(null); }}>Cancel</Button>
                        <Button onClick={handleProfileSave}>Save</Button>
                    </div>
                ) : (
                    <DialogClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto">Close</Button>
                    </DialogClose>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}

    

    
