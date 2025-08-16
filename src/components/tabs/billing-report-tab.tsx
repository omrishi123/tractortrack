
"use client";

import React, { useState, useMemo, useRef } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface BillingReportTabProps {
  customerId: string;
}

// Helper function to call the globally defined handlePrint
const triggerPrint = () => {
    if (window.handlePrint) {
        window.handlePrint();
    } else {
        console.error("handlePrint function not found on window");
        // Fallback for safety, though the global script should always define it
        window.print();
    }
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

  const handleExportPDF = () => {
    if (!customer) return;
    const doc = new jsPDF();
    
    // Header
    if (settings.logo) {
      doc.addImage(settings.logo, 'PNG', 14, 10, 30, 30);
    }
    doc.setFontSize(20);
    doc.text(settings.userName, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(settings.tractorName, 105, 28, { align: 'center' });
    
    // Bill To
    doc.setFontSize(14);
    doc.text('Bill To:', 14, 50);
    doc.setFontSize(12);
    doc.text(customer.name, 14, 57);
    doc.text(customer.phone, 14, 64);
    
    const tableColumn = ["Date", "Work", "Cost", "Paid", "Balance"];
    const tableRows: any[][] = [];

    filteredWorkLogs.forEach(log => {
      const logData = [
        new Date(log.date).toLocaleDateString(),
        `${log.equipment} (${log.hours}h ${log.minutes}m)`,
        `Rs ${log.totalCost.toFixed(2)}`,
        `Rs ${(log.totalCost - log.balance).toFixed(2)}`,
        `Rs ${log.balance.toFixed(2)}`
      ];
      tableRows.push(logData);
    });
    
    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 75,
        theme: 'grid',
        footStyles: { fontStyle: 'bold' }
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    
    // Totals
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Cost:', 140, finalY + 10, { align: 'right' });
    doc.text(`Rs ${totals.cost.toFixed(2)}`, 200, finalY + 10, { align: 'right' });
    doc.text('Total Paid:', 140, finalY + 17, { align: 'right' });
    doc.text(`Rs ${totals.paid.toFixed(2)}`, 200, finalY + 17, { align: 'right' });
    doc.text('Balance Due:', 140, finalY + 24, { align: 'right' });
    doc.text(`Rs ${totals.balance.toFixed(2)}`, 200, finalY + 24, { align: 'right' });
    
    // Signature
    doc.line(140, finalY + 50, 200, finalY + 50);
    doc.text('Signature', 170, finalY + 55, { align: 'center' });

    doc.save(`billing-report-${customer?.name}.pdf`);
  };

  if (!customer) return null;

  return (
    <>
    <Card className="print:hidden">
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
        </div>

        {/* This is the visible table for the UI */}
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
                <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={2}>Totals</TableCell>
                    <TableCell className="text-right">₹{totals.cost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{totals.paid.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₹{totals.balance.toFixed(2)}</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
      </CardContent>
      <CardFooter>
          <Button onClick={triggerPrint} className="w-full"><Printer className="mr-2 h-4 w-4" /> Print Bill</Button>
      </CardFooter>
    </Card>

    {/* This is the hidden, styled div for printing */}
    <div ref={printAreaRef} className="hidden print:block">
        <style>{`
            @media print {
                body > *:not(.print-area) {
                    display: none;
                }
                .print-area {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    font-family: 'PT Sans', sans-serif;
                    visibility: visible;
                }
            }
        `}</style>
        <div className="print-area p-8">
          <header className="flex justify-between items-start pb-4 border-b-2 border-gray-800">
              <div className="text-left">
                  <h1 className="text-3xl font-bold text-gray-900">{settings.userName}</h1>
                  <p className="text-gray-600">{settings.tractorName}</p>
              </div>
              {settings.logo && (
                  <img src={settings.logo} alt="Business Logo" className="max-h-24 max-w-24 object-contain"/>
              )}
          </header>

          <section className="my-8">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <h2 className="text-sm font-semibold uppercase text-gray-600">Bill To</h2>
                      <p className="text-lg font-bold text-gray-800">{customer.name}</p>
                      <p className="text-gray-700">{customer.phone}</p>
                  </div>
                  <div className="text-right">
                      <h2 className="text-sm font-semibold uppercase text-gray-600">Invoice Date</h2>
                      <p className="text-lg font-medium text-gray-800">{new Date().toLocaleDateString()}</p>
                  </div>
              </div>
          </section>
          
          <section>
               <table className="w-full text-left border-collapse">
                  <thead>
                      <tr className="bg-gray-800 text-white">
                          <th className="p-3">Date</th>
                          <th className="p-3">Work Details</th>
                          <th className="p-3 text-right">Cost</th>
                          <th className="p-3 text-right">Paid</th>
                          <th className="p-3 text-right">Balance</th>
                      </tr>
                  </thead>
                  <tbody>
                     {filteredWorkLogs.map(log => (
                        <tr key={log.id} className="border-b">
                          <td className="p-3">{new Date(log.date).toLocaleDateString()}</td>
                          <td className="p-3">{log.equipment} ({log.hours}h {log.minutes}m)</td>
                          <td className="p-3 text-right">₹{log.totalCost.toFixed(2)}</td>
                          <td className="p-3 text-right">₹{(log.totalCost - log.balance).toFixed(2)}</td>
                          <td className="p-3 text-right">₹{log.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                  </tbody>
              </table>
          </section>

          <section className="mt-8 flex justify-end">
              <div className="w-full max-w-xs">
                  <div className="flex justify-between py-2">
                      <span className="font-semibold text-gray-700">Total Cost</span>
                      <span className="font-bold text-gray-800">₹{totals.cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                      <span className="font-semibold text-gray-700">Total Paid</span>
                      <span className="font-bold text-green-600">₹{totals.paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-gray-800 mt-2">
                      <span className="font-bold text-lg text-gray-900">Balance Due</span>
                      <span className="font-bold text-lg text-red-600">₹{totals.balance.toFixed(2)}</span>
                  </div>
              </div>
          </section>
          
          <footer className="mt-24">
              <div className="w-1/3 pt-8 border-t-2 border-gray-400">
                  <p className="text-gray-600 text-sm">Signature</p>
              </div>
          </footer>
        </div>
    </div>
    </>
  );
}

    