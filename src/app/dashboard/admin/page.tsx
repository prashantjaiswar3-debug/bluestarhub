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

const complaints: Complaint[] = [
  { ticketId: "BLU-7238", customer: { name: "John Doe", id: "CUST-001" }, issue: "CCTV Camera not recording", priority: "High", status: "Open", date: "2023-10-26" },
  { ticketId: "BLU-7239", customer: { name: "Jane Smith", id: "CUST-002" }, issue: "DVR signal loss on 2 channels", priority: "Medium", status: "Open", date: "2023-10-26" },
  { ticketId: "BLU-7240", customer: { name: "Bob Johnson", id: "CUST-003" }, issue: "Request for new installation quote", priority: "Low", status: "Open", date: "2023-10-25" },
   { ticketId: "BLU-7241", customer: { name: "Alice Williams", id: "CUST-004" }, issue: "Annual Maintenance Checkup", priority: "Medium", status: "Open", date: "2023-10-25" },
];

const technicians: Technician[] = [
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
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
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
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Assign</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.ticketId}>
                  <TableCell className="font-medium">{complaint.ticketId}</TableCell>
                  <TableCell>{complaint.customer.name}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{complaint.issue}</TableCell>
                  <TableCell>
                    <Badge variant={priorityVariant[complaint.priority]}>
                      {complaint.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right w-[200px]">
                    <div className="flex items-center gap-2 justify-end">
                      <Select>
                        <SelectTrigger id={`assign-${complaint.ticketId}`} aria-label="Select technician">
                          <SelectValue placeholder="Select Technician" />
                        </SelectTrigger>
                        <SelectContent>
                          {technicians.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="sm">Assign</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
