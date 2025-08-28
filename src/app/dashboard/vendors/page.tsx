
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Vendor } from "@/lib/types";
import { initialVendors } from "@/lib/vendordata";
import { ScrollArea } from "@/components/ui/scroll-area";

const categories: Vendor['category'][] = ['CCTV Supplier', 'Cable Provider', 'IT Hardware', 'General Supplier', 'Other'];

export default function VendorManagementPage() {
  const { toast } = useToast();
  const [vendors, setVendors] = React.useState<Vendor[]>(initialVendors);
  const [filteredVendors, setFilteredVendors] = React.useState<Vendor[]>(initialVendors);
  const [isVendorDialogOpen, setIsVendorDialogOpen] = React.useState(false);
  const [editingVendor, setEditingVendor] = React.useState<Vendor | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    setFilteredVendors(
      vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, vendors]);

  const openDialogForNew = () => {
    setEditingVendor(null);
    setIsVendorDialogOpen(true);
  };

  const openDialogForEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setIsVendorDialogOpen(true);
  };
  
  const handleDeleteVendor = (vendorId: string) => {
     setVendors(vendors.filter(v => v.id !== vendorId));
     toast({
        variant: "destructive",
        title: "Vendor Deleted",
        description: `The vendor has been successfully deleted.`,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Vendor Management</CardTitle>
            <CardDescription>
              Manage your suppliers and vendors in one place.
            </CardDescription>
          </div>
          <Button onClick={openDialogForNew} className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Vendor
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="w-full">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell className="hidden sm:table-cell">{vendor.contactPerson}</TableCell>
                    <TableCell className="hidden md:table-cell">{vendor.email}</TableCell>
                    <TableCell><Badge variant="secondary">{vendor.category}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={vendor.status === "Active" ? "secondary" : "destructive"}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDialogForEdit(vendor)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteVendor(vendor.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      <VendorDialog
        isOpen={isVendorDialogOpen}
        setIsOpen={setIsVendorDialogOpen}
        vendor={editingVendor}
        setVendors={setVendors}
      />
    </div>
  );
}

function VendorDialog({ isOpen, setIsOpen, vendor, setVendors }: { isOpen: boolean, setIsOpen: (open: boolean) => void, vendor: Vendor | null, setVendors: React.Dispatch<React.SetStateAction<Vendor[]>> }) {
    const { toast } = useToast();
    const [formData, setFormData] = React.useState<Omit<Vendor, 'id'>>({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        category: 'General Supplier',
        status: 'Active'
    });

    React.useEffect(() => {
        if (vendor) {
            setFormData(vendor);
        } else {
            setFormData({
                name: '',
                contactPerson: '',
                email: '',
                phone: '',
                address: '',
                category: 'General Supplier',
                status: 'Active'
            });
        }
    }, [vendor, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (field: 'category' | 'status', value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    }

    const handleSubmit = () => {
        if (!formData.name || !formData.contactPerson || !formData.email || !formData.phone) {
             toast({ variant: "destructive", title: "Missing Fields", description: "Please fill out all required fields." });
             return;
        }

        if (vendor) {
            // Update existing vendor
            setVendors(prev => prev.map(v => v.id === vendor.id ? { ...vendor, ...formData } : v));
            toast({ title: "Vendor Updated", description: "The vendor's details have been updated." });
        } else {
            // Add new vendor
            const newVendor: Vendor = { id: `VEND-${Date.now()}`, ...formData };
            setVendors(prev => [newVendor, ...prev]);
            toast({ title: "Vendor Added", description: `${newVendor.name} has been added.` });
        }
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
                    <DialogDescription>
                        {vendor ? 'Update the details for this vendor.' : 'Enter the details for the new vendor.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Vendor Name</Label>
                        <Input id="name" value={formData.name} onChange={handleChange} placeholder="e.g., SecureTech Distributors" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input id="contactPerson" value={formData.contactPerson} onChange={handleChange} placeholder="e.g., Mr. Anil Sharma" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="e.g., contact@securetech.com" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} placeholder="e.g., 9876543210" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" value={formData.address} onChange={handleChange} placeholder="e.g., 123 Commerce House, Mumbai" />
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select value={formData.category} onValueChange={(value: Vendor['category']) => handleSelectChange('category', value)}>
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="status">Status</Label>
                             <Select value={formData.status} onValueChange={(value: Vendor['status']) => handleSelectChange('status', value)}>
                                <SelectTrigger id="status">
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
                    <Button onClick={handleSubmit}>Save Vendor</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    