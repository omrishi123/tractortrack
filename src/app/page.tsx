
"use client";

import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import DashboardView from '@/components/dashboard-view';
import CustomerDetailView from '@/components/customer-detail-view';


export default function Home() {
  const { view } = useAppContext();

  return (
      <main className="min-h-screen bg-background text-foreground">
        {view.type === 'dashboard' ? (
          <DashboardView />
        ) : (
          <CustomerDetailView customerId={view.customerId} />
        )}
      </main>
  );
}
