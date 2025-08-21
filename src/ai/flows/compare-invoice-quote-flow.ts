
'use server';
/**
 * @fileOverview An AI agent that compares an invoice and a quotation and provides a summary of differences.
 *
 * - compareInvoiceAndQuote - A function that handles the comparison process.
 * - CompareInput - The input type for the compareInvoiceAndQuote function.
 */

import { ai } from '@/ai/genkit';
import type { Invoice, Quotation } from '@/lib/types';
import { z } from 'zod';

const QuotationItemSchema = z.object({
  id: z.string(),
  description: z.string(),
  quantity: z.number(),
  price: z.number(),
  gstRate: z.number(),
});

const CustomerSchema = z.object({
  name: z.string(),
  email: z.string(),
  address: z.string(),
});

const QuotationSchema = z.object({
  quoteId: z.string(),
  customer: CustomerSchema,
  items: z.array(QuotationItemSchema),
  laborCost: z.number(),
  discount: z.number(),
  totalAmount: z.number(),
  status: z.string(), // Draft | Sent | Approved | Rejected
  date: z.string(),
});

const InvoiceSchema = z.object({
  invoiceId: z.string(),
  customer: CustomerSchema,
  items: z.array(QuotationItemSchema),
  laborCost: z.number(),
  discount: z.number(),
  totalAmount: z.number(),
  status: z.string(), // Paid | Pending | Overdue
  date: z.string(),
  quoteId: z.string().optional(),
});

const CompareInputSchema = z.object({
  invoice: InvoiceSchema,
  quotation: QuotationSchema,
});
export type CompareInput = z.infer<typeof CompareInputSchema>;

export async function compareInvoiceAndQuote(input: CompareInput): Promise<string> {
  return compareInvoiceAndQuoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compareInvoiceAndQuotePrompt',
  input: { schema: CompareInputSchema },
  output: { schema: z.string() },
  prompt: `You are an expert accounting assistant for Bluestar Electronics. Your task is to compare an invoice with its original quotation and provide a concise summary of the differences.

Analyze the provided JSON objects for the invoice and the quotation. Pay close attention to any discrepancies in:
- Items (descriptions, quantities, prices, GST rates)
- Labor costs
- Discounts
- Total amounts

Present the differences in a clear, bulleted list. If there are no differences, state that the invoice matches the quotation perfectly. Start the summary with a brief introductory sentence.

Quotation Data:
\`\`\`json
{{{json stringify=quotation}}}
\`\`\`

Invoice Data:
\`\`\`json
{{{json stringify=invoice}}}
\`\`\`
`,
});

const compareInvoiceAndQuoteFlow = ai.defineFlow(
  {
    name: 'compareInvoiceAndQuoteFlow',
    inputSchema: CompareInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
