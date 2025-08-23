
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, FilePlus, ThumbsUp, ThumbsDown, Handshake } from "lucide-react";
import type { Job, JobEnquiry } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const jobs: Job[] = [
  { id: "JOB-001", customer: "John Doe", address: "123 Main St, Anytown", issue: "CCTV Camera not recording, needs urgent check.", priority: "High", phone: "555-0101" },
  { id: "JOB-002", customer: "Jane Smith", address: "456 Oak Ave, Otherville", issue: "DVR signal loss on 2 channels. Customer available after 2 PM.", priority: "Medium", phone: "555-0102" },
  { id: "JOB-003", customer: "Sam Wilson", address: "789 Pine Ln, Sometown", issue: "Check connectivity for camera 4 and 5.", priority: "Low", phone: "555-0103" },
];

const initialEnquiries: JobEnquiry[] = [
    { id: "ENQ-001", title: "Urgent Wiring Fix", description: "Need an electrician to fix faulty wiring in the main office.", location: "North Zone", proposedRate: 1500, status: "Pending", date: "2023-11-01" },
    { id: "ENQ-002", title: "New AC Installation", description: "Install a new 1.5 ton split AC unit.", location: "South Zone", proposedRate: 2500, status: "Pending", date: "2023-11-01" },
    { id: "ENQ-004", title: "Office Renovation Wiring", description: "Complete electrical wiring for a new office space.", location: "West Zone", proposedRate: 8000, status: "Pending", date: "2023-11-02" },
];

const priorityVariant: { [key in Job["priority"]]: "destructive" | "secondary" | "default" } = {
    High: "destructive",
    Medium: "secondary",
    Low: "default",
};

export default function TechnicianDashboard() {
  const { toast } = useToast();
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [reportText, setReportText] = React.useState("");
  const [enquiries, setEnquiries] = React.useState<JobEnquiry[]>(initialEnquiries);
  const [isBargainOpen, setIsBargainOpen] = React.useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = React.useState<JobEnquiry | null>(null);
  const [bargainAmount, setBargainAmount] = React.useState("");

  const handleCall = (phone: string) => {
    toast({
      title: "Calling Customer",
      description: `Initiating call to ${phone}...`,
    });
  };

  const handleUpdateClick = (job: Job) => {
    setSelectedJob(job);
  };

  const handleReportSubmit = () => {
    if (!reportText) {
        toast({
            variant: "destructive",
            title: "Empty Report",
            description: "Please enter your update before submitting.",
        });
        return;
    }
    toast({
      title: "Report Submitted",
      description: `Update for Job ID: ${selectedJob?.id} submitted. A feedback link has been sent to the customer.`,
    });
    setReportText("");
    setSelectedJob(null);
  };

  const handleDialogClose = () => {
    setSelectedJob(null);
    setReportText("");
  };

  const handleEnquiryAction = (enquiryId: string, action: 'accept' | 'reject' | 'bargain') => {
      const enquiry = enquiries.find(e => e.id === enquiryId);
      if (!enquiry) return;

      if (action === 'bargain') {
          setSelectedEnquiry(enquiry);
          setBargainAmount(enquiry.proposedRate.toString());
          setIsBargainOpen(true);
          return;
      }
      
      setEnquiries(prev => prev.filter(e => e.id !== enquiryId));
      toast({
          title: `Job Enquiry ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
          description: `You have ${action} the job: "${enquiry.title}".`,
      });
  }
  
  const handleBargainSubmit = () => {
    if (!selectedEnquiry || !bargainAmount) return;

    setEnquiries(prev => prev.filter(e => e.id !== selectedEnquiry.id));
    toast({
        title: "Counter-Offer Submitted",
        description: `Your offer of ${formatCurrency(parseFloat(bargainAmount))} for "${selectedEnquiry.title}" has been sent.`,
    });

    setSelectedEnquiry(null);
    setBargainAmount("");
    setIsBargainOpen(false);
  }
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Today's Jobs</h1>
        <p className="text-muted-foreground">Here are your regular assignments for the day.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <Card key={job.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle>{job.customer}</CardTitle>
                <Badge variant={priorityVariant[job.priority]}>{job.priority}</Badge>
              </div>
              <CardDescription className="flex items-center gap-2 pt-1">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{job.address}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm text-foreground">{job.issue}</p>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => handleCall(job.phone)}>
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
               <Button onClick={() => handleUpdateClick(job)}>
                <FilePlus className="mr-2 h-4 w-4" />
                Update / Report
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="pt-4">
        <h1 className="text-2xl font-bold">Job Enquiries</h1>
        <p className="text-muted-foreground">Available jobs for freelance technicians.</p>
      </div>
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enquiries.map((enquiry) => (
          <Card key={enquiry.id} className="flex flex-col">
            <CardHeader>
                <CardTitle>{enquiry.title}</CardTitle>
                 <CardDescription className="flex items-center gap-2 pt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{enquiry.location}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <p className="text-sm text-foreground">{enquiry.description}</p>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Proposed Rate</p>
                <p className="text-lg font-bold">{formatCurrency(enquiry.proposedRate)}</p>
              </div>
            </CardContent>
            <CardFooter className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => handleEnquiryAction(enquiry.id, 'accept')}>
                    <ThumbsUp className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Accept</span>
                </Button>
                <Button variant="outline" className="border-destructive text-destructive hover:bg-red-50 hover:text-destructive" onClick={() => handleEnquiryAction(enquiry.id, 'reject')}>
                    <ThumbsDown className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Reject</span>
                </Button>
                <Button onClick={() => handleEnquiryAction(enquiry.id, 'bargain')}>
                    <Handshake className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Bargain</span>
                </Button>
            </CardFooter>
          </Card>
        ))}
      </div>


       <Dialog open={!!selectedJob} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Job: {selectedJob?.id}</DialogTitle>
            <DialogDescription>
              Add your service report or notes for the job assigned to <span className="font-semibold">{selectedJob?.customer}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="report" className="text-right">
                Report
              </Label>
              <Textarea
                id="report"
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Replaced faulty cable for Camera 2. System now online."
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleReportSubmit}>Submit Report</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <Dialog open={isBargainOpen} onOpenChange={setIsBargainOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Propose a Counter-Offer</DialogTitle>
            <DialogDescription>
              The proposed rate for "{selectedEnquiry?.title}" is <span className="font-semibold">{formatCurrency(selectedEnquiry?.proposedRate || 0)}</span>. If you'd like to bargain, enter your rate below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="bargain-amount">Your Rate (₹)</Label>
                <Input
                    id="bargain-amount"
                    type="number"
                    value={bargainAmount}
                    onChange={(e) => setBargainAmount(e.target.value)}
                    placeholder="e.g., 1800"
                />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" onClick={() => setIsBargainOpen(false)}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleBargainSubmit}>Submit Offer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
