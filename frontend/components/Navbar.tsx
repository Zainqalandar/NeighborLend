"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  clearAuthToken,
  hasAuthToken,
  subscribeToAuthChanges,
} from "@/utils/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useSyncExternalStore(
    subscribeToAuthChanges,
    hasAuthToken,
    () => false,
  );

  const isActiveLink = (linkPath: string) => {
    return pathname === linkPath;
  };

  const handleLogout = () => {
    clearAuthToken();
    router.replace("/signin");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#dfe7df]/80 bg-[#f8faf5]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" className="flex items-center gap-3" aria-label="NeighborLend home">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#185c46] text-[#efff9d] shadow-[0_8px_20px_rgba(24,92,70,0.18)]">
            <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3.5 11.2 12 4l8.5 7.2v8.1a.7.7 0 0 1-.7.7H4.2a.7.7 0 0 1-.7-.7v-8.1Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M9 20v-5.4h6V20M8 10.4h.01M12 10.4h.01M16 10.4h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-lg font-bold tracking-[-0.03em] text-[#163d31] sm:text-xl">
            Neighbor<span className="text-[#e86e43]">Lend</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#587067] md:flex" aria-label="Main navigation">
          <Link href="/" className={`transition-colors hover:text-[#185c46] ${isActiveLink("/") ? "text-[#185c46] bold underline" : ""} `}>Home</Link>
          <Link href="/items" className={`transition-colors hover:text-[#185c46] ${isActiveLink("/items") ? "text-[#185c46] bold underline" : ""} `}>Browse items</Link>
          {isAuthenticated && <Link href="/requests" className={`transition-colors hover:text-[#185c46] ${isActiveLink("/requests") ? "text-[#185c46] bold underline" : ""} `}>Requests</Link>}
          <Link href="/how-it-works" className={`transition-colors hover:text-[#185c46] ${isActiveLink("/how-it-works") ? "text-[#185c46] bold underline" : ""} `}>How it works</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <button type="button" onClick={handleLogout} className="rounded-full border border-[#cddbd0] px-3.5 py-2 text-sm font-semibold text-[#285347] transition-colors hover:border-[#185c46] hover:bg-white">
              Logout
            </button>
          ) : (
            <>
              <Link href="/signin" className="hidden rounded-full px-3 py-2 text-sm font-semibold text-[#285347] transition-colors hover:bg-[#eaf1e9] sm:inline-flex">
                Sign in
              </Link>
              <Link href="/signup" className="rounded-full bg-[#185c46] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_7px_18px_rgba(24,92,70,0.18)] transition-all hover:-translate-y-0.5 hover:bg-[#124a38]">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
