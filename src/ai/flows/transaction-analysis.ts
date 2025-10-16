'use server';
/**
 * @fileOverview Analyzes transactions in real-time to detect fraudulent activities and calculate a risk score.
 *
 * - analyzeTransaction - A function that handles the transaction analysis process.
 * - TransactionAnalysisInput - The input type for the analyzeTransaction function.
 * - TransactionAnalysisOutput - The return type for the analyzeTransaction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionAnalysisInputSchema = z.object({
  transactionDetails: z.string().describe('The details of the transaction to be analyzed.'),
  historicalData: z.string().describe('Historical transaction data for the user.'),
});
export type TransactionAnalysisInput = z.infer<typeof TransactionAnalysisInputSchema>;

const PatternContributionSchema = z.object({
  pattern: z.string().describe('The pattern identified in the transaction data.'),
  contributesToFraud: z.boolean().describe('Whether this pattern contributes to fraud.'),
  explanation: z.string().describe('Explanation of why the pattern contributes to fraud.'),
});

const TransactionAnalysisOutputSchema = z.object({
  riskScore: z.number().describe('The risk score of the transaction, from 0 to 100.'),
  isFraudulent: z.boolean().describe('Whether the transaction is likely fraudulent.'),
  fraudExplanation: z.string().describe('Explanation of why the transaction is considered fraudulent.'),
});
export type TransactionAnalysisOutput = z.infer<typeof TransactionAnalysisOutputSchema>;

const decidePatternContribution = ai.defineTool({
  name: 'decidePatternContribution',
  description: 'Decides whether a given transaction pattern contributes to fraud.',
  inputSchema: z.object({
    pattern: z.string().describe('The transaction pattern to evaluate.'),
    transactionDetails: z.string().describe('The details of the transaction.'),
    historicalData: z.string().describe('Historical transaction data for the user.'),
  }),
  outputSchema: PatternContributionSchema,
  async resolve(input) {
    // In a real application, this would involve complex fraud detection logic,
    // potentially calling other services or models.
    const isFraudulent = input.pattern.includes('unusual');
    const explanation = isFraudulent
      ? `This transaction pattern (${input.pattern}) is considered unusual and is similar to known fraudulent activities.`
      : `This transaction pattern (${input.pattern}) appears to be normal and does not raise any flags.`;
    return {
      pattern: input.pattern,
      contributesToFraud: isFraudulent,
      explanation: explanation,
    };
  },
});

export async function analyzeTransaction(input: TransactionAnalysisInput): Promise<TransactionAnalysisOutput> {
  return analyzeTransactionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transactionAnalysisPrompt',
  input: {schema: TransactionAnalysisInputSchema},
  output: {schema: TransactionAnalysisOutputSchema},
  tools: [decidePatternContribution],
  prompt: `You are a fraud detection expert analyzing transactions for potential fraud.

  Analyze the following transaction details and historical data to determine the risk score and whether the transaction is fraudulent.
  Use the decidePatternContribution tool to evaluate specific transaction patterns.

  Transaction Details: {{{transactionDetails}}}
  Historical Data: {{{historicalData}}}
  `,
});

const analyzeTransactionFlow = ai.defineFlow(
  {
    name: 'analyzeTransactionFlow',
    inputSchema: TransactionAnalysisInputSchema,
    outputSchema: TransactionAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
