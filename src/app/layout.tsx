
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/auth-context';
import AuthLayout from './auth-layout';

export const metadata: Metadata = {
  title: 'TractorTrack',
  description: 'Manage your tractor business with ease.',
};

declare global {
    interface Window {
        Android?: {
            startGoogleSignIn: () => void;
            printPage: () => void;
        };
        triggerWebGoogleSignIn?: () => void;
        handleAndroidLogin?: (idToken: string) => void;
    }
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const androidInterfaceScript = `
    // This function is called from the Google Sign-In button in the React component
    function handleGoogleSignIn() {
        if (window.Android && typeof window.Android.startGoogleSignIn === 'function') {
            // If the Android interface exists, call the native Android function
            window.Android.startGoogleSignIn();
        } else {
            // Otherwise, call the web-based fallback function defined in login-screen.tsx
            console.log('Android interface not found. Using web sign-in.');
            if (window.triggerWebGoogleSignIn) {
                window.triggerWebGoogleSignIn();
            }
        }
    }

    // This function is called from the Print button in the React component
    function handlePrint() {
        if (window.Android && typeof window.Android.printPage === 'function') {
            // If the Android interface exists, call the native Android print function
            window.Android.printPage();
        } else {
            // Fallback for regular web browsers
            window.print();
        }
    }

    /**
     * This is the missing function that the Android app is trying to call.
     * It receives the login token from the app.
     */
    function handleAndroidLogin(idToken) {
        console.log("SUCCESS: Received ID Token from Android app:", idToken);
        
        // This function will now be defined in AuthProvider to handle the token
        if (window.triggerAndroidSignIn) {
            window.triggerAndroidSignIn(idToken);
        } else {
            console.error("Android sign-in handler (triggerAndroidSignIn) not found on window.");
            alert("Login failed: App is not ready to handle the login token.");
        }
    }
  `;
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Source+Code+Pro:wght@400;700&display=swap" rel="stylesheet" />
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
