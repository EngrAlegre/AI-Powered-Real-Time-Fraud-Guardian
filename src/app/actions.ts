"use server";

import { generateExplainableAIData, ExplainableAIInput } from "@/ai/flows/explainable-ai-dashboard";
import { trainAndDeployModel, TrainAndDeployModelInput } from "@/ai/flows/model-training-deployment";
import { dataPipeline, DataPipelineInput } from "@/ai/flows/data-pipeline";

export async function getExplanationAction(input: ExplainableAIInput) {
  // In a real app, you would fetch transaction details first.
  // For this demo, we pass the ID directly to the flow, which returns mock data.
  try {
    const explanation = await generateExplainableAIData(input);
    return { success: true, data: explanation };
  } catch (error) {
    console.error("Error generating explanation:", error);
    return { success: false, error: "Failed to generate explanation." };
  }
}


export async function trainModelAction(input: TrainAndDeployModelInput) {
    try {
        const result = await trainAndDeployModel(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error training model:", error);
        return { success: false, error: "Failed to start model training." };
    }
}


export async function runDataPipelineAction(input: DataPipelineInput) {
    try {
        const result = await dataPipeline(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error running data pipeline:", error);
        return { success: false, error: "Failed to run data pipeline." };
    }
}
