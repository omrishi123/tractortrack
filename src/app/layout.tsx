import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';
import AuthLayout from './auth-layout';

export const metadata: Metadata = {
  title: 'TractorTrack',
  description: 'Manage your tractor business with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const androidInterfaceScript = `
    // Call this from your "Sign in with Google" button's onclick event
    function handleGoogleSignIn() {
        if (window.Android && typeof window.Android.startGoogleSignIn === 'function') {
            window.Android.startGoogleSignIn();
        } else {
            console.log('Android interface not found. Using web sign-in.');
            // Your regular web-based Google Sign-In logic goes here
        }
    }

    // Call this from your "Print" button's onclick event
    function handlePrint() {
        if (window.Android && typeof window.Android.printPage === 'function') {
            window.Android.printPage();
        } else {
            // Fallback for regular web browsers
            window.print();
        }
    }
  `;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <AuthLayout>
            {children}
          </AuthLayout>
        </AuthProvider>
        <Toaster />
        <script dangerouslySetInnerHTML={{ __html: androidInterfaceScript }} />
      </body>
    </html>
  );
}
