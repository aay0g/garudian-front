import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import MsalClientProvider from '@/components/MsalProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Guardian - CyberMitra",
  description: "Advanced cybersecurity case management system",
  icons: {
    icon: '/Logo_Cybermitra.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <MsalClientProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </MsalClientProvider>
        </Providers>
        <Toaster 
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--card-foreground))',
            },
          }}
        />
      </body>
    </html>
  );
}
