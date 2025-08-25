

import type { Quotation, InventoryItem, PurchaseOrder } from './types';

export const initialQuotations: Quotation[] = [
  {
    quoteId: "QT-2023-051",
    customer: { name: "ABC Corporation", contactPerson: "Ms. Priya", email: "contact@abc.com", phone: "555-0102", address: "123 Business Rd, Corp Town" },
    items: [{ id: "item-1", description: "4x Hikvision 5MP Dome Cameras", quantity: 1, unit: "nos", price: 18000, gstRate: 18, serialNumbers: [] }],
    laborCost: 5000,
    discount: 10,
    totalAmount: 24780,
    status: "Sent",
    date: "2023-10-25",
    poNumber: "PO-ABC-101",
  },
  {
    quoteId: "QT-2023-050",
    customer: { name: "Green Valley Apartments", contactPerson: "Mr. Sharma", email: "manager@gva.com", phone: "555-0101", address: "456 Park Ave, Residence City" },
    items: [
      { id: "item-1", description: "16-Channel NVR System", quantity: 1, unit: "nos", price: 80000, gstRate: 18, serialNumbers: [] },
      { id: "item-2", description: "12x Bullet Cameras", quantity: 1, unit: "nos", price: 40000, gstRate: 18, serialNumbers: [] }
    ],
    laborCost: 20000,
    discount: 5,
    totalAmount: 157528,
    status: "Approved",
    date: "2023-10-22",
    poNumber: "PO-GVA-203",
  },
];

export const initialInventory: InventoryItem[] = [
    { id: 'CAM-001', name: 'Hikvision 5MP Dome Camera', category: 'Camera', stock: 25, price: 4500, supplier: 'SecureTech Distributors', partNumber: 'DS-2CE76H0T-ITPF' },
    { id: 'CAM-002', name: 'CP Plus 2.4MP Bullet Camera', category: 'Camera', stock: 40, price: 2200, supplier: 'Vision Systems Inc.', partNumber: 'CP-UNC-TA21L3' },
    { id: 'NVR-001', name: 'Dahua 16-Channel NVR', category: 'DVR/NVR', stock: 10, price: 25000, supplier: 'SecureTech Distributors', partNumber: 'NVR5216-4KS2' },
    { id: 'CBL-001', name: 'D-Link Cat-6 Ethernet Cable (305m)', category: 'Cable', stock: 5, price: 8500, supplier: 'Cables & More', partNumber: 'NCB-C6UGRYR-305' },
    { id: 'ACC-001', name: '12V 10A Power Supply', category: 'Accessory', stock: 50, price: 1200, supplier: 'Vision Systems Inc.', partNumber: 'VS-PS-1210' },
    { id: 'ACC-002', name: 'Waterproof Junction Box', category: 'Accessory', stock: 100, price: 250, supplier: 'Cables & More', partNumber: 'JB-WP-01' },
];

export const initialPurchaseOrders: PurchaseOrder[] = [
    {
        poId: 'PO-2023-001',
        supplier: 'SecureTech Distributors',
        items: [
            { itemId: 'CAM-001', name: 'Hikvision 5MP Dome Camera', quantity: 10, price: 4200 },
            { itemId: 'NVR-001', name: 'Dahua 16-Channel NVR', quantity: 5, price: 24500 },
        ],
        total: 164500,
        status: 'Completed',
        date: '2023-10-15',
        receivedDate: '2023-10-20'
    },
    {
        poId: 'PO-2023-002',
        supplier: 'Vision Systems Inc.',
        items: [
            { itemId: 'CAM-002', name: 'CP Plus 2.4MP Bullet Camera', quantity: 20, price: 2100 },
            { itemId: 'ACC-001', name: '12V 10A Power Supply', quantity: 30, price: 1100 },
        ],
        total: 75000,
        status: 'Pending',
        date: '2023-10-28',
    }
]
    