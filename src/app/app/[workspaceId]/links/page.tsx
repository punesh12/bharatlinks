import { Suspense } from "react";
import { LinkCard } from "@/components/links/link-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Pagination } from "@/components/shared/pagination";
import { getLinks, getAllTags } from "@/lib/actions/links";
import { getUtmTemplates } from "@/lib/actions/utms";
import { LinksFilters } from "@/components/links/links-filters";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import dynamic from "next/dynamic";

const CreateLinkModal = dynamic(() =>
  import("@/components/create-link-modal").then((m) => m.CreateLinkModal)
);

const LinksPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    tags?: string;
  }>;
}) => {
  const { workspaceId } = await params;
  const { page: pageParam, search, sortBy, sortOrder, tags: tagsParam } = await searchParams;
  const currentPage = Number(pageParam) || 1;
  const tagNames = tagsParam?.split(",").filter(Boolean) || [];

  const { links, totalPages, totalCount } = await getLinks(workspaceId, currentPage, 12, {
    search: search || undefined,
    sortBy: (sortBy as "createdAt" | "clickCount" | "title") || "createdAt",
    sortOrder: (sortOrder as "asc" | "desc") || "desc",
    tagFilter: tagNames.length > 0 ? tagNames : undefined,
  });
  const templatesResult = await getUtmTemplates(workspaceId, 1, 100);
  const templates = Array.isArray(templatesResult) ? templatesResult : templatesResult.templates;
  const allTags = await getAllTags(workspaceId);

  return (
    <ErrorBoundary>
      <div className="space-y-8 w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-slate-900">Links</h1>
            <p className="text-muted-foreground text-sm">
              {totalCount && totalCount > 0
                ? `${totalCount} link${totalCount !== 1 ? "s" : ""} in this workspace`
                : "All your created shorten links in this workspace."
            }
            </p>
          </div>
          <div className="w-full sm:w-auto">
            <CreateLinkModal workspaceId={workspaceId} templates={templates} />
          </div>
        </div>

        {/* Filters */}
        <Suspense fallback={<div className="h-32 animate-pulse bg-slate-100 rounded-lg" />}>
          <LinksFilters tags={allTags} />
        </Suspense>

        {links.length > 0 ? (
          <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6">
              {links.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>

            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
          </>
        ) : (
          <EmptyState
            title="Your link list is empty"
            description="Looks like you haven't created any links in this workspace yet. Start by shortening a long URL."
            icon="link"
            action={<CreateLinkModal workspaceId={workspaceId} templates={templates} />}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default LinksPage;
