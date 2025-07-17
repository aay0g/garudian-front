"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DatabasesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/databases/contacts');
  }, [router]);

  return null; // Render nothing while redirecting
}
