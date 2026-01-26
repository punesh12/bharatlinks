import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUtmTemplate, getUtmTemplates } from "@/lib/actions/utms";

const SettingsPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
  const { workspaceId } = await params;
  const templates = await getUtmTemplates(workspaceId);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">General Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your workspace settings and UTM templates.
        </p>
      </div>

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
