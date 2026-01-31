"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const SignUpContent = () => {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const redirectUrl = searchParams.get("redirect_url") || "/app";

  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl="/sign-in"
      afterSignUpUrl={redirectUrl}
      initialValues={email ? { emailAddress: email } : undefined}
    />
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
};

export default Page;
