
"use client";

import React, { useMemo, useState } from 'react';
import AppHeader from './app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search, Trash2, Users, FileWarning, Map } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppContext } from '@/contexts/app-context';
import CustomerModal from './modals/customer-modal';
import ConfirmDialog from './modals/confirm-dialog';
import ExpensesTab from './tabs/expenses-tab';
import { Customer } from '@/lib/types';
import { ScrollArea } from './ui/scroll-area';
import MapViewTab from './tabs/map-view-tab';

export default function DashboardView() {
  const { workLogs, customers, expenses, setView, deleteCustomer } = useAppContext();
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | undefined>(undefined);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const summary = useMemo(() => {
    const totalIncome = workLogs.reduce((sum, log) => sum + (log.totalCost - log.balance), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const totalCustomers = customers.length;
    const totalDues = workLogs.reduce((sum, log) => sum + log.balance, 0);
    return { totalIncome, totalExpenses, netProfit, totalCustomers, totalDues };
  }, [workLogs, expenses, customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [customers, searchTerm]);
  
  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsCustomerModalOpen(true);
  };

  const handleAddNewCustomer = () => {
    setCustomerToEdit(undefined);
    setIsCustomerModalOpen(true);
  };

  return (
    <>
      <AppHeader />
      <main className="container py-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5 mb-8">
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalCustomers}</div>
            </CardContent>
          </Card>
           <Card className="col-span-2 sm:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Dues</CardTitle>
               <FileWarning className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{summary.totalDues.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="map-view"><Map className="mr-2 h-4 w-4" />Map View</TabsTrigger>
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
              <Button onClick={handleAddNewCustomer}>
                <PlusCircle className="mr-2 h-4 w-4" /> New Customer
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
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
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="expenses" className="mt-6">
             <ExpensesTab />
          </TabsContent>
           <TabsContent value="map-view" className="mt-6">
             <MapViewTab />
          </TabsContent>
        </Tabs>
      </main>

      <CustomerModal 
        isOpen={isCustomerModalOpen} 
        onOpenChange={setIsCustomerModalOpen}
        customer={customerToEdit}
      />
      
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
