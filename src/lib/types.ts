export interface Customer {
  id: string;
  name: string;
  phone: string;
  notes: string;
  address: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
}

export interface WorkLog {
  id: string;
  customerId: string;
  date: string;
  equipment: 'Rotavator' | 'Tang Har';
  hours: number;
  minutes: number;
  rate: number; // hourly rate at the time of logging
  totalCost: number;
  payments: Payment[];
  balance: number;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}

export interface AppSettings {
  userName: string;
  tractorName: string;
  logo: string; // base64
  signature: string; // base64
  rates: {
    Rotavator: number;
    'Tang Har': number;
  };
  language: 'en' | 'hi';
  serviceIntervals: {
    Rotavator: number; // in days
    'Tang Har': number; // in days
  };
  isAdmin?: boolean;
  email?: string;
}

export type AppData = {
  customers: Customer[];
  workLogs: WorkLog[];
  expenses: Expense[];
  settings: AppSettings;
};

export type View = 
  | { type: 'dashboard' }
  | { type: 'customer-detail'; customerId: string };
