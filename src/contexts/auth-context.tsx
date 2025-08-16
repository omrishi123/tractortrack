
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { AppSettings } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  needsOnboarding: boolean;
}

declare global {
    interface Window {
        triggerAndroidSignIn?: (idToken: string) => void;
    }
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
  const { toast } = useToast();

  useEffect(() => {
    // Function to handle the ID token from Android
    const handleAndroidIdToken = async (idToken: string) => {
        try {
            const credential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, credential);
            toast({ title: "Signed In", description: "Successfully signed in via Android." });
        } catch (error: any) {
            console.error("Android Sign-In Error:", error);
            toast({ variant: "destructive", title: "Sign-In Failed", description: error.message });
        }
    };
    
    // Expose the handler to the window object
    window.triggerAndroidSignIn = handleAndroidIdToken;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        setLoading(false);
        setNeedsOnboarding(false);
      }
    });

    return () => {
        unsubscribeAuth();
        delete window.triggerAndroidSignIn; // Clean up the window function
    }
  }, [toast]);

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
