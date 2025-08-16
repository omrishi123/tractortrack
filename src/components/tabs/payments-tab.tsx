"use client";

import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { WorkLog } from '@/lib/types';
import PaymentModal from '../modals/payment-modal';
import { ScrollArea } from '../ui/scroll-area';

interface PaymentsTabProps {
  customerId: string;
}

export default function PaymentsTab({ customerId }: PaymentsTabProps) {
  const { workLogs } = useAppContext();
  const [selectedWorkLog, setSelectedWorkLog] = useState<WorkLog | null>(null);

  const unpaidWorkLogs = useMemo(() => {
    return workLogs
      .filter(w => w.customerId === customerId && w.balance > 0)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workLogs, customerId]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {unpaidWorkLogs.length > 0 ? (
                unpaidWorkLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-semibold">{new Date(log.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{log.equipment}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">Due: ₹{log.balance.toFixed(2)}</p>
                       <p className="text-xs text-muted-foreground">Total: ₹{log.totalCost.toFixed(2)}</p>
                    </div>
                    <Button size="sm" onClick={() => setSelectedWorkLog(log)}>Add Payment</Button>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No pending payments for this customer.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {selectedWorkLog && (
        <PaymentModal
          isOpen={!!selectedWorkLog}
          onOpenChange={(isOpen) => !isOpen && setSelectedWorkLog(null)}
          workLog={selectedWorkLog}
        />
      )}
    </>
  );
}
