"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useEffect, useState } from "react";

export type Transaction = {
    id: string;
    user: {
      name: string;
      avatarUrl: string;
      avatarHint: string;
    };
    amount: number;
    date: string;
    riskScore: number;
    status: 'Approved' | 'Flagged' | 'Pending';
  };

export default function RecentTransactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        // In a real application, you would fetch this data from an API.
        setTransactions([]);
    }, []);
    
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          A list of the most recent transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Risk Score</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                       <Image src={transaction.user.avatarUrl} alt={transaction.user.name} width={32} height={32} data-ai-hint={transaction.user.avatarHint} />
                      <AvatarFallback>
                        {transaction.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{transaction.user.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">{transaction.riskScore}</TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      transaction.status === "Flagged"
                        ? "destructive"
                        : transaction.status === 'Approved' ? "secondary" : "default"
                    }
                    className={cn(
                        transaction.status === 'Approved' && "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                    )}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
              </TableRow>
            )) : (
                <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No transactions to display.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
