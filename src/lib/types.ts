export type Complaint = {
  ticketId: string;
  customer: {
    name: string;
    id: string;
  };
  issue: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "Assigned" | "In Progress" | "Resolved" | "Closed";
  date: string;
  assignedTo?: string;
};

export type Technician = {
  id: string;
  name: string;
  skills: string[];
  load: number;
  location: string;
};

export type Invoice = {
  invoiceId: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  date: string;
};

export type Quotation = {
  quoteId: string;
  customer: string;
  amount: number;
  status: "Draft" | "Sent" | "Approved" | "Rejected";
  date: string;
};

export type Job = {
  id: string;
  customer: string;
  address: string;
  issue: string;
  priority: "High" | "Medium" | "Low";
};
