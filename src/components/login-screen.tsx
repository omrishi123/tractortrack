
"use client";

import React, { useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { TractorIcon } from './icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Github } from 'lucide-react';

export default function LoginScreen() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message,
      });
    }
  };

  const handleEmailPasswordAction = async (action: 'login' | 'register') => {
    setLoading(true);
    try {
      if (action === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: action === 'login' ? "Login Failed" : "Registration Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-lg shadow-lg">
        <div className="flex justify-center items-center mb-6 text-center">
            <TractorIcon className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground ml-4">TractorTrack</h1>
        </div>
        <p className="text-muted-foreground mb-8 text-center">The easiest way to manage your tractor business.</p>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={(e) => { e.preventDefault(); handleEmailPasswordAction('login'); }} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign In"}</Button>
            </form>
          </TabsContent>
          <TabsContent value="register">
            <form onSubmit={(e) => { e.preventDefault(); handleEmailPasswordAction('register'); }} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input id="register-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input id="register-password" type="password" placeholder="Must be at least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating Account..." : "Create Account"}</Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"></path><path fill="#34A853" d="M24 46c5.94 0 10.92-1.96 14.56-5.3l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"></path><path fill="#FBBC05" d="M11.69 28.18c-.45-1.32-.7-2.73-.7-4.18s.25-2.86.7-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.82l7.35-5.64z"></path><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 12.5l7.35 5.68c1.73-5.2 6.58-9.07 12.31-9.07z"></path></svg>
          Google
        </Button>
      </div>
    </div>
  );
}
