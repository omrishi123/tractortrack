
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import LoginScreen from '@/components/login-screen';
import OnboardingScreen from '@/components/onboarding-screen';
import type { AppSettings } from '@/lib/types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  needsOnboarding: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setLoading(false);
        setNeedsOnboarding(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const docRef = doc(db, "users", currentUser.uid);
    const unsubscribeFirestore = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            // Check if user has completed onboarding by looking for a specific setting
            const settings = data.settings as AppSettings;
            if(settings && settings.userName) {
                 setNeedsOnboarding(false);
            } else {
                 setNeedsOnboarding(true);
            }
        } else {
            // Document doesn't exist, so this is a new user
            setNeedsOnboarding(true);
        }
        setLoading(false);
    });

    return () => unsubscribeFirestore();
  }, [currentUser]);


  const value = {
    currentUser,
    loading,
    needsOnboarding,
  };

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center bg-background">Loading...</div>;
  }
  
  if (!currentUser) {
    return <LoginScreen />;
  }

  if (needsOnboarding) {
    return <OnboardingScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
