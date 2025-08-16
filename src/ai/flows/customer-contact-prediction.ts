'use server';

/**
 * @fileOverview AI flow to predict which customers should be contacted for routine work.
 *
 * - customerContactPrediction - Predicts which customers to contact.
 * - CustomerContactPredictionInput - Input type for the customerContactPrediction function.
 * - CustomerContactPredictionOutput - Return type for the customerContactPrediction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CustomerContactPredictionInputSchema = z.object({
  customerData: z.string().describe('JSON string containing customer data including contact information and job history for each customer.'),
  jobDetails: z.string().describe('JSON string containing general details about routine jobs, including typical service intervals.'),
});
export type CustomerContactPredictionInput = z.infer<typeof CustomerContactPredictionInputSchema>;

const CustomerContactPredictionOutputSchema = z.object({
  customersToContact: z.array(z.string()).describe('List of customer names who should be contacted for routine work.'),
  reasoning: z.string().describe('Explanation of why these customers were selected.'),
});
export type CustomerContactPredictionOutput = z.infer<typeof CustomerContactPredictionOutputSchema>;

export async function customerContactPrediction(input: CustomerContactPredictionInput): Promise<CustomerContactPredictionOutput> {
  return customerContactPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'customerContactPredictionPrompt',
  input: {schema: CustomerContactPredictionInputSchema},
  output: {schema: CustomerContactPredictionOutputSchema},
  prompt: `You are an AI assistant helping a tractor owner manage their business by predicting which customers need routine work.

Analyze the following customer data and job details to determine which customers should be contacted for routine work.

Customer Data: {{{customerData}}}
Job Details: {{{jobDetails}}}

Consider the last service date, typical service intervals, and any notes about the customer's needs or preferences.

Output a JSON object containing a list of customer names who should be contacted, and a brief explanation of your reasoning.
`,
});

const customerContactPredictionFlow = ai.defineFlow(
  {
    name: 'customerContactPredictionFlow',
    inputSchema: CustomerContactPredictionInputSchema,
    outputSchema: CustomerContactPredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
