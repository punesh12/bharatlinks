import { SettingsNavLink } from "@/components/settings/settings-nav-link";

interface SettingsLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}

const settingsNavItems = [
  {
    href: (workspaceId: string) => `/app/${workspaceId}/settings`,
    label: "General",
    icon: "settings",
    exact: true, // Only match exact path
  },
  {
    href: (workspaceId: string) => `/app/${workspaceId}/settings/billing`,
    label: "Billing",
    icon: "creditCard",
    exact: false, // Match path and sub-paths
  },
];

export default async function SettingsLayout({
  children,
  params,
}: SettingsLayoutProps) {
  const { workspaceId } = await params;

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Sub Navigation */}
      <aside className="w-full md:w-56 shrink-0">
        <div className="mb-3 hidden md:block">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
            Settings
          </h2>
        </div>
        <nav className="flex flex-row md:flex-col gap-0.5 overflow-x-auto pb-3 md:pb-0 border-b md:border-b-0 md:border-r border-slate-200 pr-0 md:pr-4">
          {settingsNavItems.map((item) => {
            const href = item.href(workspaceId);
            return (
              <SettingsNavLink
                key={href}
                href={href}
                icon={item.icon}
                label={item.label}
                exact={item.exact}
              />
            );
          })}
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
