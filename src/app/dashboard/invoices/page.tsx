
"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
import { Send, Eye, PlusCircle, Trash2, Download, Share2, CreditCard, DollarSign, QrCode, Zap } from "lucide-react";
import type { Invoice, QuotationItem, Customer, Payment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import type jsPDF from 'jspdf';
import type html2canvas from 'html2canvas';
import { initialQuotations } from "@/lib/data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrowserBarcodeReader, NotFoundException, IScannerControls } from '@zxing/library';
import { ScrollArea } from "@/components/ui/scroll-area";


const registeredCustomers: Customer[] = [
    { id: "CUST-001", name: "Green Valley Apartments", contactPerson: "Mr. Sharma", email: "manager@gva.com", phone: "555-0101", address: "456 Park Ave, Residence City" },
    { id: "CUST-002", name: "ABC Corporation", contactPerson: "Ms. Priya", email: "contact@abc.com", phone: "555-0102", address: "123 Business Rd, Corp Town" },
    { id: "CUST-003", name: "John Doe", email: "john.doe@example.com", phone: "555-0103", address: "789 Pine Ln, Sometown" },
];

const initialInvoices: Invoice[] = [
    {
        invoiceId: "INV-2023-0012",
        customer: { name: "Green Valley Apartments", email: "manager@gva.com", address: "456 Park Ave, Residence City", contactPerson: "Mr. Sharma" },
        items: [{ id: "item-1", description: "16-Channel NVR System", quantity: 1, unit: "nos", price: 80000, gstRate: 18, serialNumbers: ["NVR-GVA-001"] }, { id: "item-2", description: "12x Bullet Cameras", quantity: 1, unit: "nos", price: 40000, gstRate: 18, serialNumbers: ["CAM-GVA-001"] }],
        laborCost: 20000,
        discount: 5,
        totalAmount: 157528,
        status: "Paid",
        date: "2023-10-22",
        quoteId: "QT-2023-050",
        payments: [
            { id: "PAY-001", amount: 157528, date: "2023-10-22", method: "Online" }
        ]
    },
    {
        invoiceId: "INV-2023-0015",
        customer: { name: "ABC Corporation", email: "contact@abc.com", address: "123 Business Rd, Corp Town", contactPerson: "Ms. Priya" },
        items: [{ id: "item-1", description: "4x Hikvision 5MP Dome Cameras", quantity: 1, unit: "nos", price: 18000, gstRate: 18, serialNumbers: ["CAM-ABC-001"] }],
        laborCost: 5000,
        discount: 10,
        totalAmount: 24780,
        status: "Partially Paid",
        date: "2023-10-25",
        quoteId: "QT-2023-051",
        payments: [
            { id: "PAY-002", amount: 10000, date: "2023-10-26", method: "Cash" }
        ]
    },
];

type NewInvoiceItem = Omit<QuotationItem, 'quantity' | 'price' | 'gstRate'> & {
    quantity: string | number;
    price: string | number;
    gstRate: string | number;
};

const statusVariant: { [key in Invoice["status"]]: "secondary" | "default" | "destructive" } = {
  Paid: "secondary",
  Pending: "default",
  Overdue: "destructive",
  "Partially Paid": "default",
  Cancelled: "destructive",
};

const units = ["nos", "meters", "pcs", "pack", "box"];

const BarcodeScanner = ({ onScanSuccess, onScanFailure }: { onScanSuccess: (text: string) => void; onScanFailure: (error: any) => void }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReader = useMemo(() => new BrowserBarcodeReader(), []);
    const controlsRef = useRef<IScannerControls | null>(null);
    const [torchSupported, setTorchSupported] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const videoTrackRef = useRef<MediaStreamTrack | null>(null);

    const stopScanner = useCallback(() => {
        if (controlsRef.current) {
            controlsRef.current.stop();
            controlsRef.current = null;
            if (videoTrackRef.current) {
                videoTrackRef.current.stop();
                videoTrackRef.current = null;
            }
        }
    }, []);

    const toggleTorch = useCallback(() => {
        if (videoTrackRef.current && torchSupported) {
            const nextState = !torchOn;
            videoTrackRef.current.applyConstraints({
                advanced: [{ torch: nextState }]
            }).then(() => {
                setTorchOn(nextState);
            }).catch(e => {
                console.error("Failed to toggle torch", e);
            });
        }
    }, [torchOn, torchSupported]);

    useEffect(() => {
        const startScanner = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                 if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    const track = stream.getVideoTracks()[0];
                    videoTrackRef.current = track;
                    const capabilities = track.getCapabilities();
                    if (capabilities.torch) {
                        setTorchSupported(true);
                    }

                    controlsRef.current = codeReader.decodeFromStream(stream, videoRef.current, (result, error) => {
                        if (result) {
                            stopScanner();
                            onScanSuccess(result.getText());
                        }
                        if (error && !(error instanceof NotFoundException)) {
                           onScanFailure(error);
                        }
                    });
                }
            } catch (err) {
                 onScanFailure(err);
            }
        };

        startScanner();

        return () => {
            stopScanner();
        };
    }, [codeReader, onScanSuccess, onScanFailure, stopScanner]);

    return (
        <div>
            <video ref={videoRef} className="w-full aspect-square rounded-md bg-muted" />
             {torchSupported && (
                <Button onClick={toggleTorch} variant="outline" className="w-full mt-4">
                    <Zap className="mr-2 h-4 w-4" />
                    {torchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
                </Button>
            )}
        </div>
    );
};


