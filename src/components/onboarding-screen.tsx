
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { initialData } from '@/app/page';
import { useToast } from '@/hooks/use-toast';
import { TractorIcon } from './icons';

const onboardingSchema = z.object({
  userName: z.string().min(2, "Please enter your name."),
  tractorName: z.string().min(2, "Please enter your tractor's name or model."),
  rotavatorRate: z.coerce.number().min(0, "Rate must be a positive number."),
  tangHarRate: z.coerce.number().min(0, "Rate must be a positive number."),
});

export default function OnboardingScreen() {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof onboardingSchema>>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      userName: currentUser?.displayName || '',
      tractorName: '',
      rotavatorRate: 1000,
      tangHarRate: 1200,
    },
  });

  const onSubmit = async (values: z.infer<typeof onboardingSchema>) => {
    if (!currentUser) {
        toast({ variant: "destructive", title: "Error", description: "You are not signed in." });
        return;
    }

    const initialSettings = {
      ...initialData.settings,
      userName: values.userName,
      tractorName: values.tractorName,
      rates: {
        Rotavator: values.rotavatorRate,
        'Tang Har': values.tangHarRate,
      },
    };
    
    const finalInitialData = {
        ...initialData,
        settings: initialSettings,
    };

    try {
        const docRef = doc(db, "users", currentUser.uid);
        await setDoc(docRef, finalInitialData);
        toast({ title: "Welcome!", description: "Your details have been saved." });
        // The AuthProvider will automatically switch the view upon detecting the change
    } catch (error) {
        console.error("Failed to save initial data:", error);
        toast({ variant: "destructive", title: "Setup Failed", description: "Could not save your details. Please try again." });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <TractorIcon className="h-10 w-10 text-primary" />
                <CardTitle className="text-3xl ml-3">Welcome to TractorTrack!</CardTitle>
            </div>
          <CardDescription>Let's get your business set up. Please fill in the details below.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tractorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tractor Name / Model</FormLabel>
                    <FormControl><Input placeholder="e.g., Sonalika DI 745" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                 <FormField
                    control={form.control}
                    name="rotavatorRate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Rotavator Rate (₹/hr)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="tangHarRate"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Tang Har Rate (₹/hr)</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>
               <p className="text-xs text-muted-foreground pt-2">You can add a business logo and change these details later in the Settings menu.</p>
              <Button type="submit" className="w-full !mt-8">Complete Setup</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
