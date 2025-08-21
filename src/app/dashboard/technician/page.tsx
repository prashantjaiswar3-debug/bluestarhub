
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
import { MapPin, Phone, FilePlus, UserPlus } from "lucide-react";
import type { Job } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const jobs: Job[] = [
  { id: "JOB-001", customer: "John Doe", address: "123 Main St, Anytown", issue: "CCTV Camera not recording, needs urgent check.", priority: "High", phone: "555-0101" },
  { id: "JOB-002", customer: "Jane Smith", address: "456 Oak Ave, Otherville", issue: "DVR signal loss on 2 channels. Customer available after 2 PM.", priority: "Medium", phone: "555-0102" },
  { id: "JOB-003", customer: "Sam Wilson", address: "789 Pine Ln, Sometown", issue: "Check connectivity for camera 4 and 5.", priority: "Low", phone: "555-0103" },
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
  const [isRegisterCustomerOpen, setIsRegisterCustomerOpen] = React.useState(false);
  const [newCustomer, setNewCustomer] = React.useState({ name: "", email: "", phone: "", address: "" });

  const handleCall = (phone: string) => {
    toast({
      title: "Calling Customer",
      description: `Initiating call to ${phone}...`,
    });
    // In a real app, you'd integrate with a calling service.
    // window.location.href = `tel:${phone}`;
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
      description: `Update for Job ID: ${selectedJob?.id} has been submitted.`,
    });
    setReportText("");
    setSelectedJob(null);
  };

  const handleDialogClose = () => {
    setSelectedJob(null);
    setReportText("");
  };
  
  const handleRegisterCustomer = () => {
    if(!newCustomer.name || !newCustomer.email || !newCustomer.phone || !newCustomer.address) {
         toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields to register a new customer.",
        });
        return;
    }
    const generatedPassword = Math.random().toString(36).slice(-8);
    toast({
      title: "Customer Registered",
      description: `Customer ${newCustomer.name} created. Email: ${newCustomer.email}, Password: ${generatedPassword}`,
      duration: 9000,
    });
    setIsRegisterCustomerOpen(false);
    setNewCustomer({ name: "", email: "", phone: "", address: "" });
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Today's Jobs</h1>
            <p className="text-muted-foreground">Here are your assignments for the day.</p>
          </div>
          <Button onClick={() => setIsRegisterCustomerOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Register Customer
          </Button>
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
                <span>{job.address}</span>
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
      
      <Dialog open={isRegisterCustomerOpen} onOpenChange={setIsRegisterCustomerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register New Customer</DialogTitle>
            <DialogDescription>
              Enter the customer's details below to create a new account and generate login credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} placeholder="e.g., John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} placeholder="e.g., john.doe@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} placeholder="e.g., 9876543210" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={newCustomer.address} onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})} placeholder="e.g., 123 Main St, Anytown" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleRegisterCustomer}>Register & Generate Credentials</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
