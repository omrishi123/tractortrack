"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/contexts/app-context';
import type { AppSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import AIPredictionModal from './ai-prediction-modal';

const settingsSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  tractorName: z.string().min(1, "Tractor name is required"),
  rates: z.object({
    Rotavator: z.coerce.number().min(0, "Rate must be positive"),
    'Tang Har': z.coerce.number().min(0, "Rate must be positive"),
  }),
  language: z.enum(['en', 'hi']),
});

interface SettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsModal({ isOpen, onOpenChange }: SettingsModalProps) {
  const { settings, updateSettings } = useAppContext();
  const { toast } = useToast();
  const [isAIPredictionModalOpen, setAIPredictionModalOpen] = useState(false);

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: settings,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(settings);
    }
  }, [isOpen, settings, form]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateSettings({ logo: base64String });
        toast({ title: "Logo updated successfully!" });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: z.infer<typeof settingsSchema>) => {
    updateSettings(values);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Manage your application settings and preferences.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tractorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tractor Name/Model</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rates.Rotavator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rotavator Rate (/hr)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rates.Tang Har"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tang Har Rate (/hr)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormItem>
                <FormLabel>Business Logo</FormLabel>
                <div className="flex items-center gap-4">
                  {settings.logo && <img src={settings.logo} alt="logo" className="h-12 w-12 rounded-full object-cover" />}
                  <Input type="file" accept="image/*" onChange={handleLogoUpload} className="flex-1"/>
                </div>
              </FormItem>
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select language" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4">
                <Button type="button" variant="secondary" className="w-full" onClick={() => { onOpenChange(false); setAIPredictionModalOpen(true); }}>
                  Predict Customer Contact
                </Button>
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AIPredictionModal isOpen={isAIPredictionModalOpen} onOpenChange={setAIPredictionModalOpen} />
    </>
  );
}
