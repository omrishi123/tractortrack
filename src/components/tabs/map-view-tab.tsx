
"use client";

import React from 'react';
import { useAppContext } from '@/contexts/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

export default function MapViewTab() {
  const { customers } = useAppContext();

  const customersWithAddress = customers.filter(c => c.address);

  // Function to open Google Maps with the address
  const openInGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Map View</CardTitle>
        <CardDescription>
          Here are your customers with a saved address. Click the button to view them on Google Maps.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {customersWithAddress.length > 0 ? (
              customersWithAddress.map(customer => (
                <div key={customer.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.address}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => openInGoogleMaps(customer.address)} aria-label={`Open map for ${customer.name}`}>
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No customers have an address saved yet. Edit a customer to add one.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
