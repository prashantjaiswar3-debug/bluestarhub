
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
import type { Complaint, Technician, Review, JobEnquiry, Expense } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { Star, PlusCircle, Check, X, ThumbsDown, ThumbsUp } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const initialComplaints: Complaint[] = [
  { ticketId: "BLU-7238", customer: { name: "Anjali Mehta", id: "CUST-101" }, issue: "CCTV Camera not recording", priority: "High", status: "Open", date: "2023-10-26" },
  { ticketId: "BLU-7239", customer: { name: "Green Valley Apartments", id: "CUST-001" }, issue: "DVR signal loss on 2 channels", priority: "Medium", status: "Assigned", date: "2023-10-26", assignedTo: 'TECH-003' },
  { ticketId: "BLU-7240", customer: { name: "ABC Corporation", id: "CUST-002" }, issue: "Request for new installation quote", priority: "Low", status: "Open", date: "2023-10-25" },
  { ticketId: "BLU-7241", customer: { name: "ShopLocal Retail", id: "CUST-004" }, issue: "Annual Maintenance Checkup", priority: "Medium", status: "Open", date: "2023-10-25" },
];

const initialTechnicians: Technician[] = [
    { id: "TECH-001", name: "Raj Patel", skills: ["Installation", "Repair", "Networking"], load: 2, location: "Mumbai", type: "Fixed", role: "Supervisor" },
    { id: "TECH-002", name: "Amit Singh", skills: ["Repair", "Networking"], load: 1, location: "Mumbai", type: "Fixed", role: "Technician" },
    { id: "TECH-003", name: "Suresh Kumar", skills: ["Maintenance", "Installation"], load: 4, location: "Mumbai", type: "Fixed", role: "Technician" },
    { id: "TECH-004", name: "Prashant Jaiswar", skills: ["Installation", "Networking"], load: 0, location: "Mumbai", type: "Fixed", role: "Technician" },
    { id: "TECH-F01", name: "Ravi Kumar", skills: ["Wiring", "Electrical"], load: 0, location: "Any", type: "Freelance", role: "Electrician" },
];

const initialReviews: Review[] = [
  { id: 'REV-001', customer: { name: 'Sanjay Gupta', id: 'CUST-007' }, rating: 5, comment: 'Excellent and prompt service. The technician was very professional and resolved the issue in no time. Highly recommended!', date: '2023-10-28' },
  { id: 'REV-002', customer: { name: 'Priya Sharma', id: 'CUST-008' }, rating: 4, comment: 'Good service, but the technician arrived a bit later than scheduled. Overall, satisfied with the work.', date: '2023-10-27' },
];

const initialEnquiries: JobEnquiry[] = [
    { id: "ENQ-001", title: "Urgent Wiring Fix", description: "Need an electrician to fix faulty wiring in the main office.", location: "North Zone", proposedRate: 1500, status: "Pending", date: "2023-11-01" },
    { id: "ENQ-002", title: "New AC Installation", description: "Install a new 1.5 ton split AC unit.", location: "South Zone", proposedRate: 2500, status: "Bargaining", date: "2023-11-01", bargainRate: 2800, assignedTo: "TECH-F01" },
    { id: "ENQ-003", title: "Weekend Shift Cover", description: "Cover a weekend shift for CCTV monitoring.", location: "Any", proposedRate: 3000, status: "Accepted", date: "2023-10-30", assignedTo: "TECH-F02" },
]

