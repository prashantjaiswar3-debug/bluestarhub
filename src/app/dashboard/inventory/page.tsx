
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PlusCircle, ArrowUpDown, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { InventoryItem, InventoryCategory } from "@/lib/types";
import { initialInventory } from "@/lib/data";

const categoryVariant: { [key in InventoryCategory]: "default" | "secondary" | "outline" | "destructive" } = {
  Camera: "default",
  "DVR/NVR": "secondary",
  Cable: "outline",
  Accessory: "destructive",
};

const categories: InventoryCategory[] = ['Camera', 'DVR/NVR', 'Cable', 'Accessory'];

export default function InventoryPage() {
  const { toast } = useToast();
  const [inventory, setInventory] = React.useState<InventoryItem[]>(initialInventory);
  const [filteredInventory, setFilteredInventory] = React.useState<InventoryItem[]>(initialInventory);
  const [isAddItemOpen, setIsAddItemOpen] = React.useState(false);
  const [newItem, setNewItem] = React.useState<Omit<InventoryItem, 'id' | 'stock'> & { stock: string }>({ name: "", category: "Accessory", stock: "0", price: 0, supplier: "", partNumber: "" });
  const [sortConfig, setSortConfig] = React.useState<{ key: keyof InventoryItem; direction: 'ascending' | 'descending' } | null>(null);
  const [filter, setFilter] = React.useState<{term: string, category: string}>({term: "", category: "All"});


  React.useEffect(() => {
    let sortedItems = [...inventory];
    if (sortConfig !== null) {
        sortedItems.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
    }
    
    let filtered = sortedItems;
    if(filter.term) {
        filtered = filtered.filter(item => item.name.toLowerCase().includes(filter.term.toLowerCase()) || item.partNumber?.toLowerCase().includes(filter.term.toLowerCase()));
    }
    if(filter.category !== 'All') {
        filtered = filtered.filter(item => item.category === filter.category);
    }
    
    setFilteredInventory(filtered);
  }, [inventory, sortConfig, filter]);


  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || newItem.price <= 0) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill in all required fields to add a new item.",
        });
        return;
    }
    
    const newItemData: InventoryItem = {
        ...newItem,
        id: `ITEM-${Date.now()}`,
        stock: parseInt(newItem.stock, 10) || 0,
    };

    setInventory(prev => [newItemData, ...prev]);
    toast({
        title: "Item Added",
        description: `${newItemData.name} has been added to the inventory.`,
    });
    setIsAddItemOpen(false);
    setNewItem({ name: "", category: "Accessory", stock: "0", price: 0, supplier: "", partNumber: "" });
  };
  
  const requestSort = (key: keyof InventoryItem) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof InventoryItem) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    return sortConfig.direction === 'ascending' ? 
        <ArrowUpDown className="ml-2 h-4 w-4" /> : 
        <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Track, sort, and manage all your product stock.
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddItemOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Item
            </Button>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div className="relative w-full sm:max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Filter by name or part no..."
                        className="pl-10"
                        value={filter.term}
                        onChange={(e) => setFilter(f => ({...f, term: e.target.value}))}
                    />
                </div>
                <Select value={filter.category} onValueChange={(value) => setFilter(f => ({...f, category: value}))}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">All Categories</SelectItem>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('name')}>Name {getSortIndicator('name')}</TableHead>
                  <TableHead>Part No.</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => requestSort('category')}>Category {getSortIndicator('category')}</TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => requestSort('stock')}>Stock {getSortIndicator('stock')}</TableHead>
                  <TableHead className="cursor-pointer text-right" onClick={() => requestSort('price')}>Price {getSortIndicator('price')}</TableHead>
                  <TableHead>Supplier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.partNumber}</TableCell>
                    <TableCell>
                      <Badge variant={categoryVariant[item.category]}>{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.stock}</TableCell>
                    <TableCell className="text-right">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price)}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           </div>
        </CardContent>
      </Card>
      
      <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Inventory Item</DialogTitle>
            <DialogDescription>
              Enter the details for the new stock item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Hikvision 8MP Bullet Camera"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="item-part-number">Part Number</Label>
              <Input
                id="item-part-number"
                value={newItem.partNumber}
                onChange={(e) => setNewItem(prev => ({ ...prev, partNumber: e.target.value }))}
                placeholder="e.g., DS-2CE16U1T-ITPF"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="item-category">Category</Label>
                     <Select value={newItem.category} onValueChange={(value: InventoryCategory) => setNewItem(prev => ({...prev, category: value}))}>
                        <SelectTrigger id="item-category">
                            <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                             {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="item-stock">Initial Stock</Label>
                    <Input id="item-stock" type="number" value={newItem.stock} onChange={(e) => setNewItem(prev => ({...prev, stock: e.target.value}))}/>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="item-price">Price (per unit)</Label>
                    <Input id="item-price" type="number" value={newItem.price || ''} onChange={(e) => setNewItem(prev => ({...prev, price: parseFloat(e.target.value) || 0}))}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="item-supplier">Supplier</Label>
                    <Input id="item-supplier" value={newItem.supplier} onChange={(e) => setNewItem(prev => ({...prev, supplier: e.target.value}))} placeholder="e.g., SecureTech"/>
                </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddItem}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
