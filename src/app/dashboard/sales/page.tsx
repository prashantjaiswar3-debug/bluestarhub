
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Complaint, Technician, Review, JobEnquiry } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Star, PlusCircle, Check, X } from "lucide-react";

const initialComplaints: Complaint[] = [
  { ticketId: "BLU-7238", customer: { name: "John Doe", id: "CUST-001" }, issue: "CCTV Camera not recording", priority: "High", status: "Open", date: "2023-10-26" },
  { ticketId: "BLU-7239", customer: { name: "Jane Smith", id: "CUST-002" }, issue: "DVR signal loss on 2 channels", priority: "Medium", status: "Assigned", date: "2023-10-26", assignedTo: 'TECH-01' },
  { ticketId: "BLU-7240", customer: { name: "Bob Johnson", id: "CUST-003" }, issue: "Request for new installation quote", priority: "Low", status: "Open", date: "2023-10-25" },
  { ticketId: "BLU-7241", customer: { name: "Alice Williams", id: "CUST-004" }, issue: "Annual Maintenance Checkup", priority: "Medium", status: "Open", date: "2023-10-25" },
];

const initialTechnicians: Technician[] = [
    { id: "TECH-01", name: "Raj Patel", skills: ["Installation", "Repair"], load: 2, location: "North Zone" },
    { id: "TECH-02", name: "Amit Singh", skills: ["Repair", "Networking"], load: 1, location: "South Zone" },
    { id: "TECH-03", name: "Suresh Kumar", skills: ["Maintenance", "Installation"], load: 4, location: "North Zone" },
    { id: "TECH-04", name: "Prashant Jaiswar", skills: ["Installation", "Networking"], load: 0, location: "West Zone" },
    { id: "TECH-05", name: "Krishna Sharma", skills: ["Repair", "Maintenance"], load: 0, location: "East Zone" },
];

const initialReviews: Review[] = [
  { id: 'REV-001', customer: { name: 'Ravi Kumar', id: 'CUST-007' }, rating: 5, comment: 'Excellent and prompt service. The technician was very professional and resolved the issue in no time. Highly recommended!', date: '2023-10-28' },
  { id: 'REV-002', customer: { name: 'Priya Sharma', id: 'CUST-008' }, rating: 4, comment: 'Good service, but the technician arrived a bit later than scheduled. Overall, satisfied with the work.', date: '2023-10-27' },
];

const initialEnquiries: JobEnquiry[] = [
    { id: "ENQ-001", title: "Urgent Wiring Fix", description: "Need an electrician to fix faulty wiring in the main office.", location: "North Zone", proposedRate: 1500, status: "Pending", date: "2023-11-01" },
    { id: "ENQ-002", title: "New AC Installation", description: "Install a new 1.5 ton split AC unit.", location: "South Zone", proposedRate: 2500, status: "Bargaining", date: "2023-11-01", bargainRate: 2800, assignedTo: "TECH-FREELANCE-01" },
    { id: "ENQ-003", title: "Weekend Shift Cover", description: "Cover a weekend shift for CCTV monitoring.", location: "Any", proposedRate: 3000, status: "Accepted", date: "2023-10-30", assignedTo: "TECH-FREELANCE-02" },
]

const priorityVariant: { [key in Complaint["priority"]]: "destructive" | "secondary" | "default" } = {
  High: "destructive",
  Medium: "secondary",
  Low: "default",
};

