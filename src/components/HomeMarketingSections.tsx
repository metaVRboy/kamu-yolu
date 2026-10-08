"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ClosingCtaSection() {
  return (
    <section className="rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:py-16">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
        <Image
          src="/brand/kamu-yolu-emblem.png"
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 brightness-0 invert"
        />
      </span>
      <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
        Bölümünü söyle, ilanını bul.
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/80">
        İlan aramak ücretsizdir; kayıt gerektirmez.
      </p>
      <Link
        href="/"
        onClick={(e) => {
          if (window.location.pathname === "/") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-6 bg-white text-primary hover:bg-white/90",
        )}
      >
        Bölüme Göre Ara
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
