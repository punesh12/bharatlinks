import { NavLink } from "@/components/layout/nav-link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import WorkspaceSwitcher from "@/components/workspace-switcher";
import { getWorkspaces } from "@/lib/actions/workspaces";
import { UserButton } from "@clerk/nextjs";
import { Link as LinkIcon, Menu } from "lucide-react";
import Link from "next/link";
import { PlanBadge } from "@/components/plan-badge";
import { PlanUsage } from "@/components/plan-usage";
import { getUserPlan } from "@/lib/utils/plans";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workspaceMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/shared/error-boundary";

const DashboardLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) => {
  const { workspaceId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user is a member of the workspace
  const [member] = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)))
    .limit(1);

  if (!member) {
    // User is not a member, redirect to first available workspace or create one
    const workspaces = await getWorkspaces();
    if (workspaces.length > 0) {
      redirect(`/app/${workspaces[0].id}`);
    } else {
      redirect("/app");
    }
  }

  const workspaces = await getWorkspaces();
  const userPlan = await getUserPlan();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-6">
            <Link className="flex items-center gap-2 font-semibold text-lg" href="#">
              <LinkIcon className="h-5 w-5" />
              <span>BharatLinks</span>
            </Link>
          </div>

          {/* Workspace Switcher */}
          <div className="border-b px-3 py-3">
            <WorkspaceSwitcher workspaces={workspaces} currentWorkspaceId={workspaceId} />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-2">
            <NavLink href={`/app/${workspaceId}`} icon="dashboard" label="Dashboard" />
            <NavLink href={`/app/${workspaceId}/links`} icon="links" label="Links" />
            <NavLink href={`/app/${workspaceId}/analytics`} icon="analytics" label="Analytics" />
            <NavLink href={`/app/${workspaceId}/settings`} icon="settings" label="Settings" />
          </nav>

          {/* Plan Usage */}
          <div className="border-t p-4">
            <Suspense fallback={<div className="h-32 animate-pulse bg-slate-100 rounded-lg" />}>
              <PlanUsage workspaceId={workspaceId} />
            </Suspense>
          </div>
        </div>
      </aside>
      <div className="flex flex-col min-h-screen w-full sm:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white/80 backdrop-blur-md px-4 sm:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs flex flex-col p-0">
              <div className="flex flex-col h-full">
                {/* Logo */}
                <div className="flex h-16 items-center border-b px-6">
                  <Link className="flex items-center gap-2 font-semibold text-lg" href="#">
                    <LinkIcon className="h-5 w-5" />
                    <span>BharatLinks</span>
                  </Link>
                </div>

                {/* Workspace Switcher */}
                <div className="border-b px-3 py-3">
                  <WorkspaceSwitcher workspaces={workspaces} currentWorkspaceId={workspaceId} />
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
                  <NavLink href={`/app/${workspaceId}`} icon="dashboard" label="Dashboard" />
                  <NavLink href={`/app/${workspaceId}/links`} icon="links" label="Links" />
                  <NavLink
                    href={`/app/${workspaceId}/analytics`}
                    icon="analytics"
                    label="Analytics"
                  />
                  <NavLink href={`/app/${workspaceId}/settings`} icon="settings" label="Settings" />
                </nav>

                {/* Plan Usage */}
                <div className="border-t p-4">
                  <Suspense fallback={<div className="h-32 animate-pulse bg-slate-100 rounded-lg" />}>
                    <PlanUsage workspaceId={workspaceId} />
                  </Suspense>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="ml-auto flex items-center gap-4">
            <PlanBadge plan={userPlan} />
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="flex-1 pl-2 pr-2 lg:pr-8 pt-2 pb-2 lg:pt-8 lg:pb-8 bg-slate-50/30 w-full overflow-x-hidden">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