const enquiryStatusVariant: { [key in JobEnquiry["status"]]: "default" | "secondary" | "outline" | "destructive" } = {
  Pending: "outline",
  Accepted: "secondary",
  Bargaining: "default",
  Rejected: "destructive",
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [selectedTechnicians, setSelectedTechnicians] = useState<{ [key: string]: string }>({});
  const [enquiries, setEnquiries] = useState<JobEnquiry[]>(initialEnquiries);
  const [isCreateEnquiryOpen, setIsCreateEnquiryOpen] = useState(false);
  const [newEnquiry, setNewEnquiry] = useState({ title: "", description: "", location: "", proposedRate: "" });

  const handleAssign = (ticketId: string) => {
    const techId = selectedTechnicians[ticketId];
    if (!techId) {
      toast({
        variant: "destructive",
        title: "No Technician Selected",
        description: "Please select a technician to assign the complaint.",
      });
      return;
    }

    setComplaints(prev => prev.map(c => 
      c.ticketId === ticketId ? { ...c, status: 'Assigned', assignedTo: techId } : c
    ));

    setTechnicians(prev => prev.map(t =>
      t.id === techId ? { ...t, load: t.load + 1 } : t
    ));

    toast({
      title: "Complaint Assigned",
      description: `Ticket ${ticketId} has been assigned to ${technicians.find(t=>t.id === techId)?.name}.`,
    });
  };

  const handleTechnicianSelect = (ticketId: string, techId: string) => {
    setSelectedTechnicians(prev => ({ ...prev, [ticketId]: techId }));
  };

  const handleCreateEnquiry = () => {
    if (!newEnquiry.title || !newEnquiry.description || !newEnquiry.location || !newEnquiry.proposedRate) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please fill out all fields to create an enquiry.",
        });
        return;
    }
    const enquiryData: JobEnquiry = {
        id: `ENQ-${Math.floor(Math.random() * 100) + 4}`,
        ...newEnquiry,
        proposedRate: parseFloat(newEnquiry.proposedRate),
        status: "Pending",
        date: new Date().toISOString(),
    };
    setEnquiries([enquiryData, ...enquiries]);
    setIsCreateEnquiryOpen(false);
    setNewEnquiry({ title: "", description: "", location: "", proposedRate: "" });
    toast({
        title: "Enquiry Created",
        description: `The job enquiry "${enquiryData.title}" has been created.`,
    });
  }
  
  const handleBargainAction = (enquiryId: string, action: 'accept' | 'reject') => {
      setEnquiries(prev => prev.map(e => {
          if (e.id === enquiryId) {
              if (action === 'accept') {
                  return { ...e, status: 'Accepted', proposedRate: e.bargainRate! };
              }
              return { ...e, status: 'Rejected' };
          }
          return e;
      }));
      toast({
          title: `Bargain ${action === 'accept' ? 'Accepted' : 'Rejected'}`,
          description: `The counter-offer for enquiry ${enquiryId} has been ${action === 'accept' ? 'accepted' : 'rejected'}.`,
      });
  }
  
  const assignedComplaints = complaints.filter(c => c.status === 'Assigned');
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
  }

  const openComplaints = complaints.filter(c => c.status === 'Open');

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-3 flex flex-col gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Job Enquiries for Freelancers</CardTitle>
                <CardDescription>Create and manage job enquiries for daily-wage staff.</CardDescription>
            </div>
            <Button onClick={() => setIsCreateEnquiryOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Enquiry
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {enquiries.map(enquiry => (
                        <TableRow key={enquiry.id}>
                            <TableCell className="font-medium">{enquiry.title}</TableCell>
                            <TableCell>
                                {enquiry.status === 'Bargaining' ? (
                                    <div className="flex items-center gap-2">
                                        <span className="line-through text-muted-foreground">{formatCurrency(enquiry.proposedRate)}</span>
                                        <span className="font-semibold">{formatCurrency(enquiry.bargainRate!)}</span>
                                    </div>
                                ) : (
                                    formatCurrency(enquiry.proposedRate)
                                )}
                            </TableCell>
                            <TableCell>
                                <Badge variant={enquiryStatusVariant[enquiry.status]}>{enquiry.status}</Badge>
                            </TableCell>
                            <TableCell>{enquiry.assignedTo || 'N/A'}</TableCell>
                            <TableCell className="text-right">
                                {enquiry.status === 'Bargaining' && (
                                    <div className="flex gap-2 justify-end">
                                        <Button size="icon" variant="outline" className="h-8 w-8 bg-green-100 text-green-700 hover:bg-green-200" onClick={() => handleBargainAction(enquiry.id, 'accept')}>
                                            <Check className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="outline" className="h-8 w-8 bg-red-100 text-red-700 hover:bg-red-200" onClick={() => handleBargainAction(enquiry.id, 'reject')}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Open Complaints</CardTitle>
            <CardDescription>
              New service and installation requests. Assign them to a technician.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Assign</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {openComplaints.length > 0 ? openComplaints.map((complaint) => (
                  <TableRow key={complaint.ticketId}>
                    <TableCell className="font-medium">{complaint.ticketId}</TableCell>
                    <TableCell>{complaint.customer?.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{complaint.issue}</TableCell>
                    <TableCell>{formatDate(complaint.date)}</TableCell>
                    <TableCell>
                      <Badge variant={priorityVariant[complaint.priority]}>
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right w-[200px]">
                      <div className="flex items-center gap-2 justify-end">
                        <Select onValueChange={(techId) => handleTechnicianSelect(complaint.ticketId, techId)}>
                          <SelectTrigger id={`assign-${complaint.ticketId}`} aria-label="Select technician">
                            <SelectValue placeholder="Select Tech" />
                          </SelectTrigger>
                          <SelectContent>
                            {technicians.map((tech) => (
                              <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={() => handleAssign(complaint.ticketId)}>Assign</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No open complaints.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Complaints</CardTitle>
            <CardDescription>
              Overview of complaints that are currently assigned.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Issue</TableHead>
                   <TableHead>Priority</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Assign</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedComplaints.length > 0 ? assignedComplaints.map((complaint) => (
                  <TableRow key={complaint.ticketId}>
                    <TableCell className="font-medium">{complaint.ticketId}</TableCell>
                    <TableCell>{complaint.customer?.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{complaint.issue}</TableCell>
                    <TableCell>
                      <Badge variant={priorityVariant[complaint.priority]}>
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{technicians.find(t => t.id === complaint.assignedTo)?.name}</TableCell>
                     <TableCell className="text-right w-[200px]">
                      <div className="flex items-center gap-2 justify-end">
                        <Select onValueChange={(techId) => handleTechnicianSelect(complaint.ticketId, techId)}>
                          <SelectTrigger id={`assign-${complaint.ticketId}`} aria-label="Select technician">
                            <SelectValue placeholder="Re-assign" />
                          </SelectTrigger>
                          <SelectContent>
                            {technicians.map((tech) => (
                              <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" onClick={() => handleAssign(complaint.ticketId)}>Assign</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                   <TableRow>
                    <TableCell colSpan={6} className="text-center">No complaints assigned yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Reviews</CardTitle>
            <CardDescription>
              Feedback submitted by customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length > 0 ? reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.customer.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        ))}
                        {[...Array(5 - review.rating)].map((_, i) => (
                           <Star key={i} className="h-4 w-4 text-muted-foreground" />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{review.comment}</TableCell>
                    <TableCell>{formatDate(review.date)}</TableCell>
                  </TableRow>
                )) : (
                   <TableRow>
                    <TableCell colSpan={4} className="text-center">No reviews submitted yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Available Technicians</CardTitle>
           <CardDescription>
            Overview of technician workload and status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Load</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technicians.map((tech) => (
                <TableRow key={tech.id}>
                  <TableCell>
                    <div className="font-medium">{tech.name}</div>
                    <div className="text-sm text-muted-foreground">{tech.skills.join(", ")}</div>
                  </TableCell>
                  <TableCell className="text-right">{tech.load}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       <Dialog open={isCreateEnquiryOpen} onOpenChange={setIsCreateEnquiryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Job Enquiry</DialogTitle>
            <DialogDescription>
              Post a job for freelance technicians. It will be visible to all non-regular staff.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="space-y-2">
                <Label htmlFor="enquiry-title">Job Title</Label>
                <Input id="enquiry-title" value={newEnquiry.title} onChange={(e) => setNewEnquiry({...newEnquiry, title: e.target.value})} placeholder="e.g., Urgent Wiring Fix" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="enquiry-desc">Description</Label>
                <Textarea id="enquiry-desc" value={newEnquiry.description} onChange={(e) => setNewEnquiry({...newEnquiry, description: e.target.value})} placeholder="e.g., Need an electrician for..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="enquiry-location">Location</Label>
                    <Input id="enquiry-location" value={newEnquiry.location} onChange={(e) => setNewEnquiry({...newEnquiry, location: e.target.value})} placeholder="e.g., North Zone" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="enquiry-rate">Proposed Rate (₹)</Label>
                    <Input id="enquiry-rate" type="number" value={newEnquiry.proposedRate} onChange={(e) => setNewEnquiry({...newEnquiry, proposedRate: e.target.value})} placeholder="e.g., 1500" />
                </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateEnquiry}>Create Enquiry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
