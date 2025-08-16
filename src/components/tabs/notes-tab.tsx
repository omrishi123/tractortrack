"use client";

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface NotesTabProps {
  customerId: string;
}

export default function NotesTab({ customerId }: NotesTabProps) {
  const { customers, updateCustomerNotes } = useAppContext();
  const customer = customers.find(c => c.id === customerId);
  const [notes, setNotes] = useState(customer?.notes || '');

  useEffect(() => {
    setNotes(customer?.notes || '');
  }, [customer]);

  const handleSave = () => {
    updateCustomerNotes(customerId, notes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Add any notes about this customer..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[200px]"
          />
          <Button onClick={handleSave}>Save Notes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
