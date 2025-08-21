
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
import { Send, Eye, PlusCircle, Trash2, Download, Share2, FileText } from "lucide-react";
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
    const itemsTotal = quote.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const subTotal = itemsTotal + quote.laborCost;
    const discountAmount = subTotal * (quote.discount / 100);
    const totalAfterDiscount = subTotal - discountAmount;
    const gstAmount = totalAfterDiscount * (quote.gst / 100);
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
            const canvas = await html2canvas(quoteContent, { 
                scale: 3, 
                useCORS: true,
                backgroundColor: null, 
            });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF('p', 'pt', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const canvasAspectRatio = canvasWidth / canvasHeight;
            
            let finalWidth, finalHeight;
            
            finalWidth = pdfWidth;
            finalHeight = finalWidth / canvasAspectRatio;

            if (finalHeight > pdfHeight) {
                finalHeight = pdfHeight;
                finalWidth = finalHeight * canvasAspectRatio;
            }

            const xPos = (pdfWidth - finalWidth) / 2;
            const yPos = (pdfHeight - finalHeight) / 2;

            pdf.addImage(imgData, 'PNG', xPos, yPos, finalWidth, finalHeight);
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
    toast({
        title: "Invoice Generated",
        description: `Invoice for quote ${quote.quoteId} has been created.`,
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
            <Button onClick={handleCreateQuote} className="bg-[#30475E] hover:bg-[#30475E]/90 text-white">
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
            <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">
                <div ref={quoteRef} className="bg-white text-black p-8 font-sans">
                {selectedQuote && (() => {
                    const { itemsTotal, subTotal, discountAmount, gstAmount, grandTotal } = calculateQuoteTotals(selectedQuote);
                    const quoteDate = new Date(selectedQuote.date);
                    const dueDate = new Date(quoteDate);
                    dueDate.setDate(quoteDate.getDate() + 15);
                    const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

                    return (
                        <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', width: '210mm', minHeight: '297mm', padding: '40px', boxSizing: 'border-box', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
                            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '20px' }}>
                                <div style={{ flex: '1', paddingTop: '10px' }}>
                                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                                          <path fill="#2563EB" d="M100,12.5 C105.52,12.5 110,16.98 110,22.5 L110,62.5 L142.5,45 C147.2,42.12 153.21,43.87 156.08,48.58 C158.96,53.28 157.21,59.29 152.5,62.17 L115,82.5 L152.5,102.83 C157.21,105.71 158.96,111.72 156.08,116.42 C153.21,121.13 147.2,122.88 142.5,120 L110,102.5 L110,142.5 C110,148.02 105.52,152.5 100,152.5 C94.48,152.5 90,148.02 90,142.5 L90,102.5 L57.5,120 C52.8,122.88 46.79,121.13 43.92,116.42 C41.04,111.72 42.79,105.71 47.5,102.83 L85,82.5 L47.5,62.17 C42.79,59.29 41.04,53.28 43.92,48.58 C46.79,43.87 52.8,42.12 57.5,45 L90,62.5 L90,22.5 C90,16.98 94.48,12.5 100,12.5 Z" />
                                          <path fill="#808080" d="M100,12.5 C105.52,12.5 110,16.98 110,22.5 L110,62.5 L142.5,45 C147.2,42.12 153.21,43.87 156.08,48.58 C158.96,53.28 157.21,59.29 152.5,62.17 L115,82.5 L152.5,102.83 C157.21,105.71 158.96,111.72 156.08,116.42 C153.21,121.13 147.2,122.88 142.5,120 L110,102.5 L110,142.5 C110,148.02 105.52,152.5 100,152.5 C94.48,152.5 90,148.02 90,142.5 L90,102.5 L57.5,120 C52.8,122.88 46.79,121.13 43.92,116.42 C41.04,111.72 42.79,105.71 47.5,102.83 L85,82.5 L47.5,62.17 C42.79,59.29 41.04,53.28 43.92,48.58 C46.79,43.87 52.8,42.12 57.5,45 L90,62.5 L90,22.5 C90,16.98 94.48,12.5 100,12.5 Z" />
                                        </svg>
                                        <div>
                                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563EB', margin: 0 }}>Bluestar Electronics</h1>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ flexGrow: 1}}>
                              {/* Billed To and Invoice Details */}
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', paddingBottom: '20px' }}>
                                  <div>
                                      <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#30475E', marginBottom: '8px' }}>Billed To:</h2>
                                      <p style={{ margin: 0, fontSize: '12px' }}>{selectedQuote.customer.name}</p>
                                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{selectedQuote.customer.address}</p>
                                      <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{selectedQuote.customer.email}</p>
                                  </div>
                                  <div style={{ width: '220px' }}>
                                      <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0', textAlign: 'right', color: '#30475E' }}>QUOTATION</h2>
                                      <div style={{ fontSize: '12px', textAlign: 'right' }}>
                                          <div style={{ marginBottom: '5px' }}><strong>Quote No:</strong><span>{selectedQuote.quoteId}</span></div>
                                          <div style={{ marginBottom: '5px' }}><strong>Quote Date:</strong><span>{formatDate(quoteDate)}</span></div>
                                          <div><strong>Due Date:</strong><span>{formatDate(dueDate)}</span></div>
                                      </div>
                                  </div>
                              </div>
                              
                              {/* Items Table */}
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
                                      {selectedQuote.items.map((item, index) => (
                                          <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: index % 2 === 0 ? '#F8FAFC' : 'white' }}>
                                              <td style={{ padding: '10px' }}>{index + 1}</td>
                                              <td style={{ padding: '10px', maxWidth: '300px' }}>{item.description}</td>
                                              <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                                              <td style={{ padding: '10px', textAlign: 'right' }}>{item.quantity}</td>
                                              <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.quantity * item.price)}</td>
                                          </tr>
                                      ))}
                                      {selectedQuote.laborCost > 0 && (
                                          <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: selectedQuote.items.length % 2 === 0 ? '#F8FAFC' : 'white' }}>
                                              <td colSpan={4} style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Labor Cost</td>
                                              <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(selectedQuote.laborCost)}</td>
                                          </tr>
                                      )}
                                  </tbody>
                              </table>

                              {/* Totals */}
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                  <div style={{ width: '250px', fontSize: '12px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}><span>Sub Total:</span><span>{formatCurrency(subTotal)}</span></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: 'green' }}><span>Discount ({selectedQuote.discount}%):</span><span>-{formatCurrency(discountAmount)}</span></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}><span>GST ({selectedQuote.gst}%):</span><span>{formatCurrency(gstAmount)}</span></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: '5px', borderTop: '2px solid #30475E', fontWeight: 'bold', fontSize: '16px' }}><span>TOTAL:</span><span>{formatCurrency(grandTotal)}</span></div>
                                  </div>
                              </div>
                            </div>
                            
                             {/* Signature and Terms */}
                            <div style={{ marginTop: 'auto', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', flexShrink: 0, borderTop: '1px solid #E2E8F0' }}>
                                <div>
                                    <h3 style={{ fontWeight: 'bold', marginBottom: '8px' }}>Terms and Conditions:</h3>
                                    <p style={{ color: '#64748B', maxWidth: '300px', fontSize: '10px' }}>Payment is due within 15 days. All products are subject to standard warranty. Thank you for your business!</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <p style={{ borderTop: '1px solid #64748B', paddingTop: '5px', marginTop: '40px' }}>Authorized Signature</p>
                                    <p style={{ fontWeight: 'bold', marginTop: '5px' }}>Bluestar Electronics</p>
                                </div>
                            </div>
                            
                             <div style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', textAlign: 'center', fontSize: '10px', color: '#A0AEC0' }}>
                                <p>Created on Bluestar Hub</p>
                            </div>
                        </div>
                    );
                })()}
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

    
