
"use client";

import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Download, CreditCard, Gift, Star, MessageSquare } from "lucide-react";
import type { Complaint, Invoice, Review } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import type jsPDF from 'jspdf';
import type html2canvas from 'html2canvas';

const initialComplaints: Omit<Complaint, 'customer' | 'assignedTo'>[] = [
    { ticketId: "BLU-7238", issue: "CCTV Camera not recording", priority: "High", status: "Assigned", date: "2023-10-26T10:30:00Z" },
    { ticketId: "BLU-7211", issue: "Request for new installation", priority: "Low", status: "Resolved", date: "2023-10-15T14:00:00Z" },
    { ticketId: "BLU-7199", issue: "Annual Maintenance", priority: "Medium", status: "Closed", date: "2023-09-20T09:00:00Z" },
];

const initialInvoices: Invoice[] = [
    { invoiceId: "INV-2023-0012", amount: 4500.00, status: "Paid", date: "2023-10-16" },
    { invoiceId: "INV-2023-0015", amount: 1500.00, status: "Pending", date: "2023-09-21" },
    { invoiceId: "INV-2023-0018", amount: 800.00, status: "Overdue", date: "2023-08-30" },
];

const initialReviews: Review[] = [
  { id: 'REV-001', customer: { name: 'Ravi Kumar', id: 'CUST-007' }, rating: 5, comment: 'Excellent and prompt service. The technician was very professional and resolved the issue in no time. Highly recommended!', date: '2023-10-28' },
  { id: 'REV-002', customer: { name: 'Priya Sharma', id: 'CUST-008' }, rating: 4, comment: 'Good service, but the technician arrived a bit later than scheduled. Overall, satisfied with the work.', date: '2023-10-27' },
];

const statusVariant: { [key in Complaint["status"]]: "default" | "secondary" | "outline" } = {
  Open: "default",
  Assigned: "default",
  "In Progress": "default",
  Resolved: "secondary",
  Closed: "outline",
};

const invoiceStatusVariant: { [key in Invoice["status"]]: "secondary" | "default" | "destructive" } = {
  Paid: "secondary",
  Pending: "default",
  Overdue: "destructive",
};

