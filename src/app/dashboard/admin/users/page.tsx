
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

type User = {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Sales" | "Technician" | "Customer" | "Supervisor";
  status: "Active" | "Inactive";
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
  const [filteredUsers, setFilteredUsers] = React.useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [isEditUserOpen, setIsEditUserOpen] = React.useState(false);

  const handleFilter = (role: string) => {
    if (role === "All") {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter((user) => user.role === role));
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };
  
  const handleSaveChanges = () => {
    if (!selectedUser) return;
    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
    setFilteredUsers(prev => prev.map(u => u.id === selectedUser.id ? selectedUser : u));
    setIsEditUserOpen(false);
    setSelectedUser(null);
    toast({
        title: "User Updated",
        description: `Details for ${selectedUser.name} have been updated.`,
    });
  }
  
  const handleDeleteUser = (userId: string) => {
     setUsers(users.filter(u => u.id !== userId));
     setFilteredUsers(prev => prev.filter(u => u.id !== userId));
     toast({
        variant: "destructive",
        title: "User Deleted",
        description: `The user account has been successfully deleted.`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View, manage, and edit user accounts across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="All" onValueChange={handleFilter}>
            <TabsList className="grid w-full grid-cols-2 h-auto sm:w-auto sm:inline-flex md:grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="All">All</TabsTrigger>
              <TabsTrigger value="Admin">Admins</TabsTrigger>
              <TabsTrigger value="Sales">Sales</TabsTrigger>
              <TabsTrigger value="Technician">Technicians</TabsTrigger>
              <TabsTrigger value="Supervisor">Supervisors</TabsTrigger>
              <TabsTrigger value="Customer">Customers</TabsTrigger>
            </TabsList>
            <TabsContent value="All">
              <UserTable users={filteredUsers} onEdit={handleEditClick} onDelete={handleDeleteUser} />
            </TabsContent>
            <TabsContent value="Admin">
              <UserTable users={filteredUsers} onEdit={handleEditClick} onDelete={handleDeleteUser} />
            </TabsContent>
            <TabsContent value="Sales">
              <UserTable users={filteredUsers} onEdit={handleEditClick} onDelete={handleDeleteUser} />
            </TabsContent>
            <TabsContent value="Technician">
              <UserTable users={filteredUsers} onEdit={handleEditClick} onDelete={handleDeleteUser} />
            </TabsContent>
            <TabsContent value="Supervisor">
              <UserTable users={filteredUsers} onEdit={handleEditClick} onDelete={handleDeleteUser} />
            </TabsContent>
            <TabsContent value="Customer">
              <UserTable users={filteredUsers} onEdit={handleEditClick} onDelete={handleDeleteUser} />
            </TabsContent>
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
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={selectedUser?.name || ""}
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
                value={selectedUser?.email || ""}
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
                    value={selectedUser?.password || ""}
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
                     <Select value={selectedUser?.role} onValueChange={(value: User["role"]) => setSelectedUser(prev => prev && {...prev, role: value})}>
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
                     <Select value={selectedUser?.status} onValueChange={(value: User["status"]) => setSelectedUser(prev => prev && {...prev, status: value})}>
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
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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

    
