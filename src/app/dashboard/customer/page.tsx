
"use client";

import { useState } from "react";
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
import { PlusCircle, Download, CreditCard, Gift } from "lucide-react";
import type { Complaint, Invoice } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";

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
  const [isLodgeComplaintOpen, setIsLodgeComplaintOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState("");

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
  
  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
        title: "Downloading Invoice",
        description: `Your invoice ${invoiceId} will be downloaded shortly.`,
    })
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
        <Button onClick={() => setIsLodgeComplaintOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Lodge New Complaint
        </Button>
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
                        <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(invoice.invoiceId)}>
                            <Download className="mr-2 h-3 w-3" />
                            Download
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
    </div>
  );
}

    