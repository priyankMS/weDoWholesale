"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthHero } from "@/components/auth/AuthHero";
import { FormCard, FormField, TextInput } from "@/components/ui/FormCard";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { NoticeCard } from "@/components/ui/NoticeCard";
import { FieldError } from "@/components/ui/FieldError";
import { login, type LoginPayload } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/error";
import { loginSchema } from "@/lib/validation/auth";

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const { trigger, isMutating } = useSWRMutation(
    "auth/login",
    (_key, { arg }: { arg: LoginPayload }) => login(arg),
  );

  async function onSubmit(values: LoginPayload) {
    try {
      const { status } = await trigger(values);
      toast.success("Welcome back!");
      router.push(status === "approved" ? "/catalogue" : "/pending");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <AuthShell showSignInPrompt={false}>
      <AuthHero
        eyebrow="Wholesale Login"
        title="Welcome back to your account"
        sub="Bulk halal meat delivered to your door across Edmonton and Alberta."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormCard>
          <FormField label="Email address">
            <TextInput
              type="email"
              autoComplete="email"
              placeholder="yourrestaurant@email.com"
              {...register("email")}
            />
          </FormField>
          <FormField label="Password">
            <PasswordInput
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
            />
          </FormField>
        </FormCard>
        <FieldError message={errors.email?.message} />
        <FieldError message={errors.password?.message} />

        <div className="mb-3.5 text-right text-[0.84rem]">
          <Link href="/forgot-password" className="font-bold text-primary-500">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" disabled={isMutating}>
          {isMutating ? "Signing in…" : "Sign in to your account →"}
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
