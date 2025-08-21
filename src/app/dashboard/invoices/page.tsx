
"use client";

import { useState, useMemo, useRef, useEffect } from "react";
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
import { Send, Eye, PlusCircle, Trash2, Download, Share2, CreditCard, Wand2 } from "lucide-react";
import type { Invoice, Quotation, QuotationItem, Customer } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import type jsPDF from 'jspdf';
import type html2canvas from 'html2canvas';
import { initialQuotations } from "@/lib/data";
import { compareInvoiceAndQuote } from "@/ai/flows/compare-invoice-quote-flow";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const registeredCustomers: Customer[] = [
    { id: "CUST-001", name: "Green Valley Apartments", email: "manager@gva.com", phone: "555-0101", address: "456 Park Ave, Residence City" },
    { id: "CUST-002", name: "ABC Corporation", email: "contact@abc.com", phone: "555-0102", address: "123 Business Rd, Corp Town" },
    { id: "CUST-003", name: "John Doe", email: "john.doe@example.com", phone: "555-0103", address: "789 Pine Ln, Sometown" },
];

const initialInvoices: Invoice[] = [
    {
        invoiceId: "INV-2023-0012",
        customer: { name: "Green Valley Apartments", email: "manager@gva.com", address: "456 Park Ave, Residence City" },
        items: [{ id: "item-1", description: "16-Channel NVR System", quantity: 1, price: 80000 }, { id: "item-2", description: "12x Bullet Cameras", quantity: 1, price: 40000 }],
        laborCost: 20000,
        discount: 5,
        gst: 18,
        totalAmount: 157528,
        status: "Paid",
        date: "2023-10-22",
        quoteId: "QT-2023-050",
    },
    {
        invoiceId: "INV-2023-0015",
        customer: { name: "ABC Corporation", email: "contact@abc.com", address: "123 Business Rd, Corp Town" },
        items: [{ id: "item-1", description: "4x Hikvision 5MP Dome Cameras", quantity: 1, price: 18000 }],
        laborCost: 5000,
        discount: 10,
        gst: 18,
        totalAmount: 24780,
        status: "Pending",
        date: "2023-10-25",
        quoteId: "QT-2023-051"
    },
];

const statusVariant: { [key in Invoice["status"]]: "secondary" | "default" | "destructive" } = {
  Paid: "secondary",
  Pending: "default",
  Overdue: "destructive",
};

