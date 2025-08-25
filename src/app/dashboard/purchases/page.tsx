
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { PlusCircle, Trash2, Eye, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PurchaseOrder, InventoryItem, PurchaseOrderItem } from "@/lib/types";
import { initialPurchaseOrders, initialInventory } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [selectedPo, setSelectedPo] = React.useState<PurchaseOrder | null>(null);
  const [poToCancel, setPoToCancel] = React.useState<PurchaseOrder | null>(null);

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

  const handleMarkAsCompleted = (poId: string) => {
      setPurchaseOrders(prev => prev.map(po => po.poId === poId ? { ...po, status: 'Completed', receivedDate: new Date().toISOString() } : po));
      setSelectedPo(prev => prev && prev.poId === poId ? { ...prev, status: 'Completed', receivedDate: new Date().toISOString() } : prev);
      toast({ title: "Order Completed", description: `Purchase order ${poId} has been marked as completed.` });
  }
  
  const handleConfirmCancel = () => {
    if (!poToCancel) return;
    setPurchaseOrders(prev => prev.map(po => po.poId === poToCancel.poId ? { ...po, status: 'Cancelled' } : po));
    toast({ variant: "destructive", title: "Order Cancelled", description: `Purchase order ${poToCancel.poId} has been cancelled.` });
    setPoToCancel(null);
    setSelectedPo(null);
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
          <ScrollArea className="w-full whitespace-nowrap">
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
                       <Button variant="ghost" size="icon" onClick={() => setSelectedPo(po)}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
           </ScrollArea>
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
                    <CardHeader>
                        <CardTitle className="text-base">Items from {newPo.supplier}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                        <ScrollArea className="h-full max-h-[40vh] pr-4">
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
                        </ScrollArea>
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

      <Dialog open={!!selectedPo} onOpenChange={(isOpen) => !isOpen && setSelectedPo(null)}>
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>Purchase Order: {selectedPo?.poId}</DialogTitle>
                <DialogDescription>
                   For supplier <span className="font-semibold">{selectedPo?.supplier}</span>, dated {selectedPo && formatDate(selectedPo.date)}.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Card>
                    <CardContent className="p-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedPo?.items.map(item => (
                                    <TableRow key={item.itemId}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex justify-end bg-muted/50 p-4">
                        <div className="text-right">
                           <p className="text-muted-foreground">Grand Total</p>
                           <p className="text-xl font-bold">{formatCurrency(selectedPo?.total || 0)}</p>
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <DialogFooter className="justify-between">
                <div>
                   {selectedPo?.status === 'Pending' && (
                       <Button variant="destructive" onClick={() => { setPoToCancel(selectedPo); }}>
                           <Trash2 className="mr-2 h-4 w-4" />
                           Cancel Order
                       </Button>
                   )}
                </div>
                <div className="flex gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">Close</Button>
                    </DialogClose>
                    {selectedPo?.status === 'Pending' && (
                        <Button onClick={() => handleMarkAsCompleted(selectedPo.poId)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Completed
                        </Button>
                    )}
                </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!poToCancel} onOpenChange={() => setPoToCancel(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This will cancel the purchase order <span className="font-semibold">{poToCancel?.poId}</span>. This action cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmCancel} className="bg-destructive hover:bg-destructive/90">
                    Confirm Cancellation
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

