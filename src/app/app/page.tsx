import { getOrCreateFirstWorkspace } from "@/lib/actions/workspaces";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

const Page = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      redirect("/sign-in");
    }

    const workspace = await getOrCreateFirstWorkspace();
    redirect(`/app/${workspace.id}`);
  } catch (error) {
    // NEXT_REDIRECT is not an error - it's how Next.js handles redirects
    // Re-throw it so Next.js can handle it properly
    if (error && typeof error === "object" && "digest" in error) {
      const digest = (error as { digest?: string }).digest;
      if (digest && digest.startsWith("NEXT_REDIRECT")) {
        throw error;
      }
    }
    console.error("Error in app page:", error);
    // Redirect to sign-in if there's an actual error
    redirect("/sign-in");
  }
};

export default Page;
