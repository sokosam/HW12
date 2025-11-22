"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/servers", label: "Servers" },
  { href: "/timeline", label: "Timeline" },
  { href: "/orgs", label: "Organizations" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[#30363d] bg-[#161b22] backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/dashboard"
              className="bg-gradient-to-r from-[#58a6ff] to-[#bc8cff] bg-clip-text text-xl font-bold text-transparent"
            >
              Sentric
            </Link>
            <div className="ml-10 flex space-x-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");
                
                return (
                  <SignedIn key={item.href}>
                    <Link
                      href={item.href}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? "border border-[#30363d] bg-[#1f2937] text-[#58a6ff]"
                          : "text-[#c9d1d9] hover:bg-[#1f2937] hover:text-[#f0f6fc]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </SignedIn>
                );
              })}
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");
                
                return (
                  <SignedOut key={item.href}>
                    <SignInButton mode="modal">
                      <button
                        className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? "border border-[#30363d] bg-[#1f2937] text-[#58a6ff]"
                            : "text-[#c9d1d9] hover:bg-[#1f2937] hover:text-[#f0f6fc]"
                        }`}
                      >
                        {item.label}
                      </button>
                    </SignInButton>
                  </SignedOut>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-md border border-[#30363d] bg-transparent px-4 py-2 text-sm font-medium text-[#c9d1d9] transition-all hover:border-[#58a6ff] hover:bg-[#1f2937] hover:text-[#f0f6fc]">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 rounded-full border border-[#30363d]",
                    userButtonPopoverCard:
                      "bg-[#161b22] border border-[#30363d]",
                    userButtonPopoverActionButton:
                      "text-[#c9d1d9] hover:bg-[#1f2937] hover:text-[#f0f6fc]",
                    userButtonPopoverActionButtonText: "text-[#c9d1d9]",
                    userButtonPopoverActionButtonIcon: "text-[#c9d1d9]",
                    userButtonPopoverFooter:
                      "bg-[#161b22] border-t border-[#30363d]",
                  },
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </nav>
  );
}
