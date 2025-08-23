
export type Complaint = {
  ticketId: string;
  customer?: {
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

export type Customer = {
  id: string;
  name: string; // If company, this is company name. If individual, this is person's name.
  contactPerson?: string;
  email: string;
  phone: string;
  address: string;
  isCompany?: boolean;
  companyName?: string;
};

export type QuotationItem = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  gstRate: number; // Percentage
  serialNumbers?: string[];
};

export type Payment = {
  id: string;
  amount: number;
  date: string;
  method: 'Cash' | 'Card' | 'Online' | 'Other';
};

export type Invoice = {
  invoiceId: string;
  customer: {
    name: string;
    email: string;
    address: string;
    contactPerson?: string;
  };
  items: QuotationItem[];
  laborCost: number;
  discount: number; // Percentage
  totalAmount: number;
  status: "Paid" | "Pending" | "Overdue" | "Partially Paid";
  date: string;
  quoteId?: string; // Optional link to a quotation
  poNumber?: string;
  payments?: Payment[];
};


export type Quotation = {
  quoteId: string;
  customer: {
    name: string;
    email: string;
    address: string;
    contactPerson?: string;
    phone?: string;
  };
  items: QuotationItem[];
  laborCost: number;
  discount: number; // Percentage
  totalAmount: number;
  status: "Draft" | "Sent" | "Approved" | "Rejected";
  date: string;
  poNumber?: string;
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


    
