"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthHero } from "@/components/auth/AuthHero";
import { FormCard, FormField, TextInput } from "@/components/ui/FormCard";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { NoticeCard } from "@/components/ui/NoticeCard";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    const data = await res.json();
    router.push(data.status === "approved" ? "/" : "/pending");
  }

  return (
    <AuthShell showSignInPrompt={false}>
      <AuthHero
        eyebrow="Wholesale Login"
        title="Welcome back to your account"
        sub="Bulk halal meat delivered to your door across Edmonton and Alberta."
      />

      <form onSubmit={handleSubmit}>
        <FormCard>
          <FormField label="Email address">
            <TextInput
              type="email"
              required
              autoComplete="email"
              placeholder="yourrestaurant@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>
          <FormField label="Password">
            <PasswordInput
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
        </FormCard>

        {error && (
          <p className="mb-3 text-[0.82rem] font-semibold text-red-600">{error}</p>
        )}

        <div className="mb-3.5 text-right text-[0.84rem]">
          <Link href="/forgot-password" className="font-bold text-primary-500">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in to your account →"}
        </Button>

        <div className="my-3.5 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-[0.74rem] font-semibold text-neutral-400">
            New to WeDoHalal Wholesale?
          </span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <Link href="/register" className="block">
          <Button type="button" variant="ghost">
            Create a wholesale account
          </Button>
        </Link>
      </form>

      <div className="mt-2">
        <NoticeCard icon="🔒" title="Wholesale accounts only">
          This portal is for restaurants, grocery stores, mosques, and bulk
          buyers. Individual orders are placed at wedohalal.com.
        </NoticeCard>
      </div>
    </AuthShell>
  );
}
