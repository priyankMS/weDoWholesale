"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <Button variant="ghost" type="button" onClick={handleSignOut}>
      Sign out
    </Button>
  );
}