export default function InvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [newInvoice, setNewInvoice] = useState({
    customer: { name: "", email: "", address: "" },
    items: [{ id: `item-${Date.now()}`, description: "", quantity: 1, price: 0 }],
    laborCost: 0,
    discount: 0,
    gst: 18,
    quoteId: "",
    poNumber: "",
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [comparisonResult, setComparisonResult] = useState<string>("");
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedInvoicesStr = localStorage.getItem('invoices');
    if (storedInvoicesStr) {
        const storedInvoices: Invoice[] = JSON.parse(storedInvoicesStr);
        setInvoices(prevInvoices => {
            const allInvoices = [...storedInvoices, ...prevInvoices];
            const uniqueInvoices = allInvoices.filter(
                (invoice, index, self) => index === self.findIndex(t => t.invoiceId === invoice.invoiceId)
            );
            return uniqueInvoices;
        });
    }
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedInvoice(null);
      setComparisonResult("");
      setIsComparing(false);
    }
  }


  const subTotal = useMemo(() => {
    const itemsTotal = newInvoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    return itemsTotal + newInvoice.laborCost;
  }, [newInvoice.items, newInvoice.laborCost]);

  const discountAmount = useMemo(() => {
    return subTotal * (newInvoice.discount / 100);
  }, [subTotal, newInvoice.discount]);

  const totalAfterDiscount = useMemo(() => {
    return subTotal - discountAmount;
  }, [subTotal, discountAmount]);

  const gstAmount = useMemo(() => {
    return totalAfterDiscount * (newInvoice.gst / 100);
  }, [totalAfterDiscount, newInvoice.gst]);

  const totalAmount = useMemo(() => {
    return Math.round(totalAfterDiscount + gstAmount);
  }, [totalAfterDiscount, gstAmount]);


  const handleItemChange = (id: string, field: keyof Omit<QuotationItem, 'id'>, value: string | number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, [field]: typeof value === 'string' && field !== 'description' ? parseFloat(value) || 0 : value } : item
      ),
    }));
  };

  const addItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: `item-${Date.now()}`, description: "", quantity: 1, price: 0 }],
    }));
  };

  const removeItem = (id: string) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id),
    }));
  };
  
  const resetForm = () => {
      setNewInvoice({
        customer: { name: "", email: "", address: "" },
        items: [{ id: `item-${Date.now()}`, description: "", quantity: 1, price: 0 }],
        laborCost: 0,
        discount: 0,
        gst: 18,
        quoteId: "",
        poNumber: "",
      });
  }

  const handleCreateInvoice = () => {
    if (!newInvoice.customer.name || newInvoice.items.some(i => !i.description || i.price <= 0)) {
        toast({
            variant: "destructive",
            title: "Incomplete Information",
            description: "Please fill in customer name and at least one valid item.",
        });
        return;
    }
    const newInvoiceData: Invoice = {
      invoiceId: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 100) + 16}`,
      customer: newInvoice.customer,
      items: newInvoice.items,
      laborCost: newInvoice.laborCost,
      discount: newInvoice.discount,
      gst: newInvoice.gst,
      totalAmount,
      status: "Pending",
      date: new Date().toISOString().split('T')[0],
      quoteId: newInvoice.quoteId,
      poNumber: newInvoice.poNumber,
    };
    
    const updatedInvoices = [newInvoiceData, ...invoices];
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));

    resetForm();
    toast({
        title: "Invoice Created",
        description: `Invoice for ${newInvoiceData.customer.name} has been created.`,
    });
  }
  
    const handleCustomerSelect = (customerId: string) => {
        const customer = registeredCustomers.find(c => c.id === customerId);
        if (customer) {
            setNewInvoice(prev => ({
                ...prev,
                customer: {
                    name: customer.name,
                    email: customer.email,
                    address: customer.address
                }
            }));
        }
    };
    
    const handleQuotationSelect = (quotationId: string) => {
        const quote = initialQuotations.find(q => q.quoteId === quotationId);
        if (quote) {
            setNewInvoice({
                customer: quote.customer,
                items: quote.items,
                laborCost: quote.laborCost,
                discount: quote.discount,
                gst: quote.gst,
                quoteId: quote.quoteId,
                poNumber: quote.poNumber || "",
            });
        }
    };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
  }

  const calculateInvoiceTotals = (invoice: Invoice) => {
    const itemsTotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const subTotal = itemsTotal + invoice.laborCost;
    const discountAmount = subTotal * (invoice.discount / 100);
    const totalAfterDiscount = subTotal - discountAmount;
    const gstAmount = totalAfterDiscount * (invoice.gst / 100);
    const grandTotal = Math.round(totalAfterDiscount + gstAmount);
    return { itemsTotal, subTotal, discountAmount, gstAmount, grandTotal };
  }

  const handleDownloadPdf = async () => {
    const invoiceContent = invoiceRef.current;
    if (invoiceContent) {
        try {
            const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
              import('jspdf'),
              import('html2canvas'),
            ]);
            const canvas = await html2canvas(invoiceContent, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-${selectedInvoice?.invoiceId}.pdf`);
            toast({
                title: "Download Started",
                description: `Your invoice ${selectedInvoice?.invoiceId} is downloading.`,
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

  const handleCompare = async () => {
    if (!selectedInvoice || !selectedInvoice.quoteId) return;

    const quote = initialQuotations.find(q => q.quoteId === selectedInvoice.quoteId);
    if (!quote) {
        toast({
            variant: "destructive",
            title: "Quotation not found",
            description: `Could not find original quotation ${selectedInvoice.quoteId}.`
        });
        return;
    }

    setIsComparing(true);
    setComparisonResult("");
    try {
        const result = await compareInvoiceAndQuote({
            invoice: selectedInvoice,
            quotation: quote,
        });
        setComparisonResult(result);
    } catch (error) {
        console.error("Comparison failed:", error);
        toast({
            variant: "destructive",
            title: "Comparison Failed",
            description: "Could not generate comparison summary.",
        });
    } finally {
        setIsComparing(false);
    }
  };


  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2 self-start">
        <CardHeader>
          <CardTitle>Create Invoice</CardTitle>
          <CardDescription>Fill in the details to generate a new invoice.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
           <div className="space-y-4 rounded-md border p-4">
             <h4 className="text-sm font-medium">Quotation Details</h4>
             <div className="space-y-2">
                 <Label>Select Approved Quotation</Label>
                  <Select onValueChange={handleQuotationSelect}>
                     <SelectTrigger>
                         <SelectValue placeholder="Select a quotation to pre-fill" />
                     </SelectTrigger>
                     <SelectContent>
                         {initialQuotations.filter(q => q.status === 'Approved').map((quote) => (
                             <SelectItem key={quote.quoteId} value={quote.quoteId}>{quote.quoteId} - {quote.customer.name}</SelectItem>
                         ))}
                     </SelectContent>
                 </Select>
             </div>
             <div className="space-y-2">
                <Label htmlFor="po-number">Purchase Order Number (Optional)</Label>
                <Input id="po-number" placeholder="e.g., PO-12345" value={newInvoice.poNumber} onChange={(e) => setNewInvoice(prev => ({...prev, poNumber: e.target.value}))}/>
              </div>
          </div>
          
          <div className="space-y-4 rounded-md border p-4">
             <h4 className="text-sm font-medium">Customer Details</h4>
              <div className="space-y-2">
                  <Label>Select Registered Customer</Label>
                   <Select onValueChange={handleCustomerSelect} value={registeredCustomers.find(c => c.name === newInvoice.customer.name)?.id}>
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
                <Label htmlFor="customer-name">Full Name</Label>
                <Input id="customer-name" placeholder="e.g., ABC Corporation" value={newInvoice.customer.name} onChange={(e) => setNewInvoice(prev => ({...prev, customer: {...prev.customer, name: e.target.value}}))}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer-email">Email</Label>
                <Input id="customer-email" placeholder="e.g., contact@abccorp.com" value={newInvoice.customer.email} onChange={(e) => setNewInvoice(prev => ({...prev, customer: {...prev.customer, email: e.target.value}}))}/>
              </div>
               <div className="space-y-2">
                <Label htmlFor="customer-address">Address</Label>
                <Textarea id="customer-address" placeholder="e.g., 123 Business Road, Mumbai" value={newInvoice.customer.address} onChange={(e) => setNewInvoice(prev => ({...prev, customer: {...prev.customer, address: e.target.value}}))} />
              </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Services / Parts</h4>
            {newInvoice.items.map((item, index) => (
              <div key={item.id} className="grid gap-2 rounded-md border p-3 relative">
                 {newInvoice.items.length > 1 && (
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
                <Input id="labor-cost" type="number" placeholder="5000" value={newInvoice.laborCost} onChange={(e) => setNewInvoice(prev => ({...prev, laborCost: parseFloat(e.target.value) || 0}))}/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input id="discount" type="number" placeholder="10" value={newInvoice.discount} onChange={(e) => setNewInvoice(prev => ({...prev, discount: parseFloat(e.target.value) || 0}))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gst">GST (%)</Label>
                    <Input id="gst" type="number" placeholder="18" value={newInvoice.gst} onChange={(e) => setNewInvoice(prev => ({...prev, gst: parseFloat(e.target.value) || 0}))}/>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Grand Total</Label>
                <Input readOnly value={formatCurrency(totalAmount)} className="font-semibold border-none p-0 h-auto text-lg"/>
            </div>
           </div>
        </CardContent>
        <CardFooter className="flex justify-end">
            <Button onClick={handleCreateInvoice}>
                <Send className="mr-2 h-4 w-4" />
                Create Invoice
            </Button>
        </CardFooter>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>Track and manage your invoices.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoiceId}>
                  <TableCell className="font-medium">{invoice.invoiceId}</TableCell>
                  <TableCell>{invoice.customer.name}</TableCell>
                  <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[invoice.status]}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                       {invoice.status !== "Paid" && (
                            <Button size="sm">
                                <CreditCard className="mr-2 h-3 w-3" />
                                Mark as Paid
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(invoice)}>
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
      
      <Dialog open={!!selectedInvoice} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-4xl p-0" data-slot="header-plain">
            <div className="p-6">
                <DialogHeader>
                    <DialogTitle>Invoice Details</DialogTitle>
                    <DialogDescription>
                    A detailed view of invoice <span className="font-semibold">{selectedInvoice?.invoiceId}</span> for {selectedInvoice?.customer.name}.
                    </DialogDescription>
                </DialogHeader>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 pb-6 space-y-6">
                 <div ref={invoiceRef} className="bg-white text-black p-8 font-sans w-[210mm]">
                  {selectedInvoice && (() => {
                    const { itemsTotal, subTotal, discountAmount, gstAmount, grandTotal } = calculateInvoiceTotals(selectedInvoice);
                     const invoiceDate = new Date(selectedInvoice.date);
                    const dueDate = new Date(invoiceDate);
                    dueDate.setDate(invoiceDate.getDate() + 15);
                    const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

                    return (
                        <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', width: '100%', minHeight: '297mm', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
                          <header style={{paddingBottom: '20px', borderBottom: '2px solid #E2E8F0'}}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#2563EB' }}>
                                        <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                            <path fill="currentColor" d="M100 10l25 50 55 10-40 35 10 55-50-25-50 25 10-55-40-35 55-10z"/>
                                        </svg>
                                        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Bluestar Electronics</h1>
                                    </div>
                                    <div style={{marginTop: '10px', fontSize: '12px', color: '#64748B'}}>
                                        <p>bluestar.elec@gmail.com</p>
                                        <p>+91 9766661333</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#30475E' }}>INVOICE</h2>
                                </div>
                            </div>
                          </header>

                          <div style={{ marginTop: '30px', flexGrow: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingBottom: '20px' }}>
                                <div>
                                    <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#30475E', marginBottom: '8px' }}>Bill To:</h2>
                                    <p style={{ margin: 0, fontSize: '12px' }}>{selectedInvoice.customer.name}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{selectedInvoice.customer.address}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{selectedInvoice.customer.email}</p>
                                </div>
                                 <div style={{ width: '220px' }}>
                                    <div style={{ fontSize: '12px', textAlign: 'right' }}>
                                        <div style={{ marginBottom: '5px' }}><strong>Invoice ID:</strong><span>{selectedInvoice.invoiceId}</span></div>
                                        <div style={{ marginBottom: '5px' }}><strong>Invoice Date:</strong><span>{formatDate(invoiceDate)}</span></div>
                                        <div style={{ marginBottom: '5px' }}><strong>Due Date:</strong><span>{formatDate(dueDate)}</span></div>
                                        {selectedInvoice.quoteId && <div style={{ marginBottom: '5px' }}><strong>Quote Ref:</strong><span>{selectedInvoice.quoteId}</span></div>}
                                        {selectedInvoice.poNumber && <div style={{ marginBottom: '5px' }}><strong>PO Number:</strong><span>{selectedInvoice.poNumber}</span></div>}
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
                                        <th style={{ padding: '10px', textAlign: 'right' }}>TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.items.map((item, index) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: index % 2 === 0 ? '#F8FAFC' : 'white' }}>
                                            <td style={{ padding: '10px' }}>{index + 1}</td>
                                            <td style={{ padding: '10px', maxWidth: '300px' }}>{item.description}</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>{item.quantity}</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.quantity * item.price)}</td>
                                        </tr>
                                    ))}
                                    {selectedInvoice.laborCost > 0 && (
                                        <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: selectedInvoice.items.length % 2 === 0 ? '#F8FAFC' : 'white' }}>
                                            <td colSpan={4} style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Labor Cost</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(selectedInvoice.laborCost)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <div style={{ width: '250px', fontSize: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}><span>Sub Total:</span><span>{formatCurrency(subTotal)}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: 'green' }}><span>Discount ({selectedInvoice.discount}%):</span><span>-{formatCurrency(discountAmount)}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}><span>GST ({selectedInvoice.gst}%):</span><span>{formatCurrency(gstAmount)}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: '5px', borderTop: '2px solid #30475E', fontWeight: 'bold', fontSize: '16px' }}><span>TOTAL:</span><span>{formatCurrency(grandTotal)}</span></div>
                                </div>
                            </div>
                          </div>
                           <footer style={{ marginTop: 'auto', paddingTop: '20px', fontSize: '12px', flexShrink: 0, borderTop: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Terms and Conditions:</h3>
                                        <p style={{ color: '#64748B', maxWidth: '300px', fontSize: '10px' }}>Payment is due within 15 days of the invoice date. Please make checks payable to Bluestar Electronics.</p>
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
                 {selectedInvoice?.quoteId && (
                    <div className="p-4 border rounded-md">
                        {isComparing ? (
                           <div className="space-y-2">
                                <Skeleton className="h-4 w-1/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                           </div>
                        ) : comparisonResult ? (
                             <Alert>
                                <Wand2 className="h-4 w-4" />
                                <AlertTitle>Comparison Summary</AlertTitle>
                                <AlertDescription>
                                    <pre className="whitespace-pre-wrap font-sans text-sm">{comparisonResult}</pre>
                                </AlertDescription>
                            </Alert>
                        ) : (
                           <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-semibold">AI-Powered Comparison</h4>
                                    <p className="text-sm text-muted-foreground">Compare this invoice with its original quotation to spot differences.</p>
                                </div>
                                <Button onClick={handleCompare} disabled={isComparing}>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Compare with Quote
                                </Button>
                           </div>
                        )}
                    </div>
                )}
            </div>
          <DialogFooter className="px-6 py-4 flex-row justify-between w-full border-t">
            <div className="flex gap-2">
                <Button variant="secondary" onClick={handleDownloadPdf}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
                 <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Send Invoice
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


    