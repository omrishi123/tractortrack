"use client";

import React from 'react';
import WorkLogModal from '../modals/worklog-modal';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

interface AddWorkTabProps {
  customerId: string;
}

export default function AddWorkTab({ customerId }: AddWorkTabProps) {
  const [isWorkLogModalOpen, setIsWorkLogModalOpen] = React.useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-6 text-center">
            <p className="mb-4 text-muted-foreground">Log a new work entry for this customer.</p>
            <Button onClick={() => setIsWorkLogModalOpen(true)}>Add New Work</Button>
        </CardContent>
      </Card>
      <WorkLogModal
        isOpen={isWorkLogModalOpen}
        onOpenChange={setIsWorkLogModalOpen}
        customerId={customerId}
      />
    </>
  );
}
