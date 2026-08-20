"use client";

import { useRouter } from "next/navigation";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
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
      // sonner (not the portal ToastProvider) since this button also
      // renders outside the portal tree, e.g. app/(auth)/pending.
      toast.success("Signed out");
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
