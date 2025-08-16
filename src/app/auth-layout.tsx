
"use client";

import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import LoginScreen from '@/components/login-screen';
import OnboardingScreen from '@/components/onboarding-screen';
import AppProvider from '@/contexts/app-provider';

export default function AuthLayout({ children }: { children: ReactNode }) {
    const { currentUser, loading, needsOnboarding } = useAuth();

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center bg-background">Loading authentication...</div>;
    }

    if (!currentUser) {
        return <LoginScreen />;
    }

    if (needsOnboarding) {
        return <OnboardingScreen />;
    }

    return <AppProvider>{children}</AppProvider>;
}
