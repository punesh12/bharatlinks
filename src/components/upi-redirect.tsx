"use client";

import { useEffect } from "react";

interface UpiRedirectProps {
  upiUrl: string;
}

export const UpiRedirect = ({ upiUrl }: UpiRedirectProps) => {
  useEffect(() => {
    // Try to redirect to UPI app
    window.location.href = upiUrl;

    // Fallback: If UPI app doesn't open, show a message after a delay
    const timeout = setTimeout(() => {
      // This will only execute if the redirect didn't work
      // (e.g., if no UPI app is installed)
    }, 1000);

    return () => clearTimeout(timeout);
  }, [upiUrl]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h1 className="text-xl font-semibold text-slate-900">Opening UPI Payment...</h1>
        <p className="text-slate-600">
          If your UPI app doesn&apos;t open automatically,{" "}
          <a href={upiUrl} className="text-blue-600 hover:underline">
            click here
          </a>
        </p>
      </div>
    </div>
  );
};
