
"use client";

import React, { useMemo } from 'react';
import AppHeader from './app-header';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddWorkTab from './tabs/add-work-tab';
import AllEntriesTab from './tabs/all-entries-tab';
import PaymentsTab from './tabs/payments-tab';
import NotesTab from './tabs/notes-tab';
import BillingReportTab from './tabs/billing-report-tab';
import { DollarSign, FileText, List, Notebook, Tractor } from 'lucide-react';

interface CustomerDetailViewProps {
  customerId: string;
}

export default function CustomerDetailView({ customerId }: CustomerDetailViewProps) {
  const { customers, workLogs } = useAppContext();

  const customer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);
  const customerWorkLogs = useMemo(() => workLogs.filter(w => w.customerId === customerId), [workLogs, customerId]);

  if (!customer) {
    return (
      <div className="no-print">
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
      <div className="no-print">
        <AppHeader showBackButton />
        <main className="container py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">{customer.name}</h1>
            <p className="text-muted-foreground">{customer.phone}</p>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 mb-8">
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
            <Card className="col-span-2 md:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-red-600">₹{totalDue.toFixed(2)}</div></CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="add-work">
             <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto">
              <TabsTrigger value="add-work" className="flex items-center gap-2"><Tractor /> Add Work</TabsTrigger>
              <TabsTrigger value="all-entries" className="flex items-center gap-2"><List /> All Entries</TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2"><DollarSign /> Payments</TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2"><Notebook /> Notes</TabsTrigger>
              <TabsTrigger value="billing-report" className="flex items-center gap-2"><FileText/> Billing Report</TabsTrigger>
            </TabsList>
            
            <TabsContent value="add-work" className="mt-6">
              <AddWorkTab customerId={customerId} />
            </TabsContent>
            <TabsContent value="all-entries" className="mt-6">
              <AllEntriesTab customerId={customerId} />
            </TabsContent>
            <TabsContent value="payments" className="mt-6">
              <PaymentsTab customerId={customerId} />
            </TabsContent>
            <TabsContent value="notes" className="mt-6">
              <NotesTab customerId={customerId} />
            </TabsContent>
            <TabsContent value="billing-report" className="mt-6">
              <BillingReportTab customerId={customerId} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      {/* The printable area is now part of the BillingReportTab component, which is conditionally rendered here */}
    </>
  );
}
