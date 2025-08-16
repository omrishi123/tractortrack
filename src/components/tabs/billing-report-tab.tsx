"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface BillingReportTabProps {
  customerId: string;
}

export default function BillingReportTab({ customerId }: BillingReportTabProps) {
  const { customers, workLogs, settings } = useAppContext();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const printAreaRef = useRef<HTMLDivElement>(null);

  const customer = useMemo(() => customers.find(c => c.id === customerId), [customers, customerId]);

  const filteredWorkLogs = useMemo(() => {
    return workLogs.filter(log => {
      if (log.customerId !== customerId) return false;
      if (startDate && new Date(log.date) < new Date(startDate)) return false;
      if (endDate && new Date(log.date) > new Date(endDate)) return false;
      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workLogs, customerId, startDate, endDate]);

  const totals = useMemo(() => {
    return filteredWorkLogs.reduce((acc, log) => {
      acc.cost += log.totalCost;
      acc.paid += log.totalCost - log.balance;
      acc.balance += log.balance;
      return acc;
    }, { cost: 0, paid: 0, balance: 0 });
  }, [filteredWorkLogs]);

  const handlePrint = () => {
    const printContent = printAreaRef.current?.innerHTML;
    const originalContent = document.body.innerHTML;
    if (printContent) {
      document.body.innerHTML = `<html><head><title>Print</title></head><body>${printContent}</body></html>`;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Date", "Work", "Cost", "Paid", "Balance"];
    const tableRows: any[][] = [];

    filteredWorkLogs.forEach(log => {
      const logData = [
        new Date(log.date).toLocaleDateString(),
        `${log.equipment} (${log.hours.toFixed(2)} hrs)`,
        `Rs ${log.totalCost.toFixed(2)}`,
        `Rs ${(log.totalCost - log.balance).toFixed(2)}`,
        `Rs ${log.balance.toFixed(2)}`
      ];
      tableRows.push(logData);
    });
    
    tableRows.push([
        "",
        "Total",
        `Rs ${totals.cost.toFixed(2)}`,
        `Rs ${totals.paid.toFixed(2)}`,
        `Rs ${totals.balance.toFixed(2)}`,
    ]);

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20,
    });
    doc.text(`Billing Report for ${customer?.name}`, 14, 15);
    doc.save(`billing-report-${customer?.name}.pdf`);
  };

  if (!customer) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-end bg-muted p-4 rounded-lg mb-6">
          <div>
            <label className="text-sm font-medium">From Date</label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">To Date</label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="flex-grow"></div>
          <Button onClick={handleExportPDF} variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Export PDF</Button>
          <Button onClick={handlePrint} variant="outline" size="sm"><Printer className="mr-2 h-4 w-4" /> Print</Button>
        </div>

        <div ref={printAreaRef} className="print-area">
          <div className="mb-6 hidden print:block">
            <h2 className="text-2xl font-bold">{settings.userName}</h2>
            <p>{settings.tractorName}</p>
            <h3 className="text-xl font-semibold mt-4">Billing Report for {customer.name}</h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Work Details</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkLogs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                  <TableCell>{log.equipment} ({log.hours}h {log.minutes}m)</TableCell>
                  <TableCell className="text-right">₹{log.totalCost.toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{(log.totalCost - log.balance).toFixed(2)}</TableCell>
                  <TableCell className="text-right">₹{log.balance.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
                <TableRow className="font-bold">
                    <TableCell colSpan={2}>Totals</TableCell>
                    <TableCell className="text-right">₹{totals.cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{totals.paid.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{totals.balance.toFixed(2)}</TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
