
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Send, Eye, PlusCircle, Trash2, Download, Share2, FileText } from "lucide-react";
import type { Quotation, QuotationItem, Customer, Invoice, Complaint } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import type jsPDF from 'jspdf';
import type html2canvas from 'html2canvas';
import { initialQuotations } from "@/lib/data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const registeredCustomers: Customer[] = [
    { id: "CUST-001", name: "Green Valley Apartments", contactPerson: "Mr. Sharma", email: "manager@gva.com", phone: "555-0101", address: "456 Park Ave, Residence City" },
    { id: "CUST-002", name: "ABC Corporation", contactPerson: "Ms. Priya", email: "contact@abc.com", phone: "555-0102", address: "123 Business Rd, Corp Town" },
    { id: "CUST-003", name: "John Doe", email: "john.doe@example.com", phone: "555-0103", address: "789 Pine Ln, Sometown" },
];

const quotationStatusVariant: { [key in Quotation["status"]]: "default" | "secondary" | "outline" | "destructive" } = {
  Sent: "default",
  Approved: "secondary",
  Draft: "outline",
  Rejected: "destructive",
};

const units = ["nos", "meters", "pcs", "pack", "box"];

export default function QuotationsPage() {
  const { toast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [newQuote, setNewQuote] = useState<{
    customer: { name: string; email: string; address: string; phone: string; contactPerson?: string };
    items: (Omit<QuotationItem, 'price' | 'quantity'> & { price: number | ''; quantity: number | '' })[];
    laborCost: number;
    discount: number;
    poNumber: string;
  }>({
    customer: { name: "", email: "", address: "", phone: "" },
    items: [{ id: `item-${Date.now()}`, description: "", quantity: 1, unit: "nos", price: '', gstRate: 18 }],
    laborCost: 0,
    discount: 0,
    poNumber: "",
  });
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);
  const [copyType, setCopyType] = useState<'Original Copy' | "Customer's Copy">('Original Copy');
  const quoteRef = useRef<HTMLDivElement>(null);


 const subTotal = useMemo(() => {
    const itemsTotal = newQuote.items.reduce((sum, item) => sum + ((Number(item.quantity) || 0) * (Number(item.price) || 0)), 0);
    return itemsTotal + newQuote.laborCost;
  }, [newQuote.items, newQuote.laborCost]);

  const discountAmount = useMemo(() => {
    return subTotal * (newQuote.discount / 100);
  }, [subTotal, newQuote.discount]);

  const totalAfterDiscount = useMemo(() => {
    return subTotal - discountAmount;
  }, [subTotal, discountAmount]);

  const gstAmount = useMemo(() => {
    return newQuote.items.reduce((sum, item) => {
        const itemTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
        return sum + (itemTotal * (item.gstRate / 100));
    }, 0);
  }, [newQuote.items]);

  const totalAmount = useMemo(() => {
    return Math.round(totalAfterDiscount + gstAmount);
  }, [totalAfterDiscount, gstAmount]);


  const handleItemChange = (id: string, field: keyof Omit<QuotationItem, 'id'> | 'price' | 'quantity', value: string | number) => {
    setNewQuote(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const newItem = { ...item, [field]: value };
          if ((field === 'price' || field === 'quantity') && (value === '' || value === null)) {
            (newItem as any)[field] = '';
          } else if(field === 'price' || field === 'quantity' || field === 'gstRate') {
            (newItem as any)[field] = value;
          }
          return newItem;
        }
        return item;
      }),
    }));
  };

  const addItem = () => {
    setNewQuote(prev => ({
      ...prev,
      items: [...prev.items, { id: `item-${Date.now()}`, description: "", quantity: 1, unit: "nos", price: '', gstRate: 18 }],
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
        customer: { name: "", email: "", address: "", phone: "" },
        items: [{ id: `item-${Date.now()}`, description: "", quantity: 1, unit: "nos", price: '', gstRate: 18 }],
        laborCost: 0,
        discount: 0,
        poNumber: "",
      });
  }

  const handleCreateQuote = () => {
    const finalItems = newQuote.items.map(i => ({...i, price: Number(i.price) || 0, quantity: Number(i.quantity) || 0}));
    
    if (!newQuote.customer.name || finalItems.some(i => !i.description || i.price <= 0)) {
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
      items: finalItems,
      laborCost: newQuote.laborCost,
      discount: newQuote.discount,
      totalAmount,
      status: "Draft",
      date: new Date().toISOString().split('T')[0],
      poNumber: newQuote.poNumber,
    };
    setQuotations([newQuotationData, ...quotations]);
    resetForm();
    toast({
        title: "Quotation Created",
        description: `Draft for ${newQuotationData.customer.name} has been saved.`,
    });
  }

  const handleCustomerSelect = (customerId: string) => {
    const customer = registeredCustomers.find(c => c.id === customerId);
    if (customer) {
        setNewQuote(prev => ({
            ...prev,
            customer: {
                name: customer.name,
                email: customer.email,
                address: customer.address,
                phone: customer.phone,
                contactPerson: customer.contactPerson,
            }
        }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
  }
  
  const calculateQuoteTotals = (quote: Quotation) => {
    const itemsTotal = quote.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const subTotal = itemsTotal + quote.laborCost;
    const discountAmount = subTotal * (quote.discount / 100);
    const totalAfterDiscount = subTotal - discountAmount;
    const gstAmount = quote.items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.price;
        return sum + (itemTotal * (item.gstRate / 100));
    }, 0);
    const grandTotal = Math.round(totalAfterDiscount + gstAmount);
    return { itemsTotal, subTotal, discountAmount, gstAmount, grandTotal };
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

  const handleGenerateInvoice = (quote: Quotation) => {
    const newInvoice: Invoice = {
      invoiceId: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 100) + 16}`,
      customer: quote.customer,
      items: quote.items.map(i => ({...i, serialNumber: ''})),
      laborCost: quote.laborCost,
      discount: quote.discount,
      totalAmount: quote.totalAmount,
      status: "Pending",
      date: new Date().toISOString().split('T')[0],
      quoteId: quote.quoteId,
      poNumber: quote.poNumber,
      payments: [],
    };
    
    const existingInvoicesStr = localStorage.getItem('invoices');
    const existingInvoices: Invoice[] = existingInvoicesStr ? JSON.parse(existingInvoicesStr) : [];
    localStorage.setItem('invoices', JSON.stringify([newInvoice, ...existingInvoices]));

    toast({
        title: "Invoice Generated",
        description: `Invoice for quote ${quote.quoteId} has been created and can be viewed on the Invoices page.`,
    });
  }

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
                <Label>Select Registered Customer</Label>
                <Select onValueChange={handleCustomerSelect}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                        {registeredCustomers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
             <div className="space-y-2">
                <Label htmlFor="customer-name">Customer / Company Name</Label>
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
              <div className="space-y-2">
                <Label htmlFor="po-number">Purchase Order Number (Optional)</Label>
                <Input id="po-number" placeholder="e.g., PO-12345" value={newQuote.poNumber} onChange={(e) => setNewQuote(prev => ({...prev, poNumber: e.target.value}))}/>
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
                <div className="grid grid-cols-4 gap-4">
                   <div className="space-y-2">
                      <Label htmlFor={`item-qty-${index}`}>Quantity</Label>
                      <Input id={`item-qty-${index}`} type="number" placeholder="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`item-unit-${index}`}>Unit</Label>
                        <Select value={item.unit} onValueChange={(value) => handleItemChange(item.id, 'unit', value)}>
                            <SelectTrigger id={`item-unit-${index}`}>
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`item-price-${index}`}>Price (₹)</Label>
                      <Input id={`item-price-${index}`} type="number" placeholder="10000" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}/>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`item-gst-${index}`}>GST (%)</Label>
                      <Input id={`item-gst-${index}`} type="number" placeholder="18" value={item.gstRate} onChange={(e) => handleItemChange(item.id, 'gstRate', e.target.value)}/>
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
                    <Label>Grand Total</Label>
                    <Input readOnly value={formatCurrency(totalAmount)} className="font-semibold border-none p-0 h-auto text-lg"/>
                </div>
            </div>
           </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleCreateQuote}>
                <Send className="mr-2 h-4 w-4" />
                Create Quote
            </Button>
        </CardFooter>
      </Card>
      <div className="lg:col-span-3 flex flex-col gap-6">
        <Card>
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
                      <Badge variant={quotationStatusVariant[quote.status]}>
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                          {quote.status === "Approved" && (
                              <Button variant="outline" size="sm" onClick={() => handleGenerateInvoice(quote)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Generate Invoice
                              </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => setSelectedQuote(quote)}>
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                          </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={!!selectedQuote} onOpenChange={(isOpen) => !isOpen && setSelectedQuote(null)}>
        <DialogContent className="sm:max-w-4xl p-0" data-slot="header-plain">
            <div className="p-6">
                <DialogHeader>
                    <DialogTitle>Quotation Details</DialogTitle>
                    <DialogDescription>
                    A detailed view of quote <span className="font-semibold">{selectedQuote?.quoteId}</span> for {selectedQuote?.customer.name}.
                    </DialogDescription>
                </DialogHeader>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 pb-6 space-y-4">
                <div ref={quoteRef} className="bg-white text-black font-sans w-[210mm]">
                {selectedQuote && (() => {
                    const { itemsTotal, subTotal, discountAmount, gstAmount, grandTotal } = calculateQuoteTotals(selectedQuote);
                    const quoteDate = new Date(selectedQuote.date);
                    const dueDate = new Date(quoteDate);
                    dueDate.setDate(quoteDate.getDate() + 15);
                    const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

                    return (
                        <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', width: '100%', minHeight: '297mm', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
                             <header style={{paddingBottom: '20px', borderBottom: '2px solid #E2E8F0'}}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#2563EB' }}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                                            </svg>
                                            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Bluestar Electronics</h1>
                                        </div>
                                        <div style={{marginTop: '10px', fontSize: '12px', color: '#64748B'}}>
                                            <p><strong>Email:</strong> bluestar.elec@gmail.com</p>
                                            <p><strong>Contact:</strong> +91 9766661333</p>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#30475E' }}>QUOTATION</h2>
                                        <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{copyType}</p>
                                    </div>
                                </div>
                            </header>
                            
                            <div style={{ flexGrow: 1}}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingBottom: '20px' }}>
                                  <div>
                                      <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#30475E', marginBottom: '8px' }}>Billed To:</h2>
                                      <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>{selectedQuote.customer.name}</p>
                                      {selectedQuote.customer.contactPerson && <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>Attn: {selectedQuote.customer.contactPerson}</p>}
                                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{selectedQuote.customer.address}</p>
                                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}><strong>Email:</strong> {selectedQuote.customer.email}</p>
                                      {selectedQuote.customer.phone && <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}><strong>Contact:</strong> {selectedQuote.customer.phone}</p>}
                                  </div>
                                  <div style={{ width: '220px' }}>
                                      <div style={{ fontSize: '12px', textAlign: 'right' }}>
                                          <div style={{ marginBottom: '5px' }}><strong>Quote ID:</strong><span>{selectedQuote.quoteId}</span></div>
                                          <div style={{ marginBottom: '5px' }}><strong>Quote Date:</strong><span>{formatDate(quoteDate)}</span></div>
                                          <div style={{ marginBottom: '5px' }}><strong>Due Date:</strong><span>{formatDate(dueDate)}</span></div>
                                          {selectedQuote.poNumber && <div style={{ marginBottom: '5px' }}><strong>PO Number:</strong><span>{selectedQuote.poNumber}</span></div>}
                                      </div>
                                  </div>
                              </div>
                              
                              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '12px' }}>
                                  <thead>
                                      <tr style={{ backgroundColor: '#30475E', color: 'white' }}>
                                          <th style={{ padding: '10px', textAlign: 'left' }}>S.No.</th>
                                          <th style={{ padding: '10px', textAlign: 'left' }}>DESCRIPTION</th>
                                          <th style={{ padding: '10px', textAlign: 'right' }}>PRICE</th>
                                          <th style={{ padding: '10px', textAlign: 'right' }}>QTY</th>
                                          <th style={{ padding: '10px', textAlign: 'right' }}>GST</th>
                                          <th style={{ padding: '10px', textAlign: 'right' }}>TOTAL</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {selectedQuote.items.map((item, index) => (
                                          <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: index % 2 === 0 ? '#F8FAFC' : 'white' }}>
                                              <td style={{ padding: '10px' }}>{index + 1}</td>
                                              <td style={{ padding: '10px', maxWidth: '300px' }}>{item.description}</td>
                                              <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                                              <td style={{ padding: '10px', textAlign: 'right' }}>{item.quantity} {item.unit}</td>
                                               <td style={{ padding: '10px', textAlign: 'right' }}>{item.gstRate}%</td>
                                              <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.quantity * item.price)}</td>
                                          </tr>
                                      ))}
                                      {selectedQuote.laborCost > 0 && (
                                          <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: selectedQuote.items.length % 2 === 0 ? '#F8FAFC' : 'white' }}>
                                              <td colSpan={5} style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Labor Cost</td>
                                              <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(selectedQuote.laborCost)}</td>
                                          </tr>
                                      )}
                                  </tbody>
                              </table>

                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                  <div style={{ width: '250px', fontSize: '12px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}><span>Sub Total:</span><span>{formatCurrency(subTotal)}</span></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: 'green' }}><span>Discount ({selectedQuote.discount}%):</span><span>-{formatCurrency(discountAmount)}</span></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}><span>Total GST:</span><span>{formatCurrency(gstAmount)}</span></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: '5px', borderTop: '2px solid #30475E', fontWeight: 'bold', fontSize: '16px' }}><span>TOTAL:</span><span>{formatCurrency(grandTotal)}</span></div>
                                  </div>
                              </div>
                            </div>
                            
                            <footer style={{ marginTop: 'auto', paddingTop: '20px', fontSize: '12px', flexShrink: 0, borderTop: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Terms and Conditions:</h3>
                                        <p style={{ color: '#64748B', maxWidth: '300px', fontSize: '10px' }}>Payment is due within 15 days. All products are subject to standard warranty. Thank you for your business!</p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ borderTop: '1px solid #64748B', paddingTop: '5px', marginTop: '40px' }}>Authorized Signature</p>
                                        <p style={{ fontWeight: 'bold', marginTop: '5px' }}>Bluestar Electronics</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '10px', color: '#888' }}>
                                    <p>Thank you for your business!</p>
                                    <p style={{marginTop: '5px', fontWeight: 'bold'}}>Created on Bluestar Hub</p>
                                </div>
                           </footer>
                        </div>
                    );
                })()}
                </div>
                 <div className="p-4 border rounded-md">
                    <RadioGroup defaultValue="Original Copy" className="flex items-center gap-4" onValueChange={(value: 'Original Copy' | "Customer's Copy") => setCopyType(value)}>
                        <h4 className="text-sm font-medium">Select Copy Type:</h4>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Original Copy" id="q-original" />
                            <Label htmlFor="q-original">Original Copy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Customer's Copy" id="q-customer" />
                            <Label htmlFor="q-customer">Customer's Copy</Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
          <DialogFooter className="px-6 py-4 flex-row justify-between w-full border-t">
            <div className="flex gap-2">
                <Button variant="secondary" onClick={handleDownloadPdf}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
                 <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Send Quote
                </Button>
            </div>
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    