export default function CustomerDashboard() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState(initialComplaints);
  const [invoices, setInvoices] = useState(initialInvoices);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [isLodgeComplaintOpen, setIsLodgeComplaintOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState("");
  const [isLeaveReviewOpen, setIsLeaveReviewOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);


  const handleLodgeComplaint = () => {
    if (!newComplaint) {
      toast({
        variant: "destructive",
        title: "Empty Complaint",
        description: "Please describe your issue before submitting.",
      });
      return;
    }
    const newTicketId = `BLU-${Math.floor(Math.random() * 1000) + 7242}`;
    const newComplaintData: Omit<Complaint, 'customer' | 'assignedTo'> = {
      ticketId: newTicketId,
      issue: newComplaint,
      priority: 'Medium',
      status: 'Open',
      date: new Date().toISOString(),
    };
    setComplaints([newComplaintData, ...complaints]);
    setNewComplaint("");
    setIsLodgeComplaintOpen(false);
    toast({
      title: "Complaint Lodged",
      description: `Your ticket ID is ${newTicketId}. We will get back to you shortly.`,
    });
  };

  const handleLeaveReview = () => {
    if (newReview.rating === 0 || !newReview.comment) {
      toast({
        variant: "destructive",
        title: "Incomplete Review",
        description: "Please provide a rating and a comment.",
      });
      return;
    }
    const newReviewData: Review = {
      id: `REV-${Math.floor(Math.random() * 1000) + 3}`,
      customer: { name: 'Customer User', id: 'CUST-101' }, // Hardcoded for demo
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString(),
    }
    setReviews([newReviewData, ...reviews]);
    setNewReview({ rating: 0, comment: "" });
    setIsLeaveReviewOpen(false);
    toast({
      title: "Review Submitted",
      description: "Thank you for your valuable feedback!",
    });
  };
  
  const handleDownloadInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);

    await new Promise(resolve => setTimeout(resolve, 100));

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
            pdf.save(`invoice-${invoice.invoiceId}.pdf`);
            toast({
                title: "Download Started",
                description: `Your invoice ${invoice.invoiceId} is downloading.`,
            });
        } catch (error) {
            console.error("Error generating PDF:", error);
            toast({
                variant: "destructive",
                title: "Download Failed",
                description: "There was an error generating the PDF for your invoice.",
            });
        } finally {
             setSelectedInvoice(null);
        }
    }
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  }
  
  const formatSimpleDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Kolkata',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Portal</h1>
          <p className="text-muted-foreground">Here's an overview of your account.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsLeaveReviewOpen(true)}>
              <Star className="mr-2 h-4 w-4" />
              Leave a Review
            </Button>
            <Button onClick={() => setIsLodgeComplaintOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Lodge New Complaint
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-4 space-y-0">
            <div className="p-3 rounded-md bg-accent/20 text-accent-foreground">
                <Gift className="h-6 w-6" />
            </div>
            <div>
              <CardTitle>Exclusive Offers for You</CardTitle>
              <CardDescription>Check out our latest deals and promotions.</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                   <Card className="overflow-hidden">
                    <CardContent className="p-0">
                       <Image src="https://placehold.co/600x400.png" alt="Offer 1" width={600} height={400} className="w-full h-auto aspect-video object-cover" data-ai-hint="security camera offer" />
                       <div className="p-4">
                           <h3 className="font-semibold">Upgrade Your Security</h3>
                           <p className="text-sm text-muted-foreground">Get 20% off on all new smart camera installations. Limited time offer!</p>
                           <Button className="w-full mt-4" size="sm">Claim Offer</Button>
                       </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
                 <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                   <Card className="overflow-hidden">
                    <CardContent className="p-0">
                       <Image src="https://placehold.co/600x400.png" alt="Offer 2" width={600} height={400} className="w-full h-auto aspect-video object-cover" data-ai-hint="maintenance contract" />
                       <div className="p-4">
                           <h3 className="font-semibold">Peace of Mind Plan</h3>
                           <p className="text-sm text-muted-foreground">Sign up for our Annual Maintenance Contract and get the first month free.</p>
                           <Button className="w-full mt-4" size="sm">Learn More</Button>
                       </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                   <Card className="overflow-hidden">
                    <CardContent className="p-0">
                       <Image src="https://placehold.co/600x400.png" alt="Offer 3" width={600} height={400} className="w-full h-auto aspect-video object-cover" data-ai-hint="referral program" />
                       <div className="p-4">
                           <h3 className="font-semibold">Refer a Friend</h3>
                           <p className="text-sm text-muted-foreground">Refer a friend and you both get ₹500 off your next service. It's a win-win!</p>
                           <Button className="w-full mt-4" size="sm">Start Referring</Button>
                       </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious className="ml-12" />
              <CarouselNext className="mr-12" />
            </Carousel>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>What Our Customers Say</CardTitle>
            <CardDescription>Recent feedback from our valued clients.</CardDescription>
          </div>
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{review.customer.name}</h4>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 italic">"{review.comment}"</p>
                <p className="text-xs text-muted-foreground text-right mt-2">{formatSimpleDate(review.date)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Complaints</CardTitle>
          <CardDescription>Track the status of your service requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Issue</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.ticketId}>
                  <TableCell className="font-medium">{complaint.ticketId}</TableCell>
                  <TableCell>{complaint.issue}</TableCell>
                  <TableCell>{formatDate(complaint.date)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={statusVariant[complaint.status]}>
                      {complaint.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoices & Payments</CardTitle>
          <CardDescription>View and pay your invoices online.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoiceId}>
                  <TableCell className="font-medium">{invoice.invoiceId}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</TableCell>
                  <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={invoiceStatusVariant[invoice.status]}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice)}>
                            <Download className="mr-2 h-3 w-3" />
                            Download PDF
                        </Button>
                        {invoice.status !== "Paid" && (
                            <Button size="sm">
                                <CreditCard className="mr-2 h-3 w-3" />
                                Pay Now
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

      {/* Hidden Invoice for PDF Generation */}
      {selectedInvoice && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div ref={invoiceRef} style={{ width: '800px', padding: '40px', backgroundColor: 'white', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#2563EB" d="M100 0L122.45 69.098H195.11L136.33 111.803L158.78 180.902L100 138.197L41.22 180.902L63.67 111.803L4.89 69.098H77.55L100 0Z" />
                   </svg>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563EB' }}>Bluestar Electronics</h1>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>INVOICE</h2>
                <p style={{ color: '#555' }}>Invoice #: {selectedInvoice.invoiceId}</p>
                <p style={{ color: '#555' }}>Date: {formatSimpleDate(selectedInvoice.date)}</p>
              </div>
            </div>
            <div style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#30475E' }}>Bill To:</h3>
              <p style={{ color: '#555' }}>Customer User</p>
            </div>
            <table style={{ width: '100%', marginTop: '30px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F0F0F0' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Description</th>
                  <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Service Charges for {selectedInvoice.invoiceId}</td>
                  <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>{formatCurrency(selectedInvoice.amount)}</td>
                </tr>
              </tbody>
            </table>
            <div style={{ marginTop: '30px', textAlign: 'right' }}>
              <div style={{ display: 'inline-block', width: '250px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
                  <span style={{ fontWeight: 'bold' }}>Total:</span>
                  <span>{formatCurrency(selectedInvoice.amount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '2px solid #30475E', marginTop: '10px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>AMOUNT DUE</span>
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{formatCurrency(selectedInvoice.amount)}</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '12px', color: '#888' }}>
              <p>Thank you for your business!</p>
              <p>bluestar.elec@gmail.com | +91 9766661333</p>
              <p style={{marginTop: '10px', fontWeight: 'bold'}}>Created on Bluestar Hub</p>
            </div>
          </div>
        </div>
      )}


      <Dialog open={isLodgeComplaintOpen} onOpenChange={setIsLodgeComplaintOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lodge a New Complaint</DialogTitle>
            <DialogDescription>
              Please describe your issue in detail. Our team will get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="issue" className="text-right">
                Issue
              </Label>
              <Textarea
                id="issue"
                value={newComplaint}
                onChange={(e) => setNewComplaint(e.target.value)}
                className="col-span-3"
                placeholder="e.g., My camera is not recording..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleLodgeComplaint}>Submit Complaint</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isLeaveReviewOpen} onOpenChange={setIsLeaveReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              We value your feedback. Please rate your experience and leave a comment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Rating</Label>
              <div className="col-span-3 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="icon"
                    onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                    className="rounded-full"
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        i < newReview.rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </Button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="comment" className="text-right">
                Comment
              </Label>
              <Textarea
                id="comment"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="col-span-3"
                placeholder="Tell us about your experience..."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleLeaveReview}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    