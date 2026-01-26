import { SignIn } from "@clerk/nextjs";

const Page = () => {
  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/app"
      afterSignUpUrl="/app"
    />
  );
};

export default Page;
