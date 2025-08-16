import { createContext, useContext } from 'react';
import type { AppData, Customer, WorkLog, Expense, AppSettings, View, Payment } from '@/lib/types';

export interface AppContextType {
  customers: Customer[];
  workLogs: WorkLog[];
  expenses: Expense[];
  settings: AppSettings;
  view: View;
  setView: (view: View) => void;
  addCustomer: (customer: Omit<Customer, 'id' | 'notes'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  addWorkLog: (workLog: Omit<WorkLog, 'id' | 'payments' | 'balance'>) => void;
  updateWorkLog: (workLog: WorkLog) => void;
  deleteWorkLog: (workLogId: string) => void;
  addPayment: (workLogId: string, payment: Omit<Payment, 'id'>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (expenseId: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateCustomerNotes: (customerId: string, notes: string) => void;
  data: AppData;
}

export const AppContext = createContext<AppContextType | null>(null);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
