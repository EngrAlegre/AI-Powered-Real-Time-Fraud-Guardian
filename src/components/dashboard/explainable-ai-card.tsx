"use client";

import React, { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, FileWarning, Lightbulb, Sigma, Brain } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExplainableAIOutput } from "@/ai/flows/explainable-ai-dashboard";
import { getExplanationAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Input } from "../ui/input";
import { HuaweiServiceBadge } from "../huawei/huawei-badge";

interface ExplainableAICardProps {
  initialTransaction?: {
    id: string;
    riskScore: number;
    explanation: ExplainableAIOutput['explanation'];
  };
}

export default function ExplainableAICard({ initialTransaction }: ExplainableAICardProps = {}) {
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(initialTransaction?.id || null);
  const [explanation, setExplanation] = useState<ExplainableAIOutput | null>(
    initialTransaction ? {
      riskScore: initialTransaction.riskScore,
      explanation: initialTransaction.explanation,
    } : null
  );
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleFetchExplanation = (transactionId: string) => {
    if (!transactionId) {
      setExplanation(null);
      return;
    };
    setSelectedTransactionId(transactionId);
    startTransition(async () => {
      const result = await getExplanationAction({ transactionId });
      if (result.success && result.data) {
        setExplanation(result.data);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        });
      }
    });
  };

  const riskColor =
    explanation && explanation.riskScore > 70
      ? "hsl(var(--destructive))"
      : explanation && explanation.riskScore > 40
      ? "hsl(var(--accent))"
      : "hsl(142.1 76.2% 36.3%)";

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Decision Explanation
          </CardTitle>
          <HuaweiServiceBadge service="pangu-models" />
        </div>
        <CardDescription>
          Powered by Huawei Pangu Models - Enter a transaction ID to get AI-powered insights.
        </CardDescription>
        <div className="flex gap-2 pt-2">
            <Input 
                placeholder="Enter transaction ID"
                onChange={(e) => setSelectedTransactionId(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && selectedTransactionId) {
                        handleFetchExplanation(selectedTransactionId)
                    }
                }}
            />
          <Button
            onClick={() => selectedTransactionId && handleFetchExplanation(selectedTransactionId)}
            disabled={isPending || !selectedTransactionId}
          >
            Explain
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : !explanation ? (
          <div className="m-auto text-center text-muted-foreground">
            <p>Select a flagged transaction to see the explanation.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Risk Score</span>
                <span
                  className="font-bold"
                  style={{ color: riskColor }}
                >
                  {explanation.riskScore}/100
                </span>
              </div>
              <Progress
                value={explanation.riskScore}
                className="h-2 [&>div]:bg-destructive"
                style={{ "--tw-bg-opacity": "1", backgroundColor: riskColor }}
              />
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Primary Risk Factors
              </h4>
              <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                {explanation.explanation.primaryRiskFactors.map((factor, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-sm hover:no-underline">
                      <div className="flex justify-between items-center w-full pr-2">
                         <span>{factor.factor}</span>
                         <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                            Impact: {(factor.impact * 100).toFixed(0)}%
                         </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs space-y-1 bg-secondary/50 p-3 rounded-md">
                        <p><strong className="font-medium">Description:</strong> {factor.description}</p>
                        <p><strong className="font-medium">Evidence:</strong> <span className="font-code">{factor.evidence}</span></p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
            
            <div>
                 <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Sigma className="h-4 w-4" /> AI Decision Path
                </h4>
                <div className="bg-primary/5 p-3 rounded-md border-l-4 border-primary space-y-2">
                    <p className="text-xs">
                        <strong>Pangu Model Analysis:</strong> {explanation.explanation.decisionPath.pangModelAnalysis}
                    </p>
                    <p className="text-xs">
                        <strong>Confidence Level:</strong> 
                        <span className="ml-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                            {(explanation.explanation.decisionPath.confidenceLevel * 100).toFixed(1)}%
                        </span>
                    </p>
                </div>
            </div>

            <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <FileWarning className="h-4 w-4" /> Alternative Scenarios Considered
                </h4>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                    {explanation.explanation.decisionPath.alternativeScenarios?.map((scenario, index) => (
                    <li key={index}>{scenario}</li>
                    ))}
                </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-accent" /> Summary
              </h4>
              <p className="text-xs bg-accent/10 p-3 rounded-md border-l-4 border-accent">
                {explanation.explanation.summary}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
