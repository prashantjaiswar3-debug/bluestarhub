
"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
import { Send, Eye, PlusCircle, Trash2, Share2, DollarSign, QrCode, Zap, Edit, FileText } from "lucide-react";
import type { Invoice, QuotationItem, Customer, Payment, CompanyInfo } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { initialQuotations } from "@/lib/data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BrowserBarcodeReader, NotFoundException, IScannerControls } from '@zxing/library';
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { InvoicePDF } from "@/components/pdf/invoice-pdf";


const registeredCustomers: Customer[] = [
    { id: "CUST-001", name: "Green Valley Apartments", contactPerson: "Mr. Sharma", email: "manager@gva.com", phone: "555-0101", address: "456 Park Ave, Residence City", gstin: "27AAAAA0000A1Z5" },
    { id: "CUST-002", name: "ABC Corporation", contactPerson: "Ms. Priya", email: "contact@abc.com", phone: "555-0102", address: "123 Business Rd, Corp Town", gstin: "29BBBBB1111B2Z6" },
    { id: "CUST-003", name: "John Doe", email: "john.doe@example.com", phone: "555-0103", address: "789 Pine Ln, Sometown" },
];

const initialInvoices: Invoice[] = [
    {
        invoiceId: "INV-2023-0012",
        customer: { name: "Green Valley Apartments", email: "manager@gva.com", address: "456 Park Ave, Residence City", contactPerson: "Mr. Sharma", gstin: "27AAAAA0000A1Z5" },
        items: [{ id: "item-1", description: "16-Channel NVR System", quantity: 1, unit: "nos", price: 80000, gstRate: 18, serialNumbers: ["NVR-GVA-001"] }, { id: "item-2", description: "12x Bullet Cameras", quantity: 1, unit: "nos", price: 40000, gstRate: 18, serialNumbers: ["CAM-GVA-001"] }],
        laborCost: 20000,
        discount: 5,
        totalAmount: 157528,
        status: "Paid",
        date: "2023-10-22",
        quoteId: "QT-2023-050",
        isGst: true,
        payments: [
            { id: "PAY-001", amount: 157528, date: "2023-10-22", method: "Online" }
        ]
    },
    {
        invoiceId: "INV-2023-0015",
        customer: { name: "ABC Corporation", email: "contact@abc.com", address: "123 Business Rd, Corp Town", contactPerson: "Ms. Priya", gstin: "29BBBBB1111B2Z6" },
        items: [{ id: "item-1", description: "4x Hikvision 5MP Dome Cameras", quantity: 1, unit: "nos", price: 18000, gstRate: 18, serialNumbers: ["CAM-ABC-001"] }],
        laborCost: 5000,
        discount: 10,
        totalAmount: 24780,
        status: "Partially Paid",
        date: "2023-10-25",
        quoteId: "QT-2023-051",
        isGst: true,
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
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("recent");
  const [newInvoice, setNewInvoice] = useState<{
    customer: { name: string; email: string; address: string; gstin?: string; };
    items: NewInvoiceItem[];
    laborCost: number;
    discount: number;
    quoteId: string;
    poNumber: string;
    isGst: boolean;
  }>({
    customer: { name: "", email: "", address: "", gstin: "" },
    items: [{ id: `item-${Date.now()}`, description: "", quantity: 1, unit: "nos", price: '', gstRate: 18, serialNumbers: [] }],
    laborCost: 0,
    discount: 0,
    quoteId: "",
    poNumber: "",
    isGst: true,
  });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState<boolean>(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState<boolean>(false);
  const [newPayment, setNewPayment] = useState({ amount: 0, method: "Online" as Payment["method"]});
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [activeScannerState, setActiveScannerState] = useState<{itemId: string, serialIndex: number} | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const pdfPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
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
        
        const storedCompanyInfoStr = localStorage.getItem('companyInfo');
        if (storedCompanyInfoStr) {
            const info = JSON.parse(storedCompanyInfoStr);
            setCompanyInfo(info);
        } else {
             // Handle case where company info might not be set
            console.warn("Company info not found in localStorage.");
        }
    } catch (error) {
        console.error("Failed to parse data from localStorage", error);
    }
  }, []);

  const handleOpenPdfPreview = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPdfPreviewOpen(true);
  };

  const handleGeneratePdf = async () => {
    if (!selectedInvoice || !companyInfo || !pdfPreviewRef.current) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot generate PDF. Required data is missing.',
      });
      return;
    }
    setIsGeneratingPdf(true);
    toast({
      title: 'Generating PDF',
      description: 'Please wait while your invoice is being created...',
    });

    try {
      const canvas = await html2canvas(pdfPreviewRef.current, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');

      toast({
        title: 'PDF Ready',
        description: 'Your invoice has been opened in a new tab.',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        variant: 'destructive',
        title: 'PDF Generation Failed',
        description: 'An error occurred while creating the PDF. Please try again.',
      });
    } finally {
      setIsGeneratingPdf(false);
      setIsPdfPreviewOpen(false);
      setSelectedInvoice(null);
    }
  };
  
  const handleModifyInvoice = (invoiceId: string) => {
    const invoiceToEdit = invoices.find(inv => inv.invoiceId === invoiceId);
    if(invoiceToEdit) {
        setEditingInvoiceId(invoiceToEdit.invoiceId);
        setNewInvoice({
            customer: invoiceToEdit.customer,
            items: invoiceToEdit.items.map(item => ({
                ...item,
                price: item.price ?? '',
                quantity: item.quantity ?? '',
                gstRate: item.gstRate ?? '',
            })),
            laborCost: invoiceToEdit.laborCost,
            discount: invoiceToEdit.discount,
            quoteId: invoiceToEdit.quoteId || "",
            poNumber: invoiceToEdit.poNumber || "",
            isGst: invoiceToEdit.isGst,
        });
        setActiveTab("create");
    }
  };

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
  }, [subTotal, newInvoice.discount]);

  const gstAmount = useMemo(() => {
    if (!newInvoice.isGst) return 0;
    return newInvoice.items.reduce((sum, item) => {
      const itemTotal = Number(item.quantity) * Number(item.price);
      const itemTotalAfterDiscount = itemTotal * (1 - (newInvoice.discount / 100));
      return sum + (itemTotalAfterDiscount * (Number(item.gstRate) / 100));
    }, 0);
  }, [newInvoice.items, newInvoice.discount, newInvoice.isGst]);

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
        customer: { name: "", email: "", address: "", gstin: "" },
        items: [{ id: `item-${Date.now()}`, description: "", quantity: 1, unit: "nos", price: '', gstRate: 18, serialNumbers: [] }],
        laborCost: 0,
        discount: 0,
        quoteId: "",
        poNumber: "",
        isGst: true,
      });
      setEditingInvoiceId(null);
  }

  const handleCreateOrUpdateInvoice = () => {
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
    
    if(editingInvoiceId) {
        // Update existing invoice
        const updatedInvoiceData = {
            customer: newInvoice.customer,
            items: finalItems,
            laborCost: newInvoice.laborCost,
            discount: newInvoice.discount,
            totalAmount,
            quoteId: newInvoice.quoteId,
            poNumber: newInvoice.poNumber,
            isGst: newInvoice.isGst,
        };
        const updatedInvoices = invoices.map(inv => inv.invoiceId === editingInvoiceId ? { ...inv, ...updatedInvoiceData } : inv);
        setInvoices(updatedInvoices);
        localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
        toast({
            title: "Invoice Updated",
            description: `Invoice ${editingInvoiceId} for ${updatedInvoiceData.customer.name} has been updated.`,
        });

    } else {
        // Create new invoice
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
          isGst: newInvoice.isGst,
          payments: [],
        };
        
        const updatedInvoices = [newInvoiceData, ...invoices];
        setInvoices(updatedInvoices);
        localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
        toast({
            title: "Invoice Created",
            description: `Invoice for ${newInvoiceData.customer.name} has been created.`,
        });
    }

    resetForm();
    setActiveTab("recent");
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
                    contactPerson: customer.contactPerson,
                    gstin: customer.gstin,
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
                isGst: true,
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
    const gstAmount = invoice.isGst ? invoice.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price;
      const itemTotalAfterDiscount = itemTotal * (1 - (invoice.discount / 100));
      return sum + (itemTotalAfterDiscount * (item.gstRate / 100));
    }, 0) : 0;
    const grandTotal = Math.round(totalAfterDiscount + gstAmount);
    const amountPaid = invoice.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const amountDue = grandTotal - amountPaid;
    return { itemsTotal, subTotal, discountAmount, gstAmount, grandTotal, amountPaid, amountDue };
  }

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
    <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        if (value === 'recent') {
            resetForm();
        }
    }} className="flex flex-1 flex-col">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recent">Recent Invoices</TabsTrigger>
            <TabsTrigger value="create">{editingInvoiceId ? "Modify Invoice" : "Create Invoice"}</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="flex-1">
          <Card className="flex h-full flex-1 flex-col">
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Track and manage your invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <Table className="min-w-[700px]">
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
                                  <Button size="sm" variant="outline" onClick={() => handleModifyInvoice(invoice.invoiceId)}>
                                      <Edit className="mr-2 h-3 w-3" />
                                      Modify
                                  </Button>
                              )}
                              <Button variant="ghost" size="icon" onClick={() => handleOpenPdfPreview(invoice)}>
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
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="create" className="flex-1">
            <Card className="flex h-full flex-1 flex-col">
                <CardHeader>
                    <CardTitle>{editingInvoiceId ? "Modify Invoice" : "Create Invoice"}</CardTitle>
                    <CardDescription>{editingInvoiceId ? `Editing invoice ${editingInvoiceId}.` : "Fill in the details to generate a new invoice."}</CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <CardContent className="grid gap-6">
                        <div className="space-y-4 rounded-md border p-4">
                            <h4 className="text-sm font-medium">Bill Type</h4>
                            <RadioGroup value={newInvoice.isGst ? 'withGst' : 'withoutGst'} onValueChange={(value) => setNewInvoice(prev => ({...prev, isGst: value === 'withGst'}))}>
                                <div className="flex items-center space-x-2">
                                <RadioGroupItem value="withGst" id="withGst" />
                                <Label htmlFor="withGst">With GST (Tax Invoice)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                <RadioGroupItem value="withoutGst" id="withoutGst" />
                                <Label htmlFor="withoutGst">Without GST (Bill of Supply)</Label>
                                </div>
                            </RadioGroup>
                        </div>
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
                          <div className="space-y-2">
                            <Label htmlFor="customer-gstin">Customer GSTIN (Optional)</Label>
                            <Input id="customer-gstin" placeholder="e.g., 27AAAAA0000A1Z5" value={newInvoice.customer.gstin || ''} onChange={(e) => setNewInvoice(prev => ({...prev, customer: {...prev.customer, gstin: e.target.value}}))}/>
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                {newInvoice.isGst && (
                                    <div className="space-y-2">
                                    <Label htmlFor={`item-gst-${index}`}>GST (%)</Label>
                                    <Input id={`item-gst-${index}`} type="text" placeholder="18" value={item.gstRate} onChange={(e) => handleItemChange(item.id, 'gstRate', e.target.value)}/>
                                    </div>
                                )}
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
                            <Input id="labor-cost" type="number" placeholder="5000" value={newInvoice.laborCost || ''} onChange={(e) => setNewInvoice(prev => ({...prev, laborCost: parseFloat(e.target.value) || 0}))}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="discount">Discount (%)</Label>
                                <Input id="discount" type="number" placeholder="10" value={newInvoice.discount || ''} onChange={(e) => setNewInvoice(prev => ({...prev, discount: parseFloat(e.target.value) || 0}))} />
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
                    <Button onClick={handleCreateOrUpdateInvoice}>
                        <Send className="mr-2 h-4 w-4" />
                        {editingInvoiceId ? "Update Invoice" : "Create Invoice"}
                    </Button>
                </CardFooter>
            </Card>
        </TabsContent>
    </Tabs>

      <Dialog open={isPdfPreviewOpen} onOpenChange={setIsPdfPreviewOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              This is a preview of the invoice. Click "Open PDF" to generate and view the final document.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto border rounded-md">
            <div ref={pdfPreviewRef} className="bg-white">
              {selectedInvoice && companyInfo && <InvoicePDF invoice={selectedInvoice} companyInfo={companyInfo} />}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPdfPreviewOpen(false)}>
              Close
            </Button>
            <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf}>
              <FileText className="mr-2 h-4 w-4" />
              {isGeneratingPdf ? 'Generating...' : 'Open PDF'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
                    <Input id="payment-amount" type="number" value={newPayment.amount || ''} onChange={e => setNewPayment(p => ({...p, amount: parseFloat(e.target.value) || 0}))} />
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
        {isGeneratingPdf && selectedInvoice && companyInfo && (
            <div className="fixed -left-[9999px] top-0 opacity-0" aria-hidden>
                <div id={`pdf-invoice-${selectedInvoice.invoiceId}`} className="bg-white">
                    <InvoicePDF invoice={selectedInvoice} companyInfo={companyInfo} />
                </div>
            </div>
        )}
    </>
  );
}

    