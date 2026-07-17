"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

/**
 * Hook that enforces a required role. Redirects away if the
 * authenticated user's role does not match `requiredRole`.
 *
 * @param requiredRole - The role string required to view the page.
 * @param redirectTo   - Where to redirect if the check fails (default: "/dashboard/user").
 */
export function useRequireRole(
  requiredRole: string,
  redirectTo: string = "/dashboard/user"
) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return; // Still loading – wait.

    if (!session) {
      // Not logged in at all — redirect to sign-in
      const current = window.location.pathname;
      router.replace(`/auth/signin?redirectTo=${encodeURIComponent(current)}`);
      return;
    }

    const userRole = (session.user as any).role as string | undefined;

    if (userRole !== requiredRole) {
      toast.error(`Access denied. This page requires the "${requiredRole}" role.`);
      router.replace(redirectTo);
    }
  }, [session, isPending, requiredRole, redirectTo, router]);

  return { session, isPending };
}
