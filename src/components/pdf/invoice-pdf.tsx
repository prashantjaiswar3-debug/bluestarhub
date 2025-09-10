
"use client";

import React, { useEffect, useState } from 'react';
import type { Invoice, CompanyInfo } from '@/lib/types';
import Image from 'next/image';

interface InvoicePDFProps {
  invoice: Invoice;
  companyInfo: CompanyInfo;
}

async function toBase64(url: string): Promise<string> {
    const response = await fetch(url, { cache: 'no-store' });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, companyInfo }) => {
    const [logoBase64, setLogoBase64] = useState<string | null>(null);
    const [qrBase64, setQrBase64] = useState<string | null>(null);

    useEffect(() => {
        if (companyInfo.logo) {
            toBase64(companyInfo.logo).then(setLogoBase64).catch(console.error);
        }
        if (companyInfo.bank?.qrCode) {
            toBase64(companyInfo.bank.qrCode).then(setQrBase64).catch(console.error);
        }
    }, [companyInfo]);

    const calculateTotals = (inv: Invoice) => {
        const itemsTotal = inv.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
        const subTotal = itemsTotal + inv.laborCost;
        const discountAmount = subTotal * (inv.discount / 100);
        const totalAfterDiscount = subTotal - discountAmount;
        
        const gstOnItems = inv.isGst ? inv.items.reduce((sum, item) => {
            const itemTotal = item.quantity * item.price;
            const itemTotalAfterDiscount = itemTotal * (1 - (inv.discount / 100)); // Distribute discount proportionally
            return sum + (itemTotalAfterDiscount * (item.gstRate / 100));
        }, 0) : 0;
        
        // Assuming labor is a service with its own GST rate, for simplicity let's assume 18% if GST is enabled
        const gstOnLabor = inv.isGst ? inv.laborCost * (1 - (inv.discount / 100)) * 0.18 : 0;
        
        const totalGst = gstOnItems + gstOnLabor;
        const grandTotal = totalAfterDiscount + totalGst;
        const amountPaid = inv.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
        const amountDue = grandTotal - amountPaid;

        return { itemsTotal, subTotal, discountAmount, totalGst, grandTotal, amountPaid, amountDue };
    };

    const { subTotal, discountAmount, totalGst, grandTotal, amountDue } = calculateTotals(invoice);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(amount);
    };

    const numberToWords = (num: number): string => {
        const a = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const numStr = num.toString();
        if (num < 0) return `minus ${numberToWords(Math.abs(num))}`;
        if (num === 0) return 'zero';
        let result = '';
        const [integerPart, decimalPart] = numStr.split('.');
        
        const convert = (n: string): string => {
            if (n.length > 7) return convert(n.slice(0, -7)) + ' crore ' + convert(n.slice(-7));
            if (n.length > 5) return convert(n.slice(0, -5)) + ' lakh ' + convert(n.slice(-5));
            if (n.length > 3) return convert(n.slice(0, -3)) + ' thousand ' + convert(n.slice(-3));
            if (n.length > 2) return convert(n.slice(0, -2)) + ' hundred ' + convert(n.slice(-2));
            const num = parseInt(n, 10);
            if (num < 20) return a[num];
            return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : '');
        };
        
        result = convert(integerPart);
        if (decimalPart) {
            result += ' and ' + convert(decimalPart.padEnd(2, '0')) + ' paise';
        }

        return result.replace(/\s+/g, ' ').trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="w-[210mm] h-[297mm] bg-white text-gray-800 p-8 font-sans text-sm flex flex-col">
            <header className="flex justify-between items-start pb-4 border-b-2 border-gray-800">
                <div className="w-2/3">
                    {logoBase64 && <Image src={logoBase64} alt="Company Logo" width={180} height={70} className="mb-4" />}
                    <h1 className="text-2xl font-bold uppercase">{companyInfo.name}</h1>
                    <p>{companyInfo.email} | {companyInfo.phone}</p>
                    {companyInfo.gstin && <p className="font-bold">GSTIN: {companyInfo.gstin}</p>}
                </div>
                <div className="w-1/3 text-right">
                    <h2 className="text-3xl font-bold uppercase text-gray-500">{invoice.isGst ? 'Tax Invoice' : 'Bill of Supply'}</h2>
                    <p className="mt-2"><strong>Invoice #:</strong> {invoice.invoiceId}</p>
                    <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString('en-GB')}</p>
                </div>
            </header>

            <section className="flex justify-between mt-6">
                <div>
                    <h3 className="font-bold uppercase mb-2">Bill To:</h3>
                    <p className="font-bold">{invoice.customer.name}</p>
                    <p>{invoice.customer.address}</p>
                    <p>{invoice.customer.email}</p>
                    {invoice.customer.gstin && <p><strong>GSTIN:</strong> {invoice.customer.gstin}</p>}
                </div>
            </section>

            <section className="mt-8 flex-grow">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-800 text-white">
                            <th className="p-2 w-10">#</th>
                            <th className="p-2 w-1/2">Item Description</th>
                            <th className="p-2 text-right">Qty</th>
                            <th className="p-2 text-right">Rate</th>
                            {invoice.isGst && <th className="p-2 text-right">GST%</th>}
                            <th className="p-2 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={item.id} className="border-b">
                                <td className="p-2">{index + 1}</td>
                                <td className="p-2">{item.description}</td>
                                <td className="p-2 text-right">{item.quantity} {item.unit}</td>
                                <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                                {invoice.isGst && <td className="p-2 text-right">{item.gstRate}%</td>}
                                <td className="p-2 text-right">{formatCurrency(item.quantity * item.price)}</td>
                            </tr>
                        ))}
                         {invoice.laborCost > 0 && (
                             <tr className="border-b">
                                <td className="p-2">{invoice.items.length + 1}</td>
                                <td className="p-2">Labor / Service Charges</td>
                                <td className="p-2 text-right">1</td>
                                <td className="p-2 text-right">{formatCurrency(invoice.laborCost)}</td>
                                {invoice.isGst && <td className="p-2 text-right">18%</td>}
                                <td className="p-2 text-right">{formatCurrency(invoice.laborCost)}</td>
                             </tr>
                         )}
                    </tbody>
                </table>
            </section>

            <section className="mt-6 flex justify-between">
                <div className="w-1/2 pt-4">
                    <p className="font-bold">Amount in Words:</p>
                    <p className="capitalize">{numberToWords(grandTotal)} Only</p>
                </div>
                <div className="w-2/5">
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="py-1">Subtotal:</td>
                                <td className="py-1 text-right">{formatCurrency(subTotal)}</td>
                            </tr>
                             {invoice.discount > 0 && (
                                <tr>
                                    <td className="py-1">Discount ({invoice.discount}%):</td>
                                    <td className="py-1 text-right text-green-600">-{formatCurrency(discountAmount)}</td>
                                </tr>
                            )}
                            {invoice.isGst && (
                                <tr>
                                    <td className="py-1">Total GST:</td>
                                    <td className="py-1 text-right">{formatCurrency(totalGst)}</td>
                                </tr>
                            )}
                            <tr className="font-bold text-lg border-t-2 border-b-2 border-gray-800 my-2">
                                <td className="py-2">Grand Total:</td>
                                <td className="py-2 text-right">{formatCurrency(grandTotal)}</td>
                            </tr>
                             <tr>
                                <td className="py-1">Amount Paid:</td>
                                <td className="py-1 text-right">{formatCurrency(calculateTotals(invoice).amountPaid)}</td>
                            </tr>
                             <tr className="font-bold">
                                <td className="py-1">Amount Due:</td>
                                <td className="py-1 text-right">{formatCurrency(amountDue)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            <footer className="text-xs mt-auto pt-4">
                <div className="flex justify-between items-end border-t pt-4">
                    {companyInfo.bank && (
                        <div className="w-2/3">
                            <h4 className="font-bold uppercase mb-2">Payment Details:</h4>
                            <p><strong>Bank:</strong> {companyInfo.bank.bankName}</p>
                            <p><strong>Account Name:</strong> {companyInfo.bank.accountHolder}</p>
                            <p><strong>Account Number:</strong> {companyInfo.bank.accountNumber}</p>
                            <p><strong>IFSC Code:</strong> {companyInfo.bank.ifscCode}</p>
                        </div>
                    )}
                    {qrBase64 && (
                         <div className="w-1/3 text-right">
                             <p className="font-bold mb-1">Scan to Pay</p>
                             <Image src={qrBase64} alt="Payment QR Code" width={80} height={80} />
                         </div>
                    )}
                </div>
                <div className="text-center mt-4 border-t pt-2">
                    <p>Thank you for your business!</p>
                </div>
            </footer>
        </div>
    );
};
