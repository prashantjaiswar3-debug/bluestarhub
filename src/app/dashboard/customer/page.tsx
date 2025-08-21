
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
import { PlusCircle, Download, CreditCard } from "lucide-react";
import type { Complaint, Invoice } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const initialComplaints: Omit<Complaint, 'customer' | 'assignedTo'>[] = [
    { ticketId: "BLU-7238", issue: "CCTV Camera not recording", priority: "High", status: "Assigned", date: "2023-10-26" },
    { ticketId: "BLU-7211", issue: "Request for new installation", priority: "Low", status: "Resolved", date: "2023-10-15" },
    { ticketId: "BLU-7199", issue: "Annual Maintenance", priority: "Medium", status: "Closed", date: "2023-09-20" },
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
      date: new Date().toISOString().split('T')[0],
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
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.ticketId}>
                  <TableCell className="font-medium">{complaint.ticketId}</TableCell>
                  <TableCell>{complaint.issue}</TableCell>
                  <TableCell>{complaint.date}</TableCell>
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
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>₹{invoice.amount.toFixed(2)}</TableCell>
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
