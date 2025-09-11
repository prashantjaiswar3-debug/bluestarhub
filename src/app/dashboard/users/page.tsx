
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, UserPlus, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Technician } from "@/lib/types";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Sales" | "Technician" | "Customer" | "Supervisor";
  status: "Active" | "Inactive";
  password?: string;
};

type GeneratedCredentials = {
  username: string;
  name: string;
  password?: string;
};

const initialUsers: User[] = [
  { id: "ADM-001", name: "Vaibhav Rodge", email: "admin@bluestarhub.com", role: "Admin", status: "Active", password: "admin123" },
  { id: "SALES-001", name: "Priya Sharma", email: "priya.sharma@bluestar.com", role: "Sales", status: "Active", password: "salespassword" },
  { id: "TECH-007", name: "Raj Patel", email: "raj.patel@bluestar.com", role: "Supervisor", status: "Active", password: "techpassword" },
  { id: "TECH-004", name: "Prashant Jaiswar", email: "prashant.jaiswar@bluestar.com", role: "Technician", status: "Active", password: "techpassword4" },
  { id: "TECH-005", name: "Krishna Sharma", email: "krishna.sharma@bluestar.com", role: "Technician", status: "Active", password: "techpassword5" },
  { id: "CUST-101", name: "John Doe", email: "john.doe@example.com", role: "Customer", status: "Active", password: "customerpassword" },
  { id: "CUST-102", name: "Green Valley Apartments", email: "manager@gva.com", role: "Customer", status: "Inactive", password: "customerpassword2" },
];

const roleVariant: { [key in User["role"]]: "default" | "secondary" | "outline" | "destructive" } = {
  Admin: "default",
  Sales: "secondary",
  Technician: "outline",
  Customer: "outline",
  Supervisor: "destructive",
};

export default function UserManagementPage() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [activeTab, setActiveTab] = React.useState("All");
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = React.useState(false);

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

  const [isCredentialsDialogOpen, setIsCredentialsDialogOpen] = React.useState(false);
  const [generatedCredentials, setGeneratedCredentials] = React.useState<GeneratedCredentials | null>(null);


  const filteredUsers = React.useMemo(() => {
    if (activeTab === "All") {
      return users;
    }
    return users.filter((user) => user.role === activeTab);
  }, [users, activeTab]);

  const handleEditClick = (user: User) => {
    setSelectedUser({ ...user });
    setIsEditUserOpen(true);
  };
  
  const handleSaveChanges = () => {
    if (!selectedUser) return;
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setIsEditUserOpen(false);
    setSelectedUser(null);
    toast({
        title: "User Updated",
        description: `Details for ${selectedUser.name} have been updated.`,
    });
  }
  
  const handleDeleteUser = (userId: string) => {
     setUsers(users.filter(u => u.id !== userId));
     toast({
        variant: "destructive",
        title: "User Deleted",
        description: `The user account has been successfully deleted.`,
    });
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
    
    setGeneratedCredentials({
      name: customerName,
      username: newCustomer.email,
      password: generatedPassword,
    });
    setIsCredentialsDialogOpen(true);

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

    setGeneratedCredentials({
      name: newTechnician.name,
      username: newTechnician.email,
      password: generatedPassword,
    });
    setIsCredentialsDialogOpen(true);
    
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
    
    setGeneratedCredentials({
      name: newSales.name,
      username: newSales.email,
      password: generatedPassword,
    });
    setIsCredentialsDialogOpen(true);

    setIsRegisterSalesOpen(false);
    setNewSales({ name: "", email: "", phone: "" });
  }

  const handleCopyCredentials = () => {
    if (!generatedCredentials) return;
    const textToCopy = `Username: ${generatedCredentials.username}\nPassword: ${generatedCredentials.password}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        toast({ title: "Copied to Clipboard", description: "Credentials copied successfully." });
    }).catch(err => {
        toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy credentials." });
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View, manage, and register user accounts across the platform.
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Register New User
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setIsRegisterCustomerOpen(true)}>Register Customer</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsRegisterTechnicianOpen(true)}>Register Technician</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsRegisterSalesOpen(true)}>Register Sales User</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-auto sm:w-auto sm:inline-flex md:grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Admin">Admins</TabsTrigger>
              <TabsTrigger value="Sales">Sales</TabsTrigger>
              <TabsTrigger value="Technician">Technicians</TabsTrigger>
              <TabsTrigger value="Supervisor">Supervisors</TabsTrigger>
              <TabsTrigger value="Customer">Customers</TabsTrigger>
            </TabsList>
             <div className="mt-4">
                <UserTable users={filteredUsers} onEdit={handleEditClick} onDelete={handleDeleteUser} />
            </div>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Modify user details and roles below.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={selectedUser.name}
                  onChange={(e) =>
                    setSelectedUser(
                      (prev) => prev && { ...prev, name: e.target.value }
                    )
                  }
                />
              </div>
               <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                   onChange={(e) =>
                    setSelectedUser(
                      (prev) => prev && { ...prev, email: e.target.value }
                    )
                  }
                />
              </div>
               <div className="space-y-2">
                  <Label htmlFor="edit-password">Password</Label>
                  <Input
                      id="edit-password"
                      type="text"
                      value={selectedUser.password || ""}
                      placeholder="Enter new password"
                      onChange={(e) =>
                      setSelectedUser(
                          (prev) => prev && { ...prev, password: e.target.value }
                      )
                      }
                  />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="edit-role">Role</Label>
                       <Select value={selectedUser.role} onValueChange={(value: User["role"]) => setSelectedUser(prev => prev && {...prev, role: value})}>
                          <SelectTrigger id="edit-role">
                              <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Sales">Sales</SelectItem>
                              <SelectItem value="Technician">Technician</SelectItem>
                              <SelectItem value="Supervisor">Supervisor</SelectItem>
                              <SelectItem value="Customer">Customer</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                       <Select value={selectedUser.status} onValueChange={(value: User["status"]) => setSelectedUser(prev => prev && {...prev, status: value})}>
                          <SelectTrigger id="edit-status">
                              <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
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
      <Dialog open={isCredentialsDialogOpen} onOpenChange={setIsCredentialsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Credentials Generated</DialogTitle>
            <DialogDescription>
              The account for <span className="font-semibold">{generatedCredentials?.name}</span> has been created. Please share these credentials securely.
            </DialogDescription>
          </DialogHeader>
          {generatedCredentials && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="generated-username">Username / Email</Label>
                <Input id="generated-username" readOnly value={generatedCredentials.username} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="generated-password">Password</Label>
                <Input id="generated-password" readOnly value={generatedCredentials.password} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={handleCopyCredentials}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Credentials
            </Button>
            <Button onClick={() => setIsCredentialsDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function UserTable({ users, onEdit, onDelete }: { users: User[], onEdit: (user: User) => void, onDelete: (userId: string) => void }) {
  return (
    <ScrollArea className="w-full">
      <Table className="min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Password</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell className="hidden md:table-cell">{user.email}</TableCell>
              <TableCell className="hidden lg:table-cell">
                  <Badge variant="outline">{user.password}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={roleVariant[user.role]}>{user.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.status === "Active" ? "secondary" : "destructive"}>
                  {user.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(user)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(user.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}

    