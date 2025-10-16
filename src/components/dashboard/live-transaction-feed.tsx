'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, TrendingUp, DollarSign, MapPin, Clock } from 'lucide-react';
import type { ProcessedTransaction } from '@/lib/simulator/real-time-processor';
import { cn } from '@/lib/utils';

interface LiveTransactionFeedProps {
  transactions: ProcessedTransaction[];
  onTransactionClick?: (transaction: ProcessedTransaction) => void;
}

export default function LiveTransactionFeed({ 
  transactions,
  onTransactionClick 
}: LiveTransactionFeedProps) {
  const [displayTransactions, setDisplayTransactions] = useState<ProcessedTransaction[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    highRisk: 0,
    avgRiskScore: 0,
  });

  useEffect(() => {
    // Keep latest 100 transactions
    setDisplayTransactions(transactions.slice(-100).reverse());
    
    // Calculate stats
    const total = transactions.length;
    const highRisk = transactions.filter(t => t.riskScore >= 70).length;
    const avgRiskScore = transactions.length > 0
      ? transactions.reduce((sum, t) => sum + t.riskScore, 0) / transactions.length
      : 0;
    
    setStats({ total, highRisk, avgRiskScore });
  }, [transactions]);

  const getRiskColor = (score: number) => {
    if (score >= 90) return 'text-red-600 dark:text-red-400';
    if (score >= 75) return 'text-orange-600 dark:text-orange-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getRiskBadgeVariant = (score: number): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 75) return 'destructive';
    if (score >= 60) return 'default';
    return 'secondary';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600 animate-pulse" />
              Live Transaction Feed
            </CardTitle>
            <CardDescription>
              Real-time fraud detection analysis
            </CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.highRisk}</div>
              <div className="text-muted-foreground">High Risk</div>
            </div>
            <div className="text-center">
              <div className={cn('text-2xl font-bold', getRiskColor(stats.avgRiskScore))}>
                {stats.avgRiskScore.toFixed(0)}
              </div>
              <div className="text-muted-foreground">Avg Score</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {displayTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Activity className="h-12 w-12 mb-4 opacity-50" />
              <p>Waiting for transactions...</p>
              <p className="text-sm mt-2">Start the simulator to see live data</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md',
                    'animate-in slide-in-from-top-2 fade-in duration-300',
                    transaction.riskScore >= 75 && 'border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/20',
                    transaction.riskScore >= 60 && transaction.riskScore < 75 && 'border-yellow-300 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20',
                    transaction.riskScore < 60 && 'border-border bg-card hover:bg-accent/50'
                  )}
                  onClick={() => onTransactionClick?.(transaction)}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold text-lg">
                            ${transaction.amount.toFixed(2)}
                          </span>
                          <Badge variant={getRiskBadgeVariant(transaction.riskScore)}>
                            Risk: {transaction.riskScore}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {transaction.id}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">User:</span>
                          <span className="font-medium">{transaction.userName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{transaction.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{transaction.merchantName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {new Date(transaction.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>

                      {/* AI Analysis Preview */}
                      {transaction.riskScore >= 60 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {transaction.aiAnalysis}
                          </p>
                        </div>
                      )}

                      {/* Processing Time */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {transaction.riskFactors.length} risk factor{transaction.riskFactors.length !== 1 ? 's' : ''}
                        </span>
                        <span>
                          Processed in {transaction.processingTime}ms
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

