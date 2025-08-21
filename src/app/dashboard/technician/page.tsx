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
import { MapPin, Phone, FilePlus } from "lucide-react";
import type { Job } from "@/lib/types";

const jobs: Job[] = [
  { id: "JOB-001", customer: "John Doe", address: "123 Main St, Anytown", issue: "CCTV Camera not recording, needs urgent check.", priority: "High" },
  { id: "JOB-002", customer: "Jane Smith", address: "456 Oak Ave, Otherville", issue: "DVR signal loss on 2 channels. Customer available after 2 PM.", priority: "Medium" },
  { id: "JOB-003", customer: "Sam Wilson", address: "789 Pine Ln, Sometown", issue: "Check connectivity for camera 4 and 5.", priority: "Low" },
];

const priorityVariant: { [key in Job["priority"]]: "destructive" | "secondary" | "default" } = {
    High: "destructive",
    Medium: "secondary",
    Low: "default",
};

export default function TechnicianDashboard() {
  return (
    <div className="flex flex-col gap-6">
       <div>
          <h1 className="text-2xl font-bold">Today's Jobs</h1>
          <p className="text-muted-foreground">Here are your assignments for the day.</p>
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
              <Button variant="outline">
                <Phone className="mr-2 h-4 w-4" />
                Call
              </Button>
               <Button>
                <FilePlus className="mr-2 h-4 w-4" />
                Update / Report
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
