import { getOrCreateFirstWorkspace } from "@/lib/actions/workspaces";
import { redirect } from "next/navigation";

const Page = async () => {
  const workspace = await getOrCreateFirstWorkspace();
  redirect(`/app/${workspace.id}`);
};

export default Page;
