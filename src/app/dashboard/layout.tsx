
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
  DatabaseZap,
  Copy,
  ChevronDown,
  Briefcase,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Separator } from "@/components/ui/separator";


const allNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard", roles: ['admin', 'sales', 'technician', 'customer', 'supervisor', 'freelance'] },
  { href: "/dashboard/sales", icon: LayoutGrid, label: "Jobs Management", roles: ['admin','sales', 'supervisor'] },
  { href: "/dashboard/technician", icon: Wrench, label: "My Jobs", roles: ['technician', 'freelance'] },
  { href: "/dashboard/technician/expenses", icon: Receipt, label: "My Expenses", roles: ['technician', 'freelance'] },
  { href: "/dashboard/customer", icon: Users, label: "My Portal", roles: ['customer'] },
  { href: "/dashboard/users", icon: UserCog, label: "User Management", roles: ['admin'] },
  { href: "/dashboard/data", icon: DatabaseZap, label: "Data Management", roles: ['admin'] },
];

const operationsNavItems = [
  { href: "/dashboard/quotations", icon: FileText, label: "Quotations", roles: ['sales', 'supervisor'] },
  { href: "/dashboard/invoices", icon: FilePlus2, label: "Invoices", roles: ['admin', 'sales', 'supervisor'] },
  { href: "/dashboard/purchases", icon: ShoppingCart, label: "Purchases", roles: ['admin', 'sales', 'supervisor'] },
  { href: "/dashboard/inventory", icon: Boxes, label: "Inventory", roles: ['admin', 'sales', 'supervisor'] },
  { href: "/dashboard/vendors", icon: Building, label: "Vendors", roles: ['admin', 'sales', 'supervisor'] },
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

type UserRole = 'admin' | 'technician' | 'freelance' | 'customer' | 'sales' | 'supervisor' | 'default';

type UserInfo = {
    name: string;
    email: string;
    fallback: string;
    id: string;
    avatar: string;
    phone: string;
    type?: string;
};

const initialRoleInfo: Record<UserRole, UserInfo> = {
    admin: { name: "Vaibhav Rodge", email: "vaibhav.rodge@bluestar.com", fallback: "VR", id: "ADM-001", avatar: "https://placehold.co/100x100.png", phone: "9876543210" },
    technician: { name: "Technician User", email: "tech@bluestar.com", fallback: "TU", id: "TECH-007", avatar: "https://placehold.co/100x100.png", phone: "9876543211", type: "Fixed" },
    freelance: { name: "Freelancer User", email: "freelance@bluestar.com", fallback: "FU", id: "TECH-F01", avatar: "https://placehold.co/100x100.png", phone: "9876543215", type: "Freelance" },
    customer: { name: "Customer User", email: "customer@bluestar.com", fallback: "CU", id: "CUST-101", avatar: "https://placehold.co/100x100.png", phone: "9876543212" },
    sales: { name: "Vaibhav Rodge", email: "vaibhav.rodge@bluestar.com", fallback: "VR", id: "SALES-001", avatar: "https://placehold.co/100x100.png", phone: "9876543213" },
    supervisor: { name: "Raj Patel", email: "raj.patel@bluestar.com", fallback: "RP", id: "TECH-007", avatar: "https://placehold.co/100x100.png", phone: "9876543211", type: "Fixed" },
    default: { name: "Demo User", email: "user@bluestar.com", fallback: "DU", id: "USER-000", avatar: "https://placehold.co/100x100.png", phone: "9876543214" },
};

type GeneratedCredentials = {
  username: string;
  name: string;
  password?: string;
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
  
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  
  const [passwordFields, setPasswordFields] = React.useState({ current: "", new: "", confirm: "" });
  const [editableProfile, setEditableProfile] = React.useState<UserInfo | null>(null);
  const [newAvatar, setNewAvatar] = React.useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const [isManageOffersOpen, setIsManageOffersOpen] = React.useState(false);
  const [isCompanyProfileOpen, setIsCompanyProfileOpen] = React.useState(false);
  
  const [editableCompanyInfo, setEditableCompanyInfo] = React.useState(companyInfo);
  const qrCodeInputRef = React.useRef<HTMLInputElement>(null);
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  
  const getRole = (): UserRole => {
    if (pathname.startsWith('/dashboard/users') || pathname.startsWith('/dashboard/data')) return 'admin';
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
  
  const currentRole = getRole();
  const currentUser = roleInfo[currentRole] || roleInfo.default;

  React.useEffect(() => {
    try {
        const storedCompanyInfo = localStorage.getItem('companyInfo');
        if (storedCompanyInfo) {
          setCompanyInfo(JSON.parse(storedCompanyInfo));
        }
    } catch (error) {
        console.error("Failed to parse company info from localStorage", error);
    }
  }, []);

  React.useEffect(() => {
    setEditableCompanyInfo(companyInfo);
  }, [companyInfo, isCompanyProfileOpen]);
  
  React.useEffect(() => {
    if (isEditingProfile) {
        setEditableProfile(currentUser);
    } else {
        setEditableProfile(null);
    }
  }, [isEditingProfile, currentUser]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewAvatar(event.target?.result as string);
        if (editableProfile) {
            setEditableProfile({...editableProfile, avatar: event.target?.result as string});
        }
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
  
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (editableProfile) {
        setEditableProfile({...editableProfile, [id]: value});
    }
  };

  const handleProfileSave = () => {
    let changesMade = false;
    if (passwordFields.current || passwordFields.new || passwordFields.confirm) {
        if (!passwordFields.current || !passwordFields.new || !passwordFields.confirm) {
          toast({ variant: "destructive", title: "Missing fields", description: "Please fill all password fields to update." });
          return;
        }
        if (passwordFields.new !== passwordFields.confirm) {
          toast({ variant: "destructive", title: "Passwords do not match", description: "The new password and confirmation do not match." });
          return;
        }
        setPasswordFields({ current: "", new: "", confirm: "" });
        changesMade = true;
    }
    
    if (editableProfile) {
        setRoleInfo(prev => ({
            ...prev,
            [currentRole]: editableProfile
        }));
        changesMade = true;
    }
    
    if (changesMade) {
        toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
    }

    setIsEditingProfile(false);
    setNewAvatar(null);
    setEditableProfile(null);
  }
  
  const handleCompanyProfileSave = () => {
    setCompanyInfo(editableCompanyInfo);
    localStorage.setItem('companyInfo', JSON.stringify(editableCompanyInfo));
    toast({title: "Company Profile Updated", description: "Your company details have been saved."});
    setIsCompanyProfileOpen(false);
  }

  const navItems = allNavItems.filter(item => item.roles.includes(currentRole));
  const filteredOpsNavItems = operationsNavItems.filter(item => item.roles.includes(currentRole));
  
  const isOperationsActive = operationsNavItems.some(item => pathname.startsWith(item.href));

  let dashboardLabel = 'Dashboard';
  const activeTopLevel = allNavItems.find(item => pathname.startsWith(item.href) && item.href !== '/dashboard');
  if (activeTopLevel) {
    dashboardLabel = activeTopLevel.label;
  } else if (isOperationsActive) {
    const activeOp = operationsNavItems.find(item => pathname.startsWith(item.href));
    dashboardLabel = activeOp?.label || 'Operations';
  }


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
                if(item.href === '/dashboard/technician' && currentRole === 'freelance') return null;
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

              {filteredOpsNavItems.length > 0 && (
                 <Collapsible defaultOpen={isOperationsActive}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isSubmenu
                          className="!h-auto !p-0"
                        >
                          <div className="flex w-full items-center justify-between p-2">
                            <div className="flex items-center gap-2">
                              <Briefcase className="shrink-0" />
                              <span>Operations</span>
                            </div>
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                    </SidebarMenuItem>
                    <CollapsibleContent asChild>
                      <SidebarMenu>
                        {filteredOpsNavItems.map((item) => {
                          const isActive = pathname.startsWith(item.href);
                          return (
                            <SidebarMenuItem key={item.href}>
                              <Link href={item.href}>
                                <SidebarMenuButton
                                  variant="ghost"
                                  isActive={isActive}
                                  tooltip={{ children: item.label }}
                                  className="ml-5"
                                >
                                  <item.icon className="shrink-0"/>
                                  <span>{item.label}</span>
                                </SidebarMenuButton>
                              </Link>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </CollapsibleContent>
                  </Collapsible>
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
      <Dialog open={isProfileOpen} onOpenChange={(open) => { setIsProfileOpen(open); if (!open) { setIsEditingProfile(false); setNewAvatar(null); } }}>
        <DialogContent className="sm:max-w-md w-full h-full sm:h-auto p-0 flex flex-col">
            <DialogHeader className="p-6 pb-0 sm:pb-6 flex-row items-center justify-between">
                <div>
                    <DialogTitle>{isEditingProfile ? "Edit Profile" : "My Profile"}</DialogTitle>
                    <DialogDescription>
                        {isEditingProfile ? "Update your profile details and password." : "Review your account details below."}
                    </DialogDescription>
                </div>
                 {!isEditingProfile && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                )}
            </DialogHeader>
            <ScrollArea className="flex-1 px-1">
              <div className="py-4 px-6">
                  {isEditingProfile && editableProfile ? (
                      <div className="space-y-6">
                           <div className="flex flex-col items-center gap-4">
                               <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                               <Avatar className="h-32 w-32 cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                  <AvatarImage src={newAvatar || editableProfile.avatar} alt="@user" />
                                  <AvatarFallback>{editableProfile.fallback}</AvatarFallback>
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                                      <Upload className="h-8 w-8"/>
                                  </div>
                              </Avatar>
                           </div>
                           <div className="space-y-4">
                               <div className="space-y-2">
                                  <Label htmlFor="name">Full Name</Label>
                                  <Input id="name" value={editableProfile.name} onChange={handleProfileInputChange} />
                               </div>
                               <div className="space-y-2">
                                  <Label htmlFor="email">Email</Label>
                                  <Input id="email" type="email" value={editableProfile.email} onChange={handleProfileInputChange} />
                               </div>
                               <div className="space-y-2">
                                  <Label htmlFor="phone">Phone</Label>
                                  <Input id="phone" type="tel" value={editableProfile.phone} onChange={handleProfileInputChange} />
                               </div>
                           </div>
                           <Separator />
                           <div>
                               <h3 className="text-lg font-medium">Change Password</h3>
                               <div className="space-y-4 mt-4">
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
                           </div>
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
            </ScrollArea>
             <DialogFooter className="p-6 pt-0">
                {isEditingProfile ? (
                     <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={() => { setIsEditingProfile(false); setNewAvatar(null); }}>Cancel</Button>
                        <Button onClick={handleProfileSave}>Save Changes</Button>
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

    

    