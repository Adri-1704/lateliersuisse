"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Mail, MapPin, Phone, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactForm } from "@/actions/contact";

export default function ContactPage() {
  const t = useTranslations("contactPage");
  const tNav = useTranslations("nav");
  const params = useParams();
  const locale = (params.locale as string) || "fr";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
      locale,
    };

    setIsSubmitting(true);
    try {
      const result = await submitContactForm(data);
      if (result.success) {
        setIsSuccess(true);
      } else {
        setError(result.error || t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {tNav("contact")}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Contact Form */}
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                {t("successTitle")}
              </h2>
              <p className="mt-2 text-gray-600">{t("successMessage")}</p>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">{t("firstName")} *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t("lastName")} *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">{t("email")} *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="subject">{t("subject")}</Label>
                <Input id="subject" name="subject" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="message">{t("message")} *</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="mt-1.5"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[var(--color-just-tag)] hover:bg-[var(--color-just-tag-dark)]"
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("send")}
              </Button>
            </form>
          )}
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-just-tag-light)]">
              <Mail className="h-6 w-6 text-[var(--color-just-tag)]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Email</h3>
              <p className="mt-1 text-gray-600">contact@just-tag.ch</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-just-tag-light)]">
              <Phone className="h-6 w-6 text-[var(--color-just-tag)]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t("phone")}</h3>
              <p className="mt-1 text-gray-600">+41 22 000 00 00</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-just-tag-light)]">
              <MapPin className="h-6 w-6 text-[var(--color-just-tag)]" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{t("address")}</h3>
              <p className="mt-1 text-gray-600">
                Rue du Marche 10
                <br />
                1204 Geneve, Suisse
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
