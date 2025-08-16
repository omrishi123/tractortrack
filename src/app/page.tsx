"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { AppData, View, Customer, WorkLog, Expense, AppSettings } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { AppContext, AppContextType } from '@/contexts/app-context';
import DashboardView from '@/components/dashboard-view';
import CustomerDetailView from '@/components/customer-detail-view';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

const defaultSettings: AppSettings = {
  userName: 'Tractor Owner',
  tractorName: 'My Tractor',
  logo: '',
  rates: {
    Rotavator: 1000,
    'Tang Har': 1200,
  },
  language: 'en',
  serviceIntervals: {
    Rotavator: 180,
    'Tang Har': 180,
  },
};

export default function Home() {
  const [data, setData] = useLocalStorage<AppData>('tractorTrackData', {
    customers: [],
    workLogs: [],
    expenses: [],
    settings: defaultSettings,
  });

  const [view, setView] = useState<View>({ type: 'dashboard' });
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const contextValue = useMemo<AppContextType>(() => {
    const { customers, workLogs, expenses, settings } = data;
    
    return {
      ...data,
      view,
      setView,
      
      // Customers
      addCustomer: (customer) => {
        const newCustomer = { ...customer, id: uuidv4() };
        setData(prev => ({ ...prev, customers: [...prev.customers, newCustomer]}));
        toast({ title: "Customer Added", description: `${customer.name} has been added.` });
      },
      updateCustomer: (updatedCustomer) => {
        setData(prev => ({ ...prev, customers: prev.customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)}));
        toast({ title: "Customer Updated", description: `${updatedCustomer.name}'s details have been updated.` });
      },
      deleteCustomer: (customerId) => {
        setData(prev => ({
          ...prev,
          customers: prev.customers.filter(c => c.id !== customerId),
          workLogs: prev.workLogs.filter(w => w.customerId !== customerId),
        }));
        toast({ title: "Customer Deleted", description: "The customer and all their data have been removed." });
      },

      // WorkLogs
      addWorkLog: (workLog) => {
        const newLog = { ...workLog, id: uuidv4(), payments: [], balance: workLog.totalCost };
        setData(prev => ({ ...prev, workLogs: [...prev.workLogs, newLog]}));
        toast({ title: "Work Logged", description: `New work entry has been saved.` });
      },
      updateWorkLog: (updatedLog) => {
        setData(prev => ({ ...prev, workLogs: prev.workLogs.map(w => w.id === updatedLog.id ? updatedLog : w)}));
        toast({ title: "Work Updated", description: "The work entry has been updated." });
      },
      deleteWorkLog: (workLogId) => {
        setData(prev => ({ ...prev, workLogs: prev.workLogs.filter(w => w.id !== workLogId)}));
        toast({ title: "Work Deleted", description: "The work entry has been removed." });
      },

      // Payments
      addPayment: (workLogId, payment) => {
        setData(prev => ({
          ...prev,
          workLogs: prev.workLogs.map(w => {
            if (w.id === workLogId) {
              const newPayment = { ...payment, id: uuidv4() };
              const updatedPayments = [...w.payments, newPayment];
              const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
              const newBalance = w.totalCost - totalPaid;
              return { ...w, payments: updatedPayments, balance: newBalance };
            }
            return w;
          })
        }));
        toast({ title: "Payment Added", description: `Payment of ${payment.amount} has been recorded.` });
      },

      // Expenses
      addExpense: (expense) => {
        const newExpense = { ...expense, id: uuidv4() };
        setData(prev => ({ ...prev, expenses: [...prev.expenses, newExpense]}));
        toast({ title: "Expense Added", description: "The new expense has been recorded." });
      },
      deleteExpense: (expenseId) => {
        setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== expenseId)}));
        toast({ title: "Expense Deleted", description: "The expense has been removed." });
      },
      
      // Settings
      updateSettings: (newSettings) => {
        setData(prev => ({ ...prev, settings: { ...prev.settings, ...newSettings }}));
        toast({ title: "Settings Updated", description: "Your settings have been saved." });
      },
    };
  }, [data, view, setData, toast]);

  if (!isInitialized) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">Loading...</div>;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-background text-foreground">
        {view.type === 'dashboard' ? (
          <DashboardView />
        ) : (
          <CustomerDetailView customerId={view.customerId} />
        )}
      </div>
    </AppContext.Provider>
  );
}
