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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppContext } from '@/contexts/app-context';
import type { WorkLog } from '@/lib/types';
import { format } from 'date-fns';

const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  equipment: z.enum(['Rotavator', 'Tang Har'], { required_error: "Equipment is required" }),
  hours: z.coerce.number().min(0).max(24),
  minutes: z.coerce.number().min(0).max(59),
});

interface WorkLogModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  workLog?: WorkLog;
}

export default function WorkLogModal({ isOpen, onOpenChange, customerId, workLog }: WorkLogModalProps) {
  const { addWorkLog, updateWorkLog, settings } = useAppContext();
  const isEditing = !!workLog;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      equipment: 'Rotavator',
      hours: 0,
      minutes: 0,
    },
  });

  useEffect(() => {
    if (workLog) {
      form.reset({
        date: format(new Date(workLog.date), 'yyyy-MM-dd'),
        equipment: workLog.equipment,
        hours: workLog.hours,
        minutes: workLog.minutes,
      });
    } else {
      form.reset({
        date: format(new Date(), 'yyyy-MM-dd'),
        equipment: 'Rotavator',
        hours: 0,
        minutes: 0,
      });
    }
  }, [workLog, form, isOpen]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const totalHours = values.hours + values.minutes / 60;
    const rate = settings.rates[values.equipment];
    const totalCost = totalHours * rate;

    if (isEditing) {
      updateWorkLog({ ...workLog, ...values, totalCost, rate });
    } else {
      addWorkLog({ ...values, customerId, totalCost, rate });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Work Entry' : 'Add New Work'}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Update the details for this work entry." : "Log a new work entry for this customer."}
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
              name="equipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Equipment</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select equipment" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Rotavator">Rotavator</SelectItem>
                      <SelectItem value="Tang Har">Tang Har</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minutes</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">
                {isEditing ? 'Save Changes' : 'Log Work'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
