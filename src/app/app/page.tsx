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
    console.error("Error in app page:", error);
    // Redirect to sign-in if there's an error
    redirect("/sign-in");
  }
};

export default Page;
