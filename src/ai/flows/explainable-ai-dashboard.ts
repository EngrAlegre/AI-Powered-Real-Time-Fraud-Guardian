'use server';
/**
 * @fileOverview A flow for generating explanations for AI-flagged transactions, including risk factors,
 * confidence levels, and alternative scenarios, leveraging Huawei Pangu Models and OBS datasets.
 *
 * - generateExplainableAIData - A function that orchestrates the data retrieval and AI explanation generation.
 * - ExplainableAIInput - The input type for the generateExplainableAIData function.
 * - ExplainableAIOutput - The return type for the generateExplainableAIData function, containing the explanation data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {panguModelsService, isHuaweiServicesEnabled} from '@/lib/huawei';

// Define schemas for input and output
const ExplainableAIInputSchema = z.object({
  transactionId: z.string().describe('The ID of the transaction to explain.'),
});
export type ExplainableAIInput = z.infer<typeof ExplainableAIInputSchema>;

const RiskFactorSchema = z.object({
  factor: z.string().describe('The name of the risk factor.'),
  impact: z.number().describe('The impact of the risk factor on the overall risk score (0-1).'),
  description: z.string().describe('A detailed description of the risk factor.'),
  evidence: z.string().describe('Evidence supporting the risk factor.'),
});

const DecisionPathSchema = z.object({
  pangModelAnalysis: z.string().describe('Analysis from the Pangu model regarding the transaction.'),
  confidenceLevel: z.number().describe('The confidence level of the AI in its decision (0-1).'),
  alternativeScenarios: z.array(z.string()).optional().describe('Alternative scenarios considered by the AI.'),
});

const ExplainableAIOutputSchema = z.object({
  riskScore: z.number().describe('The overall risk score of the transaction (0-100).'),
  explanation: z.object({
    primaryRiskFactors: z.array(RiskFactorSchema).describe('The primary factors contributing to the risk score.'),
    decisionPath: DecisionPathSchema.describe('The decision-making path of the AI.'),
    summary: z.string().describe('A concise summary of the AI explanation.'),
  }).describe('Explanation of why the transaction was flagged.'),
});
export type ExplainableAIOutput = z.infer<typeof ExplainableAIOutputSchema>;

// Define the main function that calls the flow
export async function generateExplainableAIData(input: ExplainableAIInput): Promise<ExplainableAIOutput> {
  return explainableAIFlow(input);
}

// Define the prompt for generating the AI explanation
const explainableAIPrompt = ai.definePrompt({
  name: 'explainableAIPrompt',
  input: {schema: ExplainableAIInputSchema},
  output: {schema: ExplainableAIOutputSchema},
  prompt: `You are an AI expert explaining why a transaction was flagged as potentially fraudulent.

  Provide a risk score (0-100) and explain the primary risk factors, the AI's decision-making path, and a summary.

  Transaction ID: {{{transactionId}}}

  Format your response as a JSON object conforming to the ExplainableAIOutputSchema.  The Zod schema descriptions are:

  RiskFactorSchema: {{json schema=RiskFactorSchema}}
  DecisionPathSchema: {{json schema=DecisionPathSchema}}
  ExplainableAIOutputSchema: {{json schema=ExplainableAIOutputSchema}}`,
});

// Define the Genkit flow with Huawei Pangu Models integration
const explainableAIFlow = ai.defineFlow(
  {
    name: 'explainableAIFlow',
    inputSchema: ExplainableAIInputSchema,
    outputSchema: ExplainableAIOutputSchema,
  },
  async input => {
    // Try Huawei Pangu Models first for advanced AI reasoning
    if (isHuaweiServicesEnabled()) {
      try {
        // Mock transaction data for demo - in production, fetch from database
        const mockTransactionData = {
          transactionId: input.transactionId,
          amount: parseFloat(input.transactionId.slice(-4)) || 850,
          merchantType: 'Online Gaming',
          location: 'Singapore',
          timestamp: new Date().toISOString(),
          userId: 'user-' + input.transactionId.slice(0, 8),
          paymentMethod: 'credit-card',
          historicalData: {
            avgTransactionAmount: 120,
            transactionCount: 45,
            unusualPatterns: ['velocity-spike', 'new-merchant-category'],
          },
        };
        
        // Call Huawei Pangu Models for fraud analysis
        const panguResult = await panguModelsService.analyzeFraudTransaction(mockTransactionData);
        
        // Convert Pangu result to our output format
        return {
          riskScore: panguResult.riskScore,
          explanation: panguResult.explanation,
        };
      } catch (error) {
        console.error('Pangu Models error, falling back to Genkit:', error);
        // Fall through to Genkit backup
      }
    }

    // Fallback to Genkit AI if Huawei services unavailable
    const {output} = await explainableAIPrompt(input);
    return output!;
  }
);
