"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SwissCross } from "@/components/ui/swiss-cross";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const t = useTranslations("nav");
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/restaurants?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  const navLinks = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/restaurants`, label: t("restaurants") },
    { href: `/${locale}/autour-de-moi`, label: locale === "de" ? "In meiner Nähe" : locale === "en" ? "Near me" : "Autour de moi" },
    { href: `/${locale}/collections`, label: "Ambiances" },
    { href: `/${locale}/blog`, label: "Blog" },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <SwissCross size={36} />
          <span className="text-xl font-bold tracking-tight">
            Just<span className="text-[var(--color-just-tag)]">-Tag</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center gap-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchPlaceholder") || "Nom, ville, cuisine..."}
                  autoFocus
                  className="h-9 w-48 rounded-md border border-gray-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-[var(--color-just-tag)] focus:ring-1 focus:ring-[var(--color-just-tag)]/30"
                />
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </form>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2"
              onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            >
              <Search className="h-4 w-4" />
              {t("search")}
            </Button>
          )}
          <Link href={`/${locale}/pour-restaurateurs`} className="hidden md:block">
            <Button
              size="sm"
              className="bg-[var(--color-just-tag)] text-white hover:bg-[var(--color-just-tag-dark)]"
            >
              {t("forRestaurants")}
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <nav className="mt-8 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-4 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={`/${locale}/pour-restaurateurs`}
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-md bg-[var(--color-just-tag)] px-4 py-3 text-center text-base font-medium text-white"
                >
                  {t("forRestaurants")}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
