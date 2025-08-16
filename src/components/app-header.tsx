
"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft, LogOut, Shield } from 'lucide-react';
import { TractorIcon } from '@/components/icons';
import { useAppContext } from '@/contexts/app-context';
import SettingsModal from './modals/settings-modal';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';

interface AppHeaderProps {
  showBackButton?: boolean;
}

export default function AppHeader({ showBackButton = false }: AppHeaderProps) {
  const { settings, setView } = useAppContext();
  const { currentUser } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const handleSignOut = () => {
    auth.signOut();
  };

  const displayName = settings?.userName || currentUser?.displayName || currentUser?.email;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            {showBackButton ? (
              <Button variant="ghost" size="icon" onClick={() => setView({ type: 'dashboard' })}>
                <ArrowLeft className="h-6 w-6" />
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <TractorIcon className="h-8 w-8 text-primary" />
                <div>
                  <span className="inline-block font-bold text-xl">TractorTrack</span>
                  {displayName && (
                    <p className="text-xs text-muted-foreground leading-tight">
                      Welcome, {displayName}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
               {settings?.isAdmin && (
                <Link href="/admin" passHref>
                  <Button variant="ghost" size="icon">
                    <Shield className="h-5 w-5" />
                    <span className="sr-only">Admin Panel</span>
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
               <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign Out</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <SettingsModal isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
