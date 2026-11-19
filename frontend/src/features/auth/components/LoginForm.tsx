"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { loginSchema } from "@/features/auth/schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormInput";

export function LoginForm({ callbackUrl = "/admin/dashboard" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      setMessage("Enter a valid email and password.");
      return;
    }

    const result = await signIn("credentials", {
      ...parsed.data,
      redirect: false,
      callbackUrl
    });

    if (result?.error) {
      setMessage("Invalid email or password, or the backend database is not available.");
      return;
    }

    const target = new URL(result?.url ?? "/admin/dashboard", window.location.origin);
    router.push(target.origin === window.location.origin && target.pathname.startsWith("/admin/") ? target.pathname + target.search : "/admin/dashboard");
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-5">
      <FormInput label="Email" name="email" type="email" autoComplete="username" required />
      <FormInput label="Password" name="password" type="password" autoComplete="current-password" required />
      <Button type="submit">Sign in</Button>
      {message ? <p role="alert" className="text-sm text-destructive">{message}</p> : null}
    </form>
  );
}