const initialExpenses: Expense[] = [
    { id: 'EXP-001', technicianId: 'TECH-001', technicianName: 'Raj Patel', date: '2023-10-28', category: 'Travel', amount: 350, description: 'Travel to client site in South Zone', status: 'Pending' },
    { id: 'EXP-002', technicianId: 'TECH-002', technicianName: 'Amit Singh', date: '2023-10-27', category: 'Food', amount: 200, description: 'Lunch during full-day installation', status: 'Approved' },
    { id: 'EXP-003', technicianId: 'TECH-003', technicianName: 'Suresh Kumar', date: '2023-10-29', category: 'Materials', amount: 1200, description: 'Purchase of extra cables for urgent repair', status: 'Pending' },
    { id: 'EXP-004', technicianId: 'TECH-001', technicianName: 'Raj Patel', date: '2023-10-29', category: 'Other', amount: 150, description: 'Stationery and printouts for site report', status: 'Rejected' },
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

const expenseStatusVariant: { [key in Expense["status"]]: "default" | "secondary" | "destructive" } = {
  Pending: "default",
  Approved: "secondary",
  Rejected: "destructive",
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);
  const [reviews] = useState<Review[]>(initialReviews);
  const [selectedTechnicians, setSelectedTechnicians] = useState<{ [key: string]: string }>({});
  const [enquiries, setEnquiries] = useState<JobEnquiry[]>(initialEnquiries);
  const [isCreateEnquiryOpen, setIsCreateEnquiryOpen] = useState(false);
  const [newEnquiry, setNewEnquiry] = useState({ title: "", description: "", location: "", proposedRate: "" });
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [expenseReport, setExpenseReport] = useState<{ from: string, to: string }>({ from: '', to: '' });

  const fixedTechnicians = technicians.filter(t => t.type === 'Fixed');

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

   const handleExpenseAction = (expenseId: string, action: 'approve' | 'reject') => {
    setExpenses(prev => prev.map(e => {
        if (e.id === expenseId) {
            return { ...e, status: action === 'approve' ? 'Approved' : 'Rejected' };
        }
        return e;
    }));
    toast({
        title: `Expense ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The expense claim has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
    });
  };
  
  const assignedComplaints = complaints.filter(c => c.status === 'Assigned');
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata'
    });
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
  }

  const openComplaints = complaints.filter(c => c.status === 'Open');
  const pendingExpenses = expenses.filter(e => e.status === 'Pending');

  const filteredExpensesForReport = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const fromDate = expenseReport.from ? new Date(expenseReport.from) : null;
    const toDate = expenseReport.to ? new Date(expenseReport.to) : null;
    
    if (fromDate && isNaN(fromDate.getTime())) return false;
    if (toDate && isNaN(toDate.getTime())) return false;

    if (fromDate && expenseDate < fromDate) return false;
    if (toDate && expenseDate > toDate) return false;
    
    return true;
  });

  return (
    <div className="grid gap-6 lg:grid-cols-1">
      <div className="lg:col-span-1 flex flex-col gap-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
                <CardTitle>Job Enquiries for Freelancers</CardTitle>
                <CardDescription>Create and manage job enquiries for daily-wage staff.</CardDescription>
            </div>
            <Button onClick={() => setIsCreateEnquiryOpen(true)} className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Enquiry
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table className="min-w-[600px] whitespace-nowrap">
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
            </ScrollArea>
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
            <ScrollArea className="w-full">
              <Table className="min-w-[600px] whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Issue</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead className="text-right">Assign</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openComplaints.length > 0 ? openComplaints.map((complaint) => (
                    <TableRow key={complaint.ticketId}>
                      <TableCell className="font-medium">{complaint.ticketId}</TableCell>
                      <TableCell>{complaint.customer?.name}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate">{complaint.issue}</TableCell>
                      <TableCell>
                        <Badge variant={priorityVariant[complaint.priority]}>
                          {complaint.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-end">
                          <Select onValueChange={(techId) => handleTechnicianSelect(complaint.ticketId, techId)}>
                            <SelectTrigger id={`assign-${complaint.ticketId}`} aria-label="Select technician" className="min-w-[150px]">
                              <SelectValue placeholder="Select Tech" />
                            </SelectTrigger>
                            <SelectContent>
                              {fixedTechnicians.map((tech) => (
                                <SelectItem key={tech.id} value={tech.id}>{tech.name} {tech.role === 'Supervisor' && '(Supervisor)'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => handleAssign(complaint.ticketId)}>Assign</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">No open complaints.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
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
             <ScrollArea className="w-full">
              <Table className="min-w-[600px] whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Issue</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Re-assign</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignedComplaints.length > 0 ? assignedComplaints.map((complaint) => (
                    <TableRow key={complaint.ticketId}>
                      <TableCell className="font-medium">{complaint.ticketId}</TableCell>
                      <TableCell>{complaint.customer?.name}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate">{complaint.issue}</TableCell>
                      <TableCell>{technicians.find(t => t.id === complaint.assignedTo)?.name}</TableCell>
                       <TableCell className="text-right">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-end">
                          <Select onValueChange={(techId) => handleTechnicianSelect(complaint.ticketId, techId)}>
                            <SelectTrigger id={`assign-${complaint.ticketId}`} aria-label="Select technician" className="min-w-[150px]">
                              <SelectValue placeholder="Re-assign" />
                            </SelectTrigger>
                            <SelectContent>
                              {fixedTechnicians.map((tech) => (
                                <SelectItem key={tech.id} value={tech.id}>{tech.name} {tech.role === 'Supervisor' && '(Supervisor)'}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={() => handleAssign(complaint.ticketId)}>Assign</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">No complaints assigned yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Approval</CardTitle>
            <CardDescription>
              Review and approve or reject expense claims from technicians.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <ScrollArea className="w-full">
              <Table className="min-w-[600px] whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead>Technician</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead className="hidden lg:table-cell">Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingExpenses.length > 0 ? pendingExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.technicianName}</TableCell>
                      <TableCell className="hidden sm:table-cell">{formatDate(expense.date)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell className="hidden lg:table-cell max-w-xs truncate">{expense.description}</TableCell>
                      <TableCell className="text-right">
                         <div className="flex gap-2 justify-end">
                            <Button size="icon" variant="outline" className="h-8 w-8 bg-green-100 text-green-700 hover:bg-green-200" onClick={() => handleExpenseAction(expense.id, 'approve')}>
                                <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-8 w-8 bg-red-100 text-red-700 hover:bg-red-200" onClick={() => handleExpenseAction(expense.id, 'reject')}>
                                <ThumbsDown className="h-4 w-4" />
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">No pending expenses to review.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Report</CardTitle>
            <CardDescription>
              Filter and view all expenses within a specific date range.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="grid gap-2 flex-1">
                <Label htmlFor="from-date">From</Label>
                <Input id="from-date" type="date" value={expenseReport.from} onChange={(e) => setExpenseReport(prev => ({...prev, from: e.target.value}))}/>
              </div>
              <div className="grid gap-2 flex-1">
                <Label htmlFor="to-date">To</Label>
                <Input id="to-date" type="date" value={expenseReport.to} onChange={(e) => setExpenseReport(prev => ({...prev, to: e.target.value}))}/>
              </div>
            </div>
            <ScrollArea className="w-full">
              <Table className="min-w-[600px] whitespace-nowrap">
                  <TableHeader>
                      <TableRow>
                          <TableHead>Technician</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="hidden sm:table-cell">Category</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredExpensesForReport.length > 0 ? filteredExpensesForReport.map((expense) => (
                          <TableRow key={expense.id}>
                              <TableCell>{expense.technicianName}</TableCell>
                              <TableCell>{formatDate(expense.date)}</TableCell>
                              <TableCell className="hidden sm:table-cell"><Badge variant="outline">{expense.category}</Badge></TableCell>
                              <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                              <TableCell className="text-right">
                                  <Badge variant={expenseStatusVariant[expense.status]}>{expense.status}</Badge>
                              </TableCell>
                          </TableRow>
                      )) : (
                          <TableRow>
                              <TableCell colSpan={5} className="text-center h-24">
                                  No expenses found for the selected period.
                              </TableCell>
                          </TableRow>
                      )}
                  </TableBody>
              </Table>
            </ScrollArea>
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
            <ScrollArea className="w-full">
              <Table className="min-w-[600px] whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="hidden sm:table-cell">Comment</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
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
                      <TableCell className="hidden sm:table-cell max-w-xs truncate">{review.comment}</TableCell>
                      <TableCell className="hidden md:table-cell">{formatDate(review.date)}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">No reviews submitted yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      
        <Card>
          <CardHeader>
            <CardTitle>Available Technicians</CardTitle>
            <CardDescription>
              Overview of technician workload and status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table className="min-w-[400px] whitespace-nowrap">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Load</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {technicians.map((tech) => (
                    <TableRow key={tech.id}>
                      <TableCell>
                        <div className="font-medium">{tech.name}</div>
                        <div className="text-sm text-muted-foreground hidden sm:block">{tech.skills.join(", ")}</div>
                      </TableCell>
                      <TableCell><Badge variant={tech.type === 'Fixed' ? 'default' : 'secondary'}>{tech.type}</Badge></TableCell>
                      <TableCell>
                        {tech.type === 'Fixed' ? (
                            <Badge variant={tech.role === 'Supervisor' ? 'destructive' : 'outline'}>{tech.role}</Badge>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">{tech.load}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
