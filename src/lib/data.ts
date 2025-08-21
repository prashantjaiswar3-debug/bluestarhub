
import type { Quotation } from './types';

export const initialQuotations: Quotation[] = [
  {
    quoteId: "QT-2023-051",
    customer: { name: "ABC Corporation", contactPerson: "Ms. Priya", email: "contact@abc.com", address: "123 Business Rd, Corp Town" },
    items: [{ id: "item-1", description: "4x Hikvision 5MP Dome Cameras", quantity: 1, price: 18000, gstRate: 18 }],
    laborCost: 5000,
    discount: 10,
    totalAmount: 24780,
    status: "Sent",
    date: "2023-10-25",
    poNumber: "PO-ABC-101",
  },
  {
    quoteId: "QT-2023-050",
    customer: { name: "Green Valley Apartments", contactPerson: "Mr. Sharma", email: "manager@gva.com", address: "456 Park Ave, Residence City" },
    items: [
      { id: "item-1", description: "16-Channel NVR System", quantity: 1, price: 80000, gstRate: 18 },
      { id: "item-2", description: "12x Bullet Cameras", quantity: 1, price: 40000, gstRate: 18 }
    ],
    laborCost: 20000,
    discount: 5,
    totalAmount: 157528,
    status: "Approved",
    date: "2023-10-22",
    poNumber: "PO-GVA-203",
  },
];

    
