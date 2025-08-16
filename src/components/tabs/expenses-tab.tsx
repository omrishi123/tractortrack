"use client";

import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import ExpenseModal from '../modals/expense-modal';
import ConfirmDialog from '../modals/confirm-dialog';
import type { Expense } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';

export default function ExpensesTab() {
  const { expenses, deleteExpense } = useAppContext();
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>(undefined);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  const handleEdit = (expense: Expense) => {
    setExpenseToEdit(expense);
    setIsExpenseModalOpen(true);
  };
  
  const handleAddNew = () => {
    setExpenseToEdit(undefined);
    setIsExpenseModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-end">
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Expense History</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {sortedExpenses.length > 0 ? (
                  sortedExpenses.map(exp => (
                    <div key={exp.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div>
                        <p className="font-semibold">{exp.category}</p>
                        <p className="text-sm text-muted-foreground">{new Date(exp.date).toLocaleDateString()}</p>
                        {exp.description && <p className="text-xs text-muted-foreground pt-1">{exp.description}</p>}
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-lg">₹{exp.amount.toFixed(2)}</p>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(exp)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => setExpenseToDelete(exp.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No expenses recorded yet.</p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onOpenChange={setIsExpenseModalOpen}
        expense={expenseToEdit}
      />
      <ConfirmDialog
        isOpen={!!expenseToDelete}
        onOpenChange={(isOpen) => !isOpen && setExpenseToDelete(null)}
        onConfirm={() => {
          if (expenseToDelete) {
            deleteExpense(expenseToDelete);
            setExpenseToDelete(null);
          }
        }}
        title="Delete Expense?"
        description="This will permanently delete this expense entry. This action cannot be undone."
      />
    </>
  );
}
