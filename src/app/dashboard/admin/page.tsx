
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
import type { Complaint, Technician } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

const initialComplaints: Complaint[] = [
  { ticketId: "BLU-7238", customer: { name: "John Doe", id: "CUST-001" }, issue: "CCTV Camera not recording", priority: "High", status: "Open", date: "2023-10-26" },
  { ticketId: "BLU-7239", customer: { name: "Jane Smith", id: "CUST-002" }, issue: "DVR signal loss on 2 channels", priority: "Medium", status: "Open", date: "2023-10-26" },
  { ticketId: "BLU-7240", customer: { name: "Bob Johnson", id: "CUST-003" }, issue: "Request for new installation quote", priority: "Low", status: "Open", date: "2023-10-25" },
  { ticketId: "BLU-7241", customer: { name: "Alice Williams", id: "CUST-004" }, issue: "Annual Maintenance Checkup", priority: "Medium", status: "Open", date: "2023-10-25" },
];

const initialTechnicians: Technician[] = [
  { id: "TECH-01", name: "Raj Patel", skills: ["Installation", "Repair"], load: 2, location: "North Zone" },
  { id: "TECH-02", name: "Amit Singh", skills: ["Repair", "Networking"], load: 1, location: "South Zone" },
  { id: "TECH-03", name: "Suresh Kumar", skills: ["Maintenance", "Installation"], load: 4, location: "North Zone" },
];

const priorityVariant: { [key in Complaint["priority"]]: "destructive" | "secondary" | "default" } = {
  High: "destructive",
  Medium: "secondary",
  Low: "default",
};

export default function AdminDashboard() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [technicians, setTechnicians] = useState<Technician[]>(initialTechnicians);
  const [selectedTechnicians, setSelectedTechnicians] = useState<{ [key: string]: string }>({});

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

  const openComplaints = complaints.filter(c => c.status === 'Open');
  const assignedComplaints = complaints.filter(c => c.status === 'Assigned');
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      timeZone: 'Asia/Kolkata',
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-3 flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Open Complaints</CardTitle>
            <CardDescription>
              Assign new complaints to available technicians.
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
                    <TableCell>{complaint.customer.name}</TableCell>
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
                            <SelectValue placeholder="Select Technician" />
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
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedComplaints.length > 0 ? assignedComplaints.map((complaint) => (
                  <TableRow key={complaint.ticketId}>
                    <TableCell className="font-medium">{complaint.ticketId}</TableCell>
                    <TableCell>{complaint.customer.name}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{complaint.issue}</TableCell>
                    <TableCell>{technicians.find(t => t.id === complaint.assignedTo)?.name}</TableCell>
                  </TableRow>
                )) : (
                   <TableRow>
                    <TableCell colSpan={4} className="text-center">No complaints assigned yet.</TableCell>
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
    </div>
  );
}
