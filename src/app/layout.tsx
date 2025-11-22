import "~/styles/globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Navigation } from "./_components/navigation";
import { TransitionProvider } from "./_components/transition-provider";

export const metadata = {
  title: "Sentric",
  description: "Incident Management Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <TransitionProvider>
            <div className="flex min-h-screen flex-col bg-[#0d1117]">
              <div className="gradient-bg fixed inset-0 -z-10 opacity-50" />
              <Navigation />
              <main className="flex flex-1">{children}</main>
            </div>
          </TransitionProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
