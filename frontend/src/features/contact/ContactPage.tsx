"use client";

import { useState } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/shared/SiteHeader";
import { SiteFooter } from "@/components/shared/SiteFooter";
import { PageHero } from "@/components/shared/PageHero";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { apiPost } from "@/lib/api-client";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(3),
  message: z.string().min(10)
});

export function ContactPage() {
  const [status, setStatus] = useState<string>("");

  async function submit(formData: FormData) {
    const payload = Object.fromEntries(formData);
    const parsed = contactSchema.safeParse(payload);
    if (!parsed.success) {
      setStatus("Please complete all required fields correctly.");
      return;
    }

    try {
      const result = await apiPost<typeof parsed.data, { id: string }>("/contact-messages", parsed.data);
      setStatus(result.message || "Your message has been submitted.");
    } catch {
      setStatus("Message could not be submitted right now.");
    }
  }

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero title="Contact" description="Send IRRI a message about research, programs, publications, or collaboration." />
        <Container className="py-14">
          <form action={submit} className="grid max-w-2xl gap-5 rounded-xl border border-border bg-card p-6 shadow-soft">
            <FormInput label="Name" name="name" required />
            <FormInput label="Email" name="email" type="email" required />
            <FormInput label="Phone" name="phone" />
            <FormInput label="Subject" name="subject" required />
            <FormTextarea label="Message" name="message" required />
            <Button type="submit">Submit Message</Button>
            {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          </form>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
