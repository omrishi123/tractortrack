"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppContext } from '@/contexts/app-context';
import type { Expense } from '@/lib/types';
import { format } from 'date-fns';

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  category: z.string().min(2, { message: "Category must be at least 2 characters." }),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  description: z.string().optional(),
});

interface ExpenseModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense;
}

export default function ExpenseModal({ isOpen, onOpenChange, expense }: ExpenseModalProps) {
  const { addExpense, updateExpense } = useAppContext();
  const isEditing = !!expense;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      category: '',
      amount: 0,
      description: '',
    },
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        date: format(new Date(expense.date), 'yyyy-MM-dd'),
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
      });
    } else {
      form.reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        category: '',
        amount: 0,
        description: '',
      });
    }
  }, [expense, form, isOpen]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const expenseData = {
        ...values,
        description: values.description || '',
    };
    if (isEditing) {
      updateExpense({ ...expense, ...expenseData });
    } else {
      addExpense(expenseData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this expense." : "Enter the details for the new expense."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Diesel, Repair" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Optional details..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Add Expense'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
