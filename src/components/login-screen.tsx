
"use client";

import React, { useEffect } from 'react';
import { EmailAuthProvider } from 'firebase/auth';
import 'firebaseui/dist/firebaseui.css';
import { auth } from '@/lib/firebase';
import { TractorIcon } from './icons';

export default function LoginScreen() {
  useEffect(() => {
    // Dynamically import firebaseui here to ensure it only runs on the client
    import('firebaseui').then(firebaseui => {
      const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);
      ui.start('#firebaseui-auth-container', {
        signInOptions: [
          {
            provider: EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: false
          },
        ],
        signInSuccessUrl: '/',
        credentialHelper: firebaseui.auth.CredentialHelper.NONE
      });
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg text-center">
            <div className="flex justify-center items-center mb-6">
                <TractorIcon className="h-12 w-12 text-primary" />
                <h1 className="text-4xl font-bold text-foreground ml-4">TractorTrack</h1>
            </div>
            <p className="text-muted-foreground mb-8">Sign in to sync your data across devices.</p>
            <div id="firebaseui-auth-container"></div>
        </div>
    </div>
  );
}
