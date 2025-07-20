"use client";

import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from '@/lib/msal';
import { PublicClientApplication } from '@azure/msal-browser';
import React from 'react';

// This is the key change: we create the MSAL instance in the component itself.
const msalInstance = new PublicClientApplication(msalConfig);

export default function MsalClientProvider({ children }: { children: React.ReactNode }) {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
