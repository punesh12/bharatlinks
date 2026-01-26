import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-slate-900">404</h1>
        <h2 className="text-2xl font-semibold text-slate-700">Link Not Found</h2>
        <p className="text-slate-500 max-w-md">
          The short link you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
