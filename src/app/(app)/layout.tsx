import { AppShell } from "~/app/_components/app-shell";
import { PendencyNavigationProvider } from "~/app/_components/pendency-navigation-provider";
import { UserPreferencesProvider } from "~/app/_components/user-preferences-provider";

export default function AppShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <UserPreferencesProvider>
      <PendencyNavigationProvider>
        <AppShell>{children}</AppShell>
      </PendencyNavigationProvider>
    </UserPreferencesProvider>
  );
}