export default function InvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [newInvoice, setNewInvoice] = useState<{
    customer: { name: string; email: string; address: string };
    items: NewInvoiceItem[];
    laborCost: number;
    discount: number;
    quoteId: string;
    poNumber: string;
  }>({
    customer: { name: "", email: "", address: "" },
    items: [{ id: `item-${Date.now()}`, description: "", quantity: 1, unit: "nos", price: '', gstRate: 18, serialNumbers: [] }],
    laborCost: 0,
    discount: 0,
    quoteId: "",
    poNumber: "",
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState<boolean>(false);
  const [newPayment, setNewPayment] = useState({ amount: 0, method: "Online" as Payment["method"]});
  const [copyType, setCopyType] = useState<'Original Copy' | "Customer's Copy">('Original Copy');
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeScannerState, setActiveScannerState] = useState<{itemId: string, serialIndex: number} | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

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

  const handleOpenScanner = async (itemId: string, serialIndex: number) => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        setHasCameraPermission(true);
        setActiveScannerState({ itemId, serialIndex });
        setIsScannerOpen(true);
    } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
    }
  };
  
  const onScanSuccess = (decodedText: string) => {
    if(activeScannerState) {
        handleSerialNumberChange(activeScannerState.itemId, activeScannerState.serialIndex, decodedText);
    }
    toast({
        title: "Scan Successful",
        description: `Serial Number: ${decodedText}`,
    });
    setIsScannerOpen(false);
    setActiveScannerState(null);
  }
  
  const onScanFailure = (error: any) => {
      console.error('Scan failed:', error);
      setIsScannerOpen(false);
      setActiveScannerState(null);
      
      let title = 'Scanner Error';
      let description = 'Could not start the scanner.';

      if (error.name === 'NotAllowedError') {
        title = 'Camera Access Denied';
        description = 'Please allow camera access in your browser settings.';
      } else if (error.name === 'NotReadableError') {
        title = 'Camera In Use';
        description = 'Your camera is in use by another application. Please close it and try again.';
      }

      toast({
          variant: 'destructive',
          title: title,
          description: description,
      });
  }


  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedInvoice(null);
    }
  }

  const subTotal = useMemo(() => {
    const itemsTotal = newInvoice.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
    return itemsTotal + newInvoice.laborCost;
  }, [newInvoice.items, newInvoice.laborCost]);

  const discountAmount = useMemo(() => {
    return subTotal * (newInvoice.discount / 100);
  }, [subTotal, newInvoice.discount]);

  const totalAfterDiscount = useMemo(() => {
    return subTotal - discountAmount;
  }, [subTotal, discountAmount]);

  const gstAmount = useMemo(() => {
    return newInvoice.items.reduce((sum, item) => {
      const itemTotal = Number(item.quantity) * Number(item.price);
      const itemTotalAfterDiscount = itemTotal * (1 - (newInvoice.discount / 100));
      return sum + (itemTotalAfterDiscount * (Number(item.gstRate) / 100));
    }, 0);
  }, [newInvoice.items, newInvoice.discount]);

  const totalAmount = useMemo(() => {
    return Math.round(totalAfterDiscount + gstAmount);
  }, [totalAfterDiscount, gstAmount]);


  const handleItemChange = (id: string, field: keyof NewInvoiceItem, value: string | number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const newItem = { ...item, [field]: value };
          if ((field === 'price' || field === 'quantity') && (value === '' || value === null || value === undefined)) {
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

  const handleSerialNumberChange = (itemId: string, index: number, value: string) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const newSerialNumbers = [...(item.serialNumbers || [])];
          newSerialNumbers[index] = value;
          return { ...item, serialNumbers: newSerialNumbers };
        }
        return item;
      })
    }));
  };

  const addSerialNumber = (itemId: string) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const newSerialNumbers = [...(item.serialNumbers || []), ''];
          return { ...item, serialNumbers: newSerialNumbers };
        }
        return item;
      })
    }));
  };

  const removeSerialNumber = (itemId: string, index: number) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const newSerialNumbers = [...(item.serialNumbers || [])];
          newSerialNumbers.splice(index, 1);
          return { ...item, serialNumbers: newSerialNumbers };
        }
        return item;
      })
    }));
  };

  const addItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { id: `item-${Date.now()}`, description: "", quantity: 1, unit: "nos", price: '', gstRate: 18, serialNumbers: [] }],
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
        items: [{ id: `item-${Date.now()}`, description: "", quantity: 1, unit: "nos", price: '', gstRate: 18, serialNumbers: [] }],
        laborCost: 0,
        discount: 0,
        quoteId: "",
        poNumber: "",
      });
  }

  const handleCreateInvoice = () => {
    const finalItems: QuotationItem[] = newInvoice.items.map(i => ({
        ...i,
        quantity: Number(i.quantity) || 0,
        price: Number(i.price) || 0,
        gstRate: Number(i.gstRate) || 0,
    }));

    if (!newInvoice.customer.name || finalItems.some(i => !i.description || i.price <= 0)) {
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
      items: finalItems,
      laborCost: newInvoice.laborCost,
      discount: newInvoice.discount,
      totalAmount,
      status: "Pending",
      date: new Date().toISOString().split('T')[0],
      quoteId: newInvoice.quoteId,
      poNumber: newInvoice.poNumber,
      payments: [],
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
                    address: customer.address,
                    contactPerson: customer.contactPerson
                }
            }));
        }
    };
    
    const handleQuotationSelect = (quotationId: string) => {
        const quote = initialQuotations.find(q => q.quoteId === quotationId);
        if (quote) {
            setNewInvoice({
                customer: quote.customer,
                items: quote.items.map(item => ({...item, unit: item.unit || 'nos', serialNumbers: [], price: item.price || '', quantity: item.quantity || '', gstRate: item.gstRate || ''})),
                laborCost: quote.laborCost,
                discount: quote.discount,
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
    const gstAmount = invoice.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price;
      const itemTotalAfterDiscount = itemTotal * (1 - (invoice.discount / 100));
      return sum + (itemTotalAfterDiscount * (item.gstRate / 100));
    }, 0);
    const grandTotal = Math.round(totalAfterDiscount + gstAmount);
    const amountPaid = invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const amountDue = grandTotal - amountPaid;
    return { itemsTotal, subTotal, discountAmount, gstAmount, grandTotal, amountPaid, amountDue };
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

  const handleAddPayment = () => {
    if (!selectedInvoice || !newPayment.amount) {
        toast({
            variant: "destructive",
            title: "Invalid Payment",
            description: "Please enter a valid payment amount.",
        });
        return;
    }

    const updatedInvoices = invoices.map(inv => {
        if (inv.invoiceId === selectedInvoice.invoiceId) {
            const existingPayments = inv.payments || [];
            const newPaymentRecord: Payment = {
                id: `PAY-${Date.now()}`,
                amount: newPayment.amount,
                date: new Date().toISOString(),
                method: newPayment.method,
            };
            const updatedPayments = [...existingPayments, newPaymentRecord];
            const amountPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
            
            let newStatus: Invoice["status"] = "Partially Paid";
            if (amountPaid >= inv.totalAmount) {
                newStatus = "Paid";
            }

            return {
                ...inv,
                payments: updatedPayments,
                status: newStatus,
            };
        }
        return inv;
    });

    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    
    const updatedSelectedInvoice = updatedInvoices.find(inv => inv.invoiceId === selectedInvoice.invoiceId);
    if (updatedSelectedInvoice) {
        setSelectedInvoice(updatedSelectedInvoice);
    }
    
    toast({
        title: "Payment Recorded",
        description: `${formatCurrency(newPayment.amount)} has been added to invoice ${selectedInvoice.invoiceId}.`
    });
    
    setIsAddPaymentOpen(false);
    setNewPayment({ amount: 0, method: 'Online' });
  };
  
  const handleConfirmCancel = () => {
    if (!invoiceToCancel) return;

    const updatedInvoices = invoices.map(inv => 
        inv.invoiceId === invoiceToCancel.invoiceId ? { ...inv, status: 'Cancelled' } : inv
    );
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    toast({
        title: 'Invoice Cancelled',
        description: `Invoice ${invoiceToCancel.invoiceId} has been cancelled.`,
    });
    setInvoiceToCancel(null);
  };


  return (
    <>
    <div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2">
       <div className="flex flex-col">
            <Card className="flex flex-1 flex-col">
                <CardHeader>
                    <CardTitle>Create Invoice</CardTitle>
                    <CardDescription>Fill in the details to generate a new invoice.</CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1">
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
                            <Label htmlFor="customer-name">Customer / Company Name</Label>
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
                          <div key={item.id} className="grid gap-4 rounded-md border p-3 relative">
                             {newInvoice.items.length > 1 && (
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
                                  <Input id={`item-qty-${index}`} type="text" placeholder="1" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} />
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
                                  <Input id={`item-price-${index}`} type="text" placeholder="10000" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}/>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor={`item-gst-${index}`}>GST (%)</Label>
                                  <Input id={`item-gst-${index}`} type="number" placeholder="18" value={item.gstRate} onChange={(e) => handleItemChange(item.id, 'gstRate', e.target.value)}/>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Serial Numbers</Label>
                                <div className="space-y-2">
                                {(item.serialNumbers || []).map((serial, serialIndex) => (
                                    <div key={serialIndex} className="flex items-center gap-2">
                                    <Input
                                        id={`item-${item.id}-serial-${serialIndex}`}
                                        placeholder={`Serial number ${serialIndex + 1}`}
                                        value={serial}
                                        onChange={(e) => handleSerialNumberChange(item.id, serialIndex, e.target.value)}
                                    />
                                    <Button variant="outline" size="icon" onClick={() => handleOpenScanner(item.id, serialIndex)}>
                                        <QrCode className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => removeSerialNumber(item.id, serialIndex)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => addSerialNumber(item.id)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Serial No.
                                </Button>
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
                                <Label>Grand Total</Label>
                                <Input readOnly value={formatCurrency(totalAmount)} className="font-semibold border-none p-0 h-auto text-lg"/>
                            </div>
                        </div>
                       </div>
                    </CardContent>
                </ScrollArea>
                <CardFooter className="flex justify-end pt-6">
                    <Button onClick={handleCreateInvoice}>
                        <Send className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Button>
                </CardFooter>
            </Card>
        </div>
      <div className="flex flex-col">
          <Card className="flex flex-1 flex-col">
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
                           {invoice.status !== "Paid" && invoice.status !== "Cancelled" && (
                                <Button size="sm" onClick={() => { setSelectedInvoice(invoice); setIsAddPaymentOpen(true); }}>
                                    <DollarSign className="mr-2 h-3 w-3" />
                                    Add Payment
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => setSelectedInvoice(invoice)}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View</span>
                            </Button>
                            {invoice.status !== "Cancelled" && (
                               <Button variant="ghost" size="icon" onClick={() => setInvoiceToCancel(invoice)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    <span className="sr-only">Cancel Invoice</span>
                                </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
      </div>
      
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
                    const { itemsTotal, subTotal, discountAmount, gstAmount, grandTotal, amountPaid, amountDue } = calculateInvoiceTotals(selectedInvoice);
                     const invoiceDate = new Date(selectedInvoice.date);
                    const dueDate = new Date(invoiceDate);
                    dueDate.setDate(invoiceDate.getDate() + 15);
                    const formatDate = (date: Date | string) => new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

                    return (
                        <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', width: '100%', minHeight: '297mm', padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
                          <header style={{paddingBottom: '20px', borderBottom: '2px solid #E2E8F0'}}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#2563EB' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 200 200"><g transform="translate(100 100)"><path d="M78.8-3.4C71.3 14.1 52.8 28.1 36.4 39.1C20.1 50.1 5.9 58.1-10.4 59.4C-26.7 60.7-45.1 55.4-58.4 43.1C-71.7 30.7-79.9 11.4-78.6-8.8C-77.3-29-66.5-50.1-50.6-62.1C-34.7-74.1-13.7-77-5.5-69.8C2.7-62.7 10.9-45.5 24.3-33.1C37.8-20.7 56.5-13.1 78.8-3.4Z" fill="#3B82F6"></path></g></svg>
                                        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Bluestar Electronics</h1>
                                    </div>
                                    <div style={{marginTop: '10px', fontSize: '12px', color: '#64748B'}}>
                                        <p><strong>Email:</strong> bluestar.elec@gmail.com</p>
                                        <p><strong>Contact:</strong> +91 9766661333</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#30475E' }}>INVOICE</h2>
                                    <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{copyType}</p>
                                </div>
                            </div>
                          </header>

                          <div style={{ marginTop: '30px', flexGrow: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingBottom: '20px' }}>
                                <div>
                                    <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#30475E', marginBottom: '8px' }}>Bill To:</h2>
                                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>{selectedInvoice.customer.name}</p>
                                     {selectedInvoice.customer.contactPerson && <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>Attn: {selectedInvoice.customer.contactPerson}</p>}
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>{selectedInvoice.customer.address}</p>
                                    <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}><strong>Email:</strong> {selectedInvoice.customer.email}</p>
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
                                        <th style={{ padding: '10px', textAlign: 'right' }}>GST</th>
                                        <th style={{ padding: '10px', textAlign: 'right' }}>TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedInvoice.items.map((item, index) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: index % 2 === 0 ? '#F8FAFC' : 'white' }}>
                                            <td style={{ padding: '10px' }}>{index + 1}</td>
                                            <td style={{ padding: '10px', maxWidth: '300px' }}>{item.description} {item.serialNumbers && item.serialNumbers.length > 0 && <span style={{color: '#64748B', fontSize: '10px', display: 'block'}}>S/N: {item.serialNumbers.join(', ')}</span>}</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>{item.quantity} {item.unit}</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>{item.gstRate}%</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(item.quantity * item.price)}</td>
                                        </tr>
                                    ))}
                                    {selectedInvoice.laborCost > 0 && (
                                        <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: selectedInvoice.items.length % 2 === 0 ? '#F8FAFC' : 'white' }}>
                                            <td colSpan={5} style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>Labor Cost</td>
                                            <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(selectedInvoice.laborCost)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <div style={{ width: '250px', fontSize: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}><span>Sub Total:</span><span>{formatCurrency(subTotal)}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: 'green' }}><span>Discount ({selectedInvoice.discount}%):</span><span>-{formatCurrency(discountAmount)}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}><span>Total GST:</span><span>{formatCurrency(gstAmount)}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: '5px', borderTop: '2px solid #30475E', fontWeight: 'bold', fontSize: '16px' }}><span>TOTAL:</span><span>{formatCurrency(grandTotal)}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', color: 'green' }}><span>Amount Paid:</span><span>-{formatCurrency(amountPaid)}</span></div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: '5px', borderTop: '2px solid #30475E', fontWeight: 'bold', fontSize: '16px', backgroundColor: '#F1F5F9', borderRadius: '4px' }}><span>AMOUNT DUE:</span><span>{formatCurrency(amountDue)}</span></div>
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
                <div className="p-4 border rounded-md">
                    <RadioGroup defaultValue="Original Copy" className="flex items-center gap-4" onValueChange={(value: 'Original Copy' | "Customer's Copy") => setCopyType(value)}>
                        <h4 className="text-sm font-medium">Select Copy Type:</h4>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Original Copy" id="r-original" />
                            <Label htmlFor="r-original">Original Copy</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Customer's Copy" id="r-customer" />
                            <Label htmlFor="r-customer">Customer's Copy</Label>
                        </div>
                    </RadioGroup>
                </div>
                 {selectedInvoice?.payments && selectedInvoice.payments.length > 0 && (
                    <div className="p-4 border rounded-md">
                        <h4 className="font-semibold mb-2">Payment History</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedInvoice.payments.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>{new Date(p.date).toLocaleDateString('en-IN')}</TableCell>
                                        <TableCell>{formatCurrency(p.amount)}</TableCell>
                                        <TableCell><Badge variant="secondary">{p.method}</Badge></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
                {selectedInvoice?.status !== "Paid" && (
                    <Button onClick={() => setIsAddPaymentOpen(true)}>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Add Payment
                    </Button>
                )}
            </div>
            <DialogClose asChild>
                <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>

       <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Payment for {selectedInvoice?.invoiceId}</DialogTitle>
                <DialogDescription>
                    Record a new payment for this invoice. The amount due is {selectedInvoice && formatCurrency(calculateInvoiceTotals(selectedInvoice).amountDue)}.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="payment-amount">Amount (₹)</Label>
                    <Input id="payment-amount" type="number" value={newPayment.amount} onChange={e => setNewPayment(p => ({...p, amount: parseFloat(e.target.value) || 0}))} />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="payment-method">Payment Method</Label>
                    <Select value={newPayment.method} onValueChange={(value: Payment["method"]) => setNewPayment(p => ({...p, method: value}))}>
                        <SelectTrigger id="payment-method">
                            <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Online">Online</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Card">Card</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddPayment}>Record Payment</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isScannerOpen} onOpenChange={(open) => {
        if (!open) {
            setIsScannerOpen(false);
            setActiveScannerState(null);
        }
      }}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Scan Barcode / QR Code</DialogTitle>
                <DialogDescription>
                    Point your camera at a code to scan the serial number.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                 {isScannerOpen && <BarcodeScanner onScanSuccess={onScanSuccess} onScanFailure={onScanFailure} />}
                {hasCameraPermission === false && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>
                        Please allow camera access in your browser settings to use this feature. You may need to refresh the page after granting permission.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
            <DialogFooter>
                 <Button variant="outline" onClick={() => { setIsScannerOpen(false); setActiveScannerState(null); }}>Cancel</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!invoiceToCancel} onOpenChange={() => setInvoiceToCancel(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to cancel this invoice?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently mark invoice {invoiceToCancel?.invoiceId} as cancelled.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Close</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmCancel}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

    

    
