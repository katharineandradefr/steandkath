import { AppShell } from "~/app/_components/app-shell";
import { UserPreferencesProvider } from "~/app/_components/user-preferences-provider";

export default function AppShellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <UserPreferencesProvider>
      <AppShell>{children}</AppShell>
    </UserPreferencesProvider>
  );
}
