"use client";

import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import WorkLogModal from '../modals/worklog-modal';
import ConfirmDialog from '../modals/confirm-dialog';
import type { WorkLog } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

interface AllEntriesTabProps {
  customerId: string;
}

export default function AllEntriesTab({ customerId }: AllEntriesTabProps) {
  const { workLogs, deleteWorkLog } = useAppContext();
  const [workLogToEdit, setWorkLogToEdit] = useState<WorkLog | undefined>(undefined);
  const [workLogToDelete, setWorkLogToDelete] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const customerWorkLogs = useMemo(() => {
    return workLogs
      .filter(w => w.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workLogs, customerId]);

  const handleEdit = (workLog: WorkLog) => {
    setWorkLogToEdit(workLog);
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setWorkLogToEdit(undefined);
    setIsModalOpen(true);
  };

  const getStatusBadge = (balance: number, totalCost: number) => {
    if (balance <= 0) return <Badge variant="default" className="bg-green-600">Paid</Badge>;
    if (balance < totalCost) return <Badge variant="secondary">Partial</Badge>;
    return <Badge variant="destructive">Unpaid</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Complete Work History</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {customerWorkLogs.length > 0 ? (
                customerWorkLogs.map(log => (
                  <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-semibold">{new Date(log.date).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">{log.equipment} - {log.hours}h {log.minutes}m</p>
                      <p className="text-sm font-bold">₹{log.totalCost.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(log.balance, log.totalCost)}
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(log)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setWorkLogToDelete(log.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">No work entries found.</p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <WorkLogModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        customerId={customerId}
        workLog={workLogToEdit}
      />
      <ConfirmDialog
        isOpen={!!workLogToDelete}
        onOpenChange={(isOpen) => !isOpen && setWorkLogToDelete(null)}
        onConfirm={() => {
          if (workLogToDelete) {
            deleteWorkLog(workLogToDelete);
            setWorkLogToDelete(null);
          }
        }}
        title="Delete Work Entry?"
        description="This will permanently delete this work log. This action cannot be undone."
      />
    </>
  );
}
