import { Suspense } from "react";
import { getLinks } from "@/lib/actions/links";
import { getUtmTemplates } from "@/lib/actions/utms";
import { CreateLinkModal } from "@/components/create-link-modal";
import { LinkCard } from "@/components/links/link-card";
import { ArrowRight, LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const DashboardContent = async ({ workspaceId }: { workspaceId: string }) => {
  let links: Awaited<ReturnType<typeof getLinks>>["links"] = [];
  let templates: Awaited<ReturnType<typeof getUtmTemplates>>["templates"] = [];

  try {
    const linksResult = await getLinks(workspaceId, 1, 5); // Get only first 5 links for dashboard
    links = linksResult.links;
  } catch (error) {
    console.error("Error fetching links:", error);
    // Continue with empty links array
  }

  try {
    const templatesResult = await getUtmTemplates(workspaceId, 1, 100);
    templates = templatesResult.templates;
  } catch (error) {
    console.error("Error fetching templates:", error);
    // Continue with empty templates array
    templates = [];
  }

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-slate-900">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage your links and track their performance.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <CreateLinkModal workspaceId={workspaceId} templates={templates} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">Recent Links</h2>
          <Link href={`/app/${workspaceId}/links`}>
            <Button variant="link" className="text-sm">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {links.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-white shadow-sm mt-4 w-full">
            <div className="bg-blue-50 p-6 rounded-full mb-6 text-blue-600">
              <LinkIcon className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No links created yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-8 font-medium">
              Shorten your first URL to start tracking analytics and managing your digital presence
              across India.
            </p>
            <CreateLinkModal workspaceId={workspaceId} templates={templates} />
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await params;

  return (
    <Suspense
      fallback={
        <div className="space-y-8 w-full animate-pulse">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-slate-200 rounded"></div>
              <div className="h-4 w-64 bg-slate-200 rounded"></div>
            </div>
            <div className="h-10 w-32 bg-slate-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-slate-200 rounded"></div>
              <div className="h-6 w-24 bg-slate-200 rounded"></div>
            </div>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="h-4 w-24 bg-slate-200 rounded"></div>
                  <div className="h-3 w-full bg-slate-200 rounded"></div>
                  <div className="h-3 w-3/4 bg-slate-200 rounded"></div>
                  <div className="flex justify-between pt-2 border-t border-slate-100">
                    <div className="h-3 w-20 bg-slate-200 rounded"></div>
                    <div className="h-3 w-16 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <DashboardContent workspaceId={workspaceId} />
    </Suspense>
  );
};

export default DashboardPage;
