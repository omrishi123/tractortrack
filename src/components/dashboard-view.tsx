"use client";

import React, { useMemo, useState } from 'react';
import AppHeader from './app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/contexts/app-context';
import CustomerModal from './modals/customer-modal';
import ConfirmDialog from './modals/confirm-dialog';

export default function DashboardView() {
  const { workLogs, expenses, customers, setView, deleteCustomer, deleteExpense, settings } = useAppContext();
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const summary = useMemo(() => {
    const totalIncome = workLogs.reduce((sum, log) => sum + log.payments.reduce((pSum, p) => pSum + p.amount, 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, netProfit };
  }, [workLogs, expenses]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [customers, searchTerm]);
  
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);


  return (
    <>
      <AppHeader />
      <main className="container py-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.totalIncome.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{summary.totalExpenses.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{summary.netProfit.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6">
            <div className="flex items-center justify-between mb-4 gap-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="Search customers..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => setIsCustomerModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Customer
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="space-y-2 p-4">
                  {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                    <div key={customer.id} className="flex items-center p-3 rounded-lg hover:bg-secondary transition-colors group">
                      <div className="flex-1 cursor-pointer" onClick={() => setView({ type: 'customer-detail', customerId: customer.id })}>
                        <p className="font-semibold">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.phone}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setCustomerToDelete(customer.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground p-8">No customers found. Add one to get started!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="expenses" className="mt-6">
             {/* Expense form and list will be implemented in a future step. This is a placeholder. */}
             <p className="text-center text-muted-foreground p-8">Expense tracking coming soon.</p>
          </TabsContent>
        </Tabs>
      </main>

      <CustomerModal isOpen={isCustomerModalOpen} onOpenChange={setIsCustomerModalOpen} />
      
      <ConfirmDialog
        isOpen={!!customerToDelete}
        onOpenChange={(isOpen) => !isOpen && setCustomerToDelete(null)}
        onConfirm={() => {
          if (customerToDelete) {
            deleteCustomer(customerToDelete);
            setCustomerToDelete(null);
          }
        }}
        title="Delete Customer?"
        description="This action cannot be undone. This will permanently delete the customer and all their associated data."
      />
    </>
  );
}
