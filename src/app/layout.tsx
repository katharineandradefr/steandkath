import "~/styles/globals.css";

import { type Metadata, type Viewport } from "next";
import { Geist } from "next/font/google";
import { getServerSession } from "next-auth";

import { AuthSessionProvider } from "~/app/_components/auth-session-provider";
import { authOptions } from "~/server/auth/auth-options";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
  title: "Vibe coding — modelo",
  description:
    "Modelo Next.js + tRPC + MongoDB para aprender a construir com IA.",
  icons: [{ rel: "icon", url: "/header-logo.svg", type: "image/svg+xml" }],
};

export const viewport: Viewport = {
  themeColor: "#e2263c",
};

const geist = Geist({
  subsets: ["latin", "latin-ext"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="pt-BR" className={`${geist.variable}`}>
      <body className="min-h-screen bg-shell text-white antialiased">
        <TRPCReactProvider>
          <AuthSessionProvider session={session}>
            {children}
          </AuthSessionProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
