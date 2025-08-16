"use client";

import React, { useMemo } from 'react';
import AppHeader from './app-header';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CustomerDetailViewProps {
  customerId: string;
}

export default function CustomerDetailView({ customerId }: CustomerDetailViewProps) {
  const { customers, workLogs } = useAppContext();

  const customer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);
  const customerWorkLogs = useMemo(() => workLogs.filter(w => w.customerId === customerId), [workLogs, customerId]);

  if (!customer) {
    return (
      <div>
        <AppHeader showBackButton />
        <main className="container py-8">
          <p>Customer not found.</p>
        </main>
      </div>
    );
  }

  const totalBilled = customerWorkLogs.reduce((sum, log) => sum + log.totalCost, 0);
  const totalPaid = customerWorkLogs.reduce((sum, log) => sum + (log.totalCost - log.balance), 0);
  const totalDue = totalBilled - totalPaid;

  return (
    <>
      <AppHeader showBackButton />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">{customer.phone}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">₹{totalBilled.toFixed(2)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">₹{totalPaid.toFixed(2)}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">₹{totalDue.toFixed(2)}</div></CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="add-work">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="add-work">Add Work</TabsTrigger>
            <TabsTrigger value="all-entries">All Entries</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="billing-report">Billing Report</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add-work" className="mt-6">
            <Card><CardContent className="p-6"><p>Add work form coming soon.</p></CardContent></Card>
          </TabsContent>
          <TabsContent value="all-entries" className="mt-6">
            <Card><CardContent className="p-6"><p>List of all work entries coming soon.</p></CardContent></Card>
          </TabsContent>
          <TabsContent value="payments" className="mt-6">
            <Card><CardContent className="p-6"><p>Payment management coming soon.</p></CardContent></Card>
          </TabsContent>
          <TabsContent value="notes" className="mt-6">
            <Card><CardContent className="p-6"><p>Customer notes coming soon.</p></CardContent></Card>
          </TabsContent>
          <TabsContent value="billing-report" className="mt-6">
            <Card><CardContent className="p-6"><p>Billing report and export coming soon.</p></CardContent></Card>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}
