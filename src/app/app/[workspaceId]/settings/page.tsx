import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUtmTemplate, getUtmTemplates } from "@/lib/actions/utms";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { workspaceMembers, workspaces } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import { WorkspaceEditForm } from "@/components/settings/workspace-edit-form";

const SettingsPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
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
    redirect("/app");
  }

  // Fetch workspace data
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace) {
    redirect("/app");
  }

  const templatesResult = await getUtmTemplates(workspaceId, 1, 100);
  const templates = Array.isArray(templatesResult) ? templatesResult : templatesResult.templates;
  const isOwner = member.role === "owner";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your workspace settings and UTM templates.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace Details</CardTitle>
          <CardDescription>
            {isOwner
              ? "Update your workspace name and settings."
              : "View workspace details. Only owners can edit."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isOwner ? (
            <WorkspaceEditForm workspaceId={workspaceId} currentName={workspace.name} />
          ) : (
            <div className="space-y-2">
              <Label htmlFor="workspace-name-view">Workspace Name</Label>
              <Input
                id="workspace-name-view"
                value={workspace.name}
                readOnly
                className="bg-slate-50"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Only workspace owners can edit the workspace name.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create UTM Template</CardTitle>
            <CardDescription>Save a preset for your campaigns.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              action={async (formData) => {
                "use server";
                await createUtmTemplate(formData, workspaceId);
              }}
              className="space-y-3"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input id="name" name="name" placeholder="e.g. Instagram Bio" required />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Input id="source" name="source" placeholder="instagram" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medium">Medium</Label>
                  <Input id="medium" name="medium" placeholder="bio" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaign">Campaign</Label>
                  <Input id="campaign" name="campaign" placeholder="profile" />
                </div>
              </div>
              <Button type="submit">Save Template</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Templates</CardTitle>
            <CardDescription>Manage your existing presets.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.map((t) => (
                <div key={t.id} className="flex flex-col gap-1 rounded-md border p-2.5">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    ?utm_source={t.source}&utm_medium={t.medium}...
                  </div>
                </div>
              ))}
              {templates.length === 0 && (
                <p className="text-sm text-muted-foreground">No templates found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
