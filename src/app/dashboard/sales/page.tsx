
"use client";

import { useState, useMemo, useRef } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send, Eye, PlusCircle, Trash2, Gem, Download } from "lucide-react";
import type { Quotation, QuotationItem } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import type jsPDF from 'jspdf';
import type html2canvas from 'html2canvas';


const initialQuotations: Quotation[] = [
  {
    quoteId: "QT-2023-051",
    customer: { name: "ABC Corporation", email: "contact@abc.com", address: "123 Business Rd, Corp Town" },
    items: [{ id: "item-1", description: "4x Hikvision 5MP Dome Cameras", quantity: 1, price: 18000 }],
    laborCost: 5000,
    discount: 10,
    gst: 18,
    totalAmount: 24780,
    status: "Sent",
    date: "2023-10-25"
  },
  {
    quoteId: "QT-2023-050",
    customer: { name: "Green Valley Apartments", email: "manager@gva.com", address: "456 Park Ave, Residence City" },
    items: [{ id: "item-1", description: "16-Channel NVR System", quantity: 1, price: 80000 }, { id: "item-2", description: "12x Bullet Cameras", quantity: 1, price: 40000 }],
    laborCost: 20000,
    discount: 5,
    gst: 18,
    totalAmount: 157528,
    status: "Approved",
    date: "2023-10-22"
  },
];


const statusVariant: { [key in Quotation["status"]]: "default" | "secondary" | "outline" | "destructive" } = {
  Sent: "default",
  Approved: "secondary",
  Draft: "outline",
  Rejected: "destructive",
};

