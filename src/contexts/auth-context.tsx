
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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
    if (!currentUser) {
        setLoading(false);
        return;
    };

    const docRef = doc(db, "users", currentUser.uid);
    const unsubscribeFirestore = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            const settings = data.settings as AppSettings;
            if(settings && settings.userName) {
                 setNeedsOnboarding(false);
            } else {
                 setNeedsOnboarding(true);
            }
        } else {
            setNeedsOnboarding(true);
        }
        setLoading(false);
    }, (error) => {
        console.error("Firestore snapshot error:", error);
        setLoading(false);
    });

    return () => unsubscribeFirestore();
  }, [currentUser]);


  const value = {
    currentUser,
    loading,
    needsOnboarding,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
