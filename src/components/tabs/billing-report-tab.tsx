
"use client";

import React, { useMemo, useRef, useState } from 'react';
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

declare global {
    interface Window {
        Android?: {
            startGoogleSignIn: () => void;
            printPage: () => void;
            savePdf?: (base64Data: string, fileName: string) => void;
        };
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

  const triggerPrint = () => {
    if (!customer) return;

    // Dynamically generate the HTML for the invoice
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - ${customer.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap');
            body { font-family: 'PT Sans', sans-serif; margin: 2rem; color: #333; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 1rem; border-bottom: 2px solid black; }
            .header .brand h1 { font-size: 2rem; font-weight: bold; margin: 0; }
            .header .brand p { margin: 0; color: #555; }
            .header .logo { max-height: 6rem; max-width: 6rem; }
            .details { margin: 2rem 0; display: grid; grid-template-columns: 1fr 1fr; }
            .details .label { font-size: 0.8rem; font-weight: bold; text-transform: uppercase; color: #777; }
            .details .value { font-size: 1.1rem; font-weight: bold; }
            .details .text-right { text-align: right; }
            table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #ddd; }
            thead th { background-color: black; color: white; }
            tbody tr:nth-child(even) { background-color: #f9f9f9; }
            .totals { float: right; width: 40%; margin-top: 2rem; }
            .totals table { width: 100%; }
            .totals td { border: none; padding: 0.25rem 0; }
            .totals .label { text-align: right; font-weight: bold; padding-right: 1rem; }
            .totals .final-balance { font-size: 1.2rem; font-weight: bold; border-top: 2px solid black; margin-top: 0.5rem; padding-top: 0.5rem; }
            footer { margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #aaa; }
            .signature { width: 12rem; margin-top: 1rem; }
            .signature img { max-height: 4rem; width: auto; }
            .signature .line { border-top: 2px solid #555; padding-top: 0.5rem; }
            .signature .label { color: #555; font-size: 0.9rem; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">
              <h1>${settings.userName}</h1>
              <p>${settings.tractorName}</p>
            </div>
            ${settings.logo ? `<img src="${settings.logo}" alt="Logo" class="logo" />` : ''}
          </div>
          <div class="details">
            <div>
              <p class="label">BILL TO</p>
              <p class="value">${customer.name}</p>
              <p>${customer.phone}</p>
            </div>
            <div class="text-right">
              <p class="label">INVOICE DATE</p>
              <p class="value">${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Work Details</th>
                <th style="text-align: right;">Cost</th>
                <th style="text-align: right;">Paid</th>
                <th style="text-align: right;">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredWorkLogs.map(log => `
                <tr>
                  <td>${new Date(log.date).toLocaleDateString()}</td>
                  <td>${log.equipment} (${log.hours}h ${log.minutes}m)</td>
                  <td style="text-align: right;">₹${log.totalCost.toFixed(2)}</td>
                  <td style="text-align: right;">₹${(log.totalCost - log.balance).toFixed(2)}</td>
                  <td style="text-align: right;">₹${log.balance.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <table>
              <tr><td class="label">Total Cost:</td><td style="text-align: right;">₹${totals.cost.toFixed(2)}</td></tr>
              <tr><td class="label">Total Paid:</td><td style="text-align: right;">₹${totals.paid.toFixed(2)}</td></tr>
              <tr class="final-balance"><td class="label">BALANCE DUE:</td><td style="text-align: right;">₹${totals.balance.toFixed(2)}</td></tr>
            </table>
          </div>
          <div style="clear: both;"></div>
          <footer>
            <div class="signature">
              ${settings.signature ? `<img src="${settings.signature}" alt="Signature" />` : '<div class="line"></div>'}
              <p class="label">Signature</p>
            </div>
          </footer>
        </body>
      </html>
    `;

    const originalContents = document.body.innerHTML;
    document.body.innerHTML = invoiceHtml;

    if (window.Android && typeof window.Android.printPage === 'function') {
        window.Android.printPage();
    } else {
        window.print();
    }

    // Use a timeout to ensure printing has been initiated before restoring the content
    setTimeout(() => {
        document.body.innerHTML = originalContents;
        // Re-initialize React app or simply reload
        window.location.reload();
    }, 500);
  }

  const handleExportPDF = () => {
    if (!customer) return;
    const doc = new jsPDF();
    
    if (settings.logo) {
      doc.addImage(settings.logo, 'PNG', 14, 10, 30, 30);
    }
    doc.setFontSize(20);
    doc.text(settings.userName, 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(settings.tractorName, 105, 28, { align: 'center' });
    
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
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Cost:', 140, finalY + 10, { align: 'right' });
    doc.text(`Rs ${totals.cost.toFixed(2)}`, 200, finalY + 10, { align: 'right' });
    doc.text('Total Paid:', 140, finalY + 17, { align: 'right' });
    doc.text(`Rs ${totals.paid.toFixed(2)}`, 200, finalY + 17, { align: 'right' });
    doc.text('Balance Due:', 140, finalY + 24, { align: 'right' });
    doc.text(`Rs ${totals.balance.toFixed(2)}`, 200, finalY + 24, { align: 'right' });
    
    if (settings.signature) {
        doc.addImage(settings.signature, 'PNG', 140, finalY + 30, 60, 25, undefined, 'FAST');
    } else {
        doc.line(140, finalY + 50, 200, finalY + 50);
        doc.text('Signature', 170, finalY + 55, { align: 'center' });
    }
    
    const fileName = `billing-report-${customer?.name}.pdf`;

    if (window.Android && typeof window.Android.savePdf === 'function') {
        const pdfBase64 = doc.output('datauristring').split(',')[1];
        window.Android.savePdf(pdfBase64, fileName);
    } else {
        doc.save(fileName);
    }
  };

  if (!customer) return null;

  return (
    <>
      <div className="no-print">
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
      </div>
      
      {/* This hidden div is no longer needed with the new dynamic approach, but we keep it for the ref */}
      <div ref={printAreaRef} className="hidden"></div>
    </>
  );
}

