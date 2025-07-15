"use client";

import { Suspense } from "react";
import VerifyEmailPage from "./page";

export default function LoginVerifyLayout() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background">Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}
