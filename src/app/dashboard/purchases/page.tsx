
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
  CardFooter,
} from "@/components/ui/card";
import { PlusCircle, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PurchaseOrder, InventoryItem, PurchaseOrderItem } from "@/lib/types";
import { initialPurchaseOrders, initialInventory } from "@/lib/data";

const statusVariant: { [key in PurchaseOrder['status']]: "default" | "secondary" | "destructive" } = {
  Pending: "default",
  Completed: "secondary",
  Cancelled: "destructive",
};

export default function PurchasesPage() {
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = React.useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [isCreatePoOpen, setIsCreatePoOpen] = React.useState(false);
  const [newPo, setNewPo] = React.useState<{ supplier: string; items: (Omit<PurchaseOrderItem, 'price'> & { price: string })[] }>({ supplier: "", items: [] });

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

  const suppliers = React.useMemo(() => [...new Set(initialInventory.map(i => i.supplier).filter(Boolean))], []);

  const handleCreatePO = () => {
      const poItems = newPo.items.map(item => ({...item, price: parseFloat(item.price) || 0})).filter(item => item.quantity > 0 && item.price > 0);

      if(!newPo.supplier || poItems.length === 0) {
          toast({ variant: "destructive", title: "Missing Information", description: "Please select a supplier and add at least one valid item." });
          return;
      }
      
      const total = poItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      
      const poData: PurchaseOrder = {
          poId: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 100) + 3}`,
          supplier: newPo.supplier,
          items: poItems,
          total,
          status: 'Pending',
          date: new Date().toISOString(),
      };

      setPurchaseOrders(prev => [poData, ...prev]);
      toast({ title: "Purchase Order Created", description: `PO for ${poData.supplier} has been created.` });
      setIsCreatePoOpen(false);
      setNewPo({ supplier: "", items: [] });
  };
  
  const handleSupplierSelect = (supplierName: string) => {
      const supplierItems = initialInventory
        .filter(item => item.supplier === supplierName)
        .map(item => ({ itemId: item.id, name: item.name, quantity: 0, price: item.price.toString() }));
      setNewPo({ supplier: supplierName, items: supplierItems });
  }

  const handleItemChange = (itemId: string, field: 'quantity' | 'price', value: string) => {
      setNewPo(prev => ({
          ...prev,
          items: prev.items.map(item => item.itemId === itemId ? { ...item, [field]: value } : item)
      }));
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                Create and manage purchase orders for your suppliers.
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreatePoOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New PO
            </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO ID</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => (
                  <TableRow key={po.poId}>
                    <TableCell className="font-medium">{po.poId}</TableCell>
                    <TableCell>{po.supplier}</TableCell>
                    <TableCell>{formatDate(po.date)}</TableCell>
                    <TableCell><Badge variant={statusVariant[po.status]}>{po.status}</Badge></TableCell>
                    <TableCell className="text-right">{formatCurrency(po.total)}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           </div>
        </CardContent>
      </Card>
      
      <Dialog open={isCreatePoOpen} onOpenChange={setIsCreatePoOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Select a supplier to populate items, then specify quantities and prices.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
              <Label htmlFor="po-supplier">Supplier</Label>
               <Select onValueChange={handleSupplierSelect}>
                  <SelectTrigger id="po-supplier">
                      <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                      {suppliers.map((s, i) => <SelectItem key={`${s}-${i}`} value={s!}>{s}</SelectItem>)}
                  </SelectContent>
              </Select>
            </div>
            {newPo.supplier && (
                <Card>
                    <CardContent className="p-4 max-h-[40vh] overflow-y-auto">
                        <div className="space-y-4">
                           <div className="grid grid-cols-[1fr_80px_100px] gap-4 items-center font-medium text-sm text-muted-foreground">
                                <span>Item Name</span>
                                <span className="text-right">Quantity</span>
                                <span className="text-right">Price</span>
                            </div>
                            {newPo.items.map(item => (
                                <div key={item.itemId} className="grid grid-cols-[1fr_80px_100px] gap-4 items-center">
                                    <Label htmlFor={`item-qty-${item.itemId}`} className="font-normal truncate">{item.name}</Label>
                                    <Input 
                                        id={`item-qty-${item.itemId}`}
                                        type="number"
                                        className="text-right"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(item.itemId, 'quantity', e.target.value)}
                                        placeholder="0"
                                    />
                                    <Input
                                        id={`item-price-${item.itemId}`}
                                        type="text"
                                        className="text-right"
                                        value={item.price}
                                        onChange={(e) => handleItemChange(item.itemId, 'price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreatePO}>Create PO</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
