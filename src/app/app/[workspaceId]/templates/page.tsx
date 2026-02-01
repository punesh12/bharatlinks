import { EmptyState } from "@/components/shared/empty-state";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { Pagination } from "@/components/shared/pagination";
import { CreateUtmTemplateModal } from "@/components/templates/create-utm-template-modal";
import { UtmTemplatesList } from "@/components/templates/utm-templates-list";
import { getUtmTemplates } from "@/lib/actions/utms";
import { getRemainingUtmTemplates } from "@/lib/utils/plans";
import { currentUser } from "@clerk/nextjs/server";

const TemplatesPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ page?: string }>;
}) => {
  const { workspaceId } = await params;
  const { page: pageParam } = await searchParams;
  const currentPage = Number(pageParam) || 1;
  const user = await currentUser();

  const { templates,  totalPages } = await getUtmTemplates(workspaceId, currentPage, 12);
  const { used, limit, remaining } = await getRemainingUtmTemplates(workspaceId);

  return (
    <ErrorBoundary>
      <div className="space-y-8 w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-slate-900">
              UTM Templates
            </h1>
          </div>
          <div className="w-full sm:w-auto">
            <CreateUtmTemplateModal workspaceId={workspaceId} limitInfo={{ used, limit, remaining }} />
          </div>
        </div>

        {/* Limit Info */}
        {limit !== null && (
          <div className="px-1">
            <p className="text-sm text-slate-600">
              {used} of {limit} templates used
              {remaining !== null && remaining > 0 && (
                <span className="text-slate-500"> ({remaining} remaining)</span>
              )}
            </p>
          </div>
        )}

        {templates.length > 0 ? (
          <>
            <UtmTemplatesList
              templates={templates}
              workspaceId={workspaceId}
              userImageUrl={user?.imageUrl}
            />
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} />}
          </>
        ) : (
          <EmptyState
            title="No UTM templates yet"
            description="Create your first UTM template to quickly add campaign parameters to your links. Templates help you maintain consistency and save time."
            icon="fileX"
            action={<CreateUtmTemplateModal workspaceId={workspaceId} limitInfo={{ used, limit, remaining }} />}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default TemplatesPage;
