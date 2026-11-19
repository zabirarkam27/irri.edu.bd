"use client";

import { useActionState } from "react";
import { z } from "zod";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { apiPost } from "@/lib/api-client";
import { tr, type Locale } from "@/lib/locale";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(3),
  message: z.string().min(10)
});

export function ContactPage({ locale, address }: { locale: Locale; address: string }) {
  const t = (text: string) => tr(locale, text);
  const [status, submit, pending] = useActionState(async (_previous: { text: string; error: boolean; values?: Record<string, string> }, formData: FormData) => {
    const payload = Object.fromEntries(formData);
    const values = Object.fromEntries(Object.entries(payload).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      return { text: "Please complete all required fields correctly.", error: true, values };
    }

    try {
      await apiPost<typeof parsed.data, { id: string }>("/contact-messages", parsed.data);
      return { text: "Your message has been submitted.", error: false };
    } catch {
      return { text: "Message could not be submitted right now.", error: true, values };
    }
  }, { text: "", error: false });

  return (
    <>
        <PageHero title={t("Contact")} description={t("Send IRRI a message about research, programs, publications, or collaboration.")} />
        <Container className="grid gap-6 py-14">
          {address && <div>
            <h2 className="font-semibold">{t("Address")}</h2>
            <address lang="en" className="mt-1 not-italic">{address}</address>
          </div>}
          <form action={submit} className="grid max-w-2xl gap-5 rounded-xl border border-border bg-card p-6 shadow-soft">
            <FormInput label={t("Name")} name="name" autoComplete="name" defaultValue={status.values?.name} required />
            <FormInput label={t("Email")} name="email" type="email" autoComplete="email" defaultValue={status.values?.email} required />
            <FormInput label={t("Phone")} name="phone" type="tel" autoComplete="tel" defaultValue={status.values?.phone} />
            <FormInput label={t("Subject")} name="subject" defaultValue={status.values?.subject} required />
            <FormTextarea label={t("Message")} name="message" defaultValue={status.values?.message} required />
            <Button type="submit" disabled={pending}>{t(pending ? "Sending..." : "Submit message")}</Button>
            {status.text && <p role={status.error ? "alert" : "status"} className="text-sm">{t(status.text)}</p>}
          </form>
        </Container>
    </>
  );
}