export default function SalesDashboard() {
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [newQuote, setNewQuote] = useState({
    customer: { name: "", email: "", address: "" },
    items: [{ id: `item-${Date.now()}`, description: "", quantity: 1, price: 0 }],
    laborCost: 0,
    discount: 0,
    gst: 18,
  });
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const quoteRef = useRef<HTMLDivElement>(null);


  const subTotal = useMemo(() => {
    const itemsTotal = newQuote.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return itemsTotal + newQuote.laborCost;
  }, [newQuote.items, newQuote.laborCost]);

  const discountAmount = useMemo(() => {
    return subTotal * (newQuote.discount / 100);
  }, [subTotal, newQuote.discount]);

  const totalAfterDiscount = useMemo(() => {
    return subTotal - discountAmount;
  }, [subTotal, discountAmount]);

  const gstAmount = useMemo(() => {
    return totalAfterDiscount * (newQuote.gst / 100);
  }, [totalAfterDiscount, newQuote.gst]);

  const totalAmount = useMemo(() => {
    return Math.round(totalAfterDiscount + gstAmount);
  }, [totalAfterDiscount, gstAmount]);


  const handleItemChange = (id: string, field: keyof Omit<QuotationItem, 'id'>, value: string | number) => {
    setNewQuote(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setNewQuote(prev => ({
      ...prev,
      items: [...prev.items, { id: `item-${Date.now()}`, description: "", quantity: 1, price: 0 }],
    }));
  };

  const removeItem = (id: string) => {
    setNewQuote(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };
  
  const resetForm = () => {
      setNewQuote({
        customer: { name: "", email: "", address: "" },
        items: [{ id: `item-${Date.now()}`, description: "", quantity: 1, price: 0 }],
        laborCost: 0,
        discount: 0,
        gst: 18,
      });
  }

  const handleCreateQuote = () => {
    if (!newQuote.customer.name || newQuote.items.some(i => !i.description || i.price <= 0)) {
        toast({
            variant: "destructive",
            title: "Incomplete Information",
            description: "Please fill in customer name and at least one valid item.",
        });
        return;
    }
    const newQuotationData: Quotation = {
      quoteId: `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 100) + 52}`,
      customer: newQuote.customer,
      items: newQuote.items,
      laborCost: newQuote.laborCost,
      discount: newQuote.discount,
      gst: newQuote.gst,
      totalAmount,
      status: "Draft",
      date: new Date().toISOString().split('T')[0],
    };
    setQuotations([newQuotationData, ...quotations]);
    resetForm();
    toast({
        title: "Quotation Created",
        description: `Draft for ${newQuotationData.customer.name} has been saved.`,
    });
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
  }

  const calculateQuoteTotals = (quote: Quotation) => {
    const subTotal = quote.items.reduce((sum, item) => sum + item.quantity * item.price, 0) + quote.laborCost;
    const discountAmount = subTotal * (quote.discount / 100);
    const totalAfterDiscount = subTotal - discountAmount;
    const gstAmount = totalAfterDiscount * (quote.gst / 100);
    const grandTotal = Math.round(totalAfterDiscount + gstAmount);
    return { subTotal, discountAmount, gstAmount, grandTotal };
  }

  const handleDownloadPdf = async () => {
    const quoteContent = quoteRef.current;
    if (quoteContent) {
        try {
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
              import('jspdf'),
              import('html2canvas'),
            ]);
            const canvas = await html2canvas(quoteContent, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`quotation-${selectedQuote?.quoteId}.pdf`);
            toast({
                title: "Download Started",
                description: `Your quotation ${selectedQuote?.quoteId} is downloading.`,
            });
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({
                variant: "destructive",
                title: "Download Failed",
                description: "There was an error generating the PDF.",
            });
        }
    }
  };


  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2 self-start">
        <CardHeader>
          <CardTitle>Create Quotation</CardTitle>
          <CardDescription>Fill in the details to generate a new quote.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="space-y-4 rounded-md border p-4">
             <h4 className="text-sm font-medium">Customer Details</h4>
             <div className="space-y-2">
                <Label htmlFor="customer-name">Full Name</Label>
                <Input id="customer-name" placeholder="e.g., ABC Corporation" value={newQuote.customer.name} onChange={(e) => setNewQuote(prev => ({...prev, customer: {...prev.customer, name: e.target.value}}))}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input id="customer-email" placeholder="e.g., contact@abccorp.com" value={newQuote.customer.email} onChange={(e) => setNewQuote(prev => ({...prev, customer: {...prev.customer, email: e.target.value}}))}/>
              </div>
               <div className="space-y-2">
                <Label htmlFor="customer-address">Address</Label>
                <Textarea id="customer-address" placeholder="e.g., 123 Business Road, Mumbai" value={newQuote.customer.address} onChange={(e) => setNewQuote(prev => ({...prev, customer: {...prev.customer, address: e.target.value}}))} />
              </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Services / Parts</h4>
            {newQuote.items.map((item, index) => (
              <div key={item.id} className="grid gap-2 rounded-md border p-3 relative">
                 {newQuote.items.length > 1 && (
                     <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeItem(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive"/>
                     </Button>
                 )}
                <div className="space-y-2">
                  <Label htmlFor={`item-desc-${index}`}>Description</Label>
                  <Textarea id={`item-desc-${index}`} placeholder="e.g., 4x Dome Cameras, 1x 8-Channel DVR..." value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <Label htmlFor={`item-qty-${index}`}>Quantity</Label>
                      <Input id={`item-qty-${index}`} type="number" placeholder="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value, 10) || 1)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`item-price-${index}`}>Price (₹)</Label>
                      <Input id={`item-price-${index}`} type="number" placeholder="10000" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}/>
                    </div>
                </div>
              </div>
            ))}
             <Button variant="outline" onClick={addItem}>
                <PlusCircle className="mr-2 h-4 w-4"/>
                Add Item
            </Button>
          </div>
          
          <div className="space-y-4 rounded-md border p-4">
            <h4 className="text-sm font-medium">Costs & Total</h4>
             <div className="space-y-2">
                <Label htmlFor="labor-cost">Labor Cost (₹)</Label>
                <Input id="labor-cost" type="number" placeholder="5000" value={newQuote.laborCost} onChange={(e) => setNewQuote(prev => ({...prev, laborCost: parseFloat(e.target.value) || 0}))}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input id="discount" type="number" placeholder="10" value={newQuote.discount} onChange={(e) => setNewQuote(prev => ({...prev, discount: parseFloat(e.target.value) || 0}))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gst">GST (%)</Label>
                    <Input id="gst" type="number" placeholder="18" value={newQuote.gst} onChange={(e) => setNewQuote(prev => ({...prev, gst: parseFloat(e.target.value) || 0}))}/>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Grand Total</Label>
                <Input readOnly value={formatCurrency(totalAmount)} className="font-semibold border-none p-0 h-auto text-lg"/>
            </div>
           </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleCreateQuote} variant="secondary">
                <Send className="mr-2 h-4 w-4" />
                Create Quote
            </Button>
        </CardFooter>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Quotations</CardTitle>
          <CardDescription>Track the status of recently sent quotes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quote ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.map((quote) => (
                <TableRow key={quote.quoteId}>
                  <TableCell className="font-medium">{quote.quoteId}</TableCell>
                  <TableCell>{quote.customer.name}</TableCell>
                  <TableCell>{formatCurrency(quote.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[quote.status]}>
                      {quote.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedQuote(quote)}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedQuote} onOpenChange={(isOpen) => !isOpen && setSelectedQuote(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="bg-accent p-4 rounded-t-lg">
            <DialogTitle className="text-accent-foreground">Quotation Details</DialogTitle>
            <DialogDescription className="text-accent-foreground/80">
              A detailed view of quote <span className="font-semibold">{selectedQuote?.quoteId}</span> for {selectedQuote?.customer.name}.
            </DialogDescription>
          </DialogHeader>
           <div ref={quoteRef}>
              {selectedQuote && (() => {
                const { subTotal, discountAmount, gstAmount, grandTotal } = calculateQuoteTotals(selectedQuote);
                return (
                  <div className="grid gap-4 py-4 px-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold">Billed To:</h4>
                            <p>{selectedQuote.customer.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedQuote.customer.email}</p>
                            <p className="text-sm text-muted-foreground">{selectedQuote.customer.address}</p>
                        </div>
                         <div className="text-right">
                            <h4 className="font-semibold">Quote ID: {selectedQuote.quoteId}</h4>
                            <p className="text-sm text-muted-foreground">Date: {new Date(selectedQuote.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                         </div>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead className="text-center">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {selectedQuote.items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(item.quantity * item.price)}</TableCell>
                                </TableRow>
                            ))}
                             <TableRow>
                                <TableCell colSpan={3} className="text-right font-medium">Labor Cost</TableCell>
                                <TableCell className="text-right">{formatCurrency(selectedQuote.laborCost)}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                                <TableCell className="text-right">{formatCurrency(subTotal)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell colSpan={3} className="text-right font-medium">Discount ({selectedQuote.discount}%)</TableCell>
                                <TableCell className="text-right text-destructive">-{formatCurrency(discountAmount)}</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell colSpan={3} className="text-right font-medium">GST ({selectedQuote.gst}%)</TableCell>
                                <TableCell className="text-right">{formatCurrency(gstAmount)}</TableCell>
                            </TableRow>
                             <TableRow className="font-bold text-lg bg-muted/50">
                                <TableCell colSpan={3} className="text-right">Grand Total (Rounded)</TableCell>
                                <TableCell className="text-right">{formatCurrency(grandTotal)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Gem className="h-3 w-3" />
                        <span>Created on Bluestar Hub</span>
                    </div>
                  </div>
                )
              })()}
          </div>
          <DialogFooter className="px-6 pb-4 flex justify-between w-full">
            <Button variant="secondary" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
            </Button>
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    