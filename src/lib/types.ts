

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
  name:string;
  skills: string[];
  load: number;
  location: string;
  type: 'Fixed' | 'Freelance';
  role?: 'Technician' | 'Supervisor' | 'Electrician';
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
  status: "Paid" | "Pending" | "Overdue" | "Partially Paid" | "Cancelled";
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

export type JobEnquiry = {
    id: string;
    title: string;
    description: string;
    location: string;
    proposedRate: number;
    status: 'Pending' | 'Accepted' | 'Rejected' | 'Bargaining';
    date: string;
    bargainRate?: number;
    assignedTo?: string;
};

export type InventoryCategory = 'Camera' | 'DVR/NVR' | 'Cable' | 'Accessory';

export type InventoryItem = {
    id: string;
    name: string;
    category: InventoryCategory;
    stock: number;
    price: number;
    supplier?: string;
    partNumber?: string;
};

export type PurchaseOrderItem = {
    itemId: string;
    name: string;
    quantity: number;
    price: number;
};

export type PurchaseOrder = {
    poId: string;
    supplier: string;
    items: PurchaseOrderItem[];
    total: number;
    status: 'Pending' | 'Completed' | 'Cancelled';
    date: string;
    receivedDate?: string;
};

export type Vendor = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: 'CCTV Supplier' | 'Cable Provider' | 'IT Hardware' | 'General Supplier' | 'Other';
  status: 'Active' | 'Inactive';
};

export type Expense = {
  id: string;
  technicianId: string;
  technicianName: string;
  date: string;
  category: 'Travel' | 'Food' | 'Materials' | 'Tools' | 'Other';
  amount: number;
  description: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  receiptUrl?: string;
};
    
