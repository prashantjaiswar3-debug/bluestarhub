
import type { Vendor } from './types';

export const initialVendors: Vendor[] = [
    {
        id: 'VEND-001',
        name: 'SecureTech Distributors',
        contactPerson: 'Mr. Anil Sharma',
        email: 'anil.sharma@securetech.com',
        phone: '9820098200',
        address: '101, Omega Business Park, Lower Parel, Mumbai',
        category: 'CCTV Supplier',
        status: 'Active'
    },
    {
        id: 'VEND-002',
        name: 'Vision Systems Inc.',
        contactPerson: 'Ms. Sunita Rao',
        email: 'sunita.rao@visionsys.co.in',
        phone: '9988776655',
        address: '23, Lamington Road, Grant Road, Mumbai',
        category: 'CCTV Supplier',
        status: 'Active'
    },
    {
        id: 'VEND-003',
        name: 'Cables & More',
        contactPerson: 'Mr. Rajesh Verma',
        email: 'sales@cablesandmore.com',
        phone: '9123456789',
        address: 'Shop No. 5, Silver Market, Masjid Bunder, Mumbai',
        category: 'Cable Provider',
        status: 'Active'
    },
    {
        id: 'VEND-004',
        name: 'IT Solutions Hub',
        contactPerson: 'Priya Singh',
        email: 'priya@itsolutions.com',
        phone: '9876543210',
        address: '4th Floor, IT Park, Andheri East, Mumbai',
        category: 'IT Hardware',
        status: 'Inactive'
    },
];
