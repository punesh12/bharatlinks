import { NavLink } from "@/components/layout/nav-link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import WorkspaceSwitcher from "@/components/workspace-switcher";
import { getWorkspaces } from "@/lib/actions/workspaces";
import { UserButton } from "@clerk/nextjs";
import { Link as LinkIcon, Menu } from "lucide-react";
import Link from "next/link";

const DashboardLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) => {
  const { workspaceId } = await params;
  const workspaces = await getWorkspaces();

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-[60px] items-center px-6">
          <Link className="flex items-center gap-2 font-semibold" href="#">
            <LinkIcon className="h-6 w-6" />
            <span className="">BharatLinks</span>
          </Link>
        </div>
        <div className="px-4 py-2">
          <WorkspaceSwitcher workspaces={workspaces} currentWorkspaceId={workspaceId} />
        </div>
        <nav className="grid gap-1 px-4 text-sm font-medium mt-4">
          <NavLink href={`/app/${workspaceId}`} icon="dashboard" label="Dashboard" />
          <NavLink href={`/app/${workspaceId}/links`} icon="links" label="Links" />
          <NavLink href={`/app/${workspaceId}/analytics`} icon="analytics" label="Analytics" />
          <NavLink href={`/app/${workspaceId}/settings`} icon="settings" label="Settings" />
        </nav>
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
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <LinkIcon className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">BharatLinks</span>
                </Link>
                <div className="px-2">
                  <WorkspaceSwitcher workspaces={workspaces} currentWorkspaceId={workspaceId} />
                </div>
                <NavLink href={`/app/${workspaceId}`} icon="dashboard" label="Dashboard" />
                <NavLink href={`/app/${workspaceId}/links`} icon="links" label="Links" />
                <NavLink
                  href={`/app/${workspaceId}/analytics`}
                  icon="analytics"
                  label="Analytics"
                />
                <NavLink href={`/app/${workspaceId}/settings`} icon="settings" label="Settings" />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="ml-auto flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-50/30 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
