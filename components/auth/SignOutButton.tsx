"use client";

import { useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";
import { Button } from "@/components/ui/Button";
import { logout } from "@/lib/api/auth";

export function SignOutButton() {
  const router = useRouter();
  const { trigger, isMutating } = useSWRMutation("auth/logout", () => logout());

  async function handleSignOut() {
    try {
      await trigger();
    } catch {
      // Sign the user out client-side regardless — an API/network failure
      // here shouldn't strand them on a page that thinks they're logged in.
    } finally {
      router.push("/login");
    }
  }

  return (
    <Button
      variant="ghost"
      type="button"
      onClick={handleSignOut}
      disabled={isMutating}
    >
      Sign out
    </Button>
  );
}
