
import type { Quotation, InventoryItem, PurchaseOrder } from './types';

export const initialQuotations: Quotation[] = [
  {
    quoteId: "QT-2023-001",
    customer: { name: "Green Valley Apartments", contactPerson: "Mr. Sharma", email: "manager@gva.com", phone: "9876543210", address: "456 Park Ave, Residence City", gstin: "27AAAAA0000A1Z5" },
    items: [
      { id: "item-1", description: "16-Channel NVR System", quantity: 1, unit: "nos", price: 80000, gstRate: 18, serialNumbers: [] },
      { id: "item-2", description: "12x Bullet Cameras 8MP", quantity: 1, unit: "nos", price: 40000, gstRate: 18, serialNumbers: [] }
    ],
    laborCost: 20000,
    discount: 5,
    totalAmount: 157528,
    status: "Approved",
    date: "2023-10-22",
    poNumber: "PO-GVA-203",
  },
  {
    quoteId: "QT-2023-002",
    customer: { name: "ABC Corporation", contactPerson: "Ms. Priya", email: "priya@abccorp.com", phone: "9876543211", address: "123 Business Rd, Corp Town", gstin: "29BBBBB1111B2Z6" },
    items: [{ id: "item-1", description: "4x Hikvision 5MP Dome Cameras", quantity: 1, unit: "nos", price: 18000, gstRate: 18, serialNumbers: [] }],
    laborCost: 5000,
    discount: 10,
    totalAmount: 24780,
    status: "Sent",
    date: "2023-10-25",
    poNumber: "PO-ABC-101",
  },
  {
    quoteId: "QT-2023-003",
    customer: { name: "ShopLocal Retail", contactPerson: "Mr. Kumar", email: "kumar@shoplocal.com", phone: "9876543213", address: "10 Bayside Rd, Commerce City", gstin: "24CCCCC2222C3Z7" },
    items: [
        { id: 'item-3', description: '8-Channel DVR', quantity: 1, unit: 'nos', price: 12000, gstRate: 18, serialNumbers: [] },
        { id: 'item-4', description: '4x CP Plus 2.4MP Bullet Cameras', quantity: 1, unit: 'nos', price: 8800, gstRate: 18, serialNumbers: [] },
    ],
    laborCost: 6000,
    discount: 0,
    totalAmount: 31624,
    status: "Draft",
    date: "2023-11-05"
  },
];

export const initialInventory: InventoryItem[] = [
    { id: 'CAM-001', name: 'Hikvision 5MP Dome Camera', category: 'Camera', stock: 25, price: 4500, supplier: 'SecureTech Distributors', partNumber: 'DS-2CE76H0T-ITPF' },
    { id: 'CAM-002', name: 'CP Plus 2.4MP Bullet Camera', category: 'Camera', stock: 40, price: 2200, supplier: 'Vision Systems Inc.', partNumber: 'CP-UNC-TA21L3' },
    { id: 'CAM-003', name: 'Dahua 8MP Bullet Camera', category: 'Camera', stock: 15, price: 6800, supplier: 'SecureTech Distributors', partNumber: 'DH-IPC-HFW2831S-S-S2' },
    { id: 'DVR-001', name: 'Hikvision 8-Channel DVR', category: 'DVR/NVR', stock: 20, price: 12500, supplier: 'SecureTech Distributors', partNumber: 'iDS-7208HQHI-M1/S' },
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
