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

export type QuotationItem = {
  id: string;
  description: string;
  quantity: number;
  price: number;
};

export type Quotation = {
  quoteId: string;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  items: QuotationItem[];
  laborCost: number;
  discount: number; // Percentage
  gst: number; // Percentage
  totalAmount: number;
  status: "Draft" | "Sent" | "Approved" | "Rejected";
  date: string;
};

export type Job = {
  id: string;
  customer: string;
  address: string;
  issue: string;
  priority: "High" | "Medium" | "Low";
  phone: string;
};

export type Review = {
  id: string;
  customer: {
    name: string;
    id: string;
  };
  rating: number; // 1 to 5
  comment: string;
  date: string;
};
