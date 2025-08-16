"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings, ArrowLeft } from 'lucide-react';
import { TractorIcon } from '@/components/icons';
import { useAppContext } from '@/contexts/app-context';
import SettingsModal from './modals/settings-modal';

interface AppHeaderProps {
  showBackButton?: boolean;
}

export default function AppHeader({ showBackButton = false }: AppHeaderProps) {
  const { settings, setView } = useAppContext();
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

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
                <TractorIcon className="h-7 w-7 text-primary" />
                <span className="inline-block font-bold text-xl">TractorTrack</span>
              </div>
            )}
          </div>

          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <SettingsModal isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  );
}
