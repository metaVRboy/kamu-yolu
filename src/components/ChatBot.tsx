"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Bot, Send, User, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMouseGlow } from "@/hooks/useMouseGlow";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  action?: { label: string; href: string } | null;
};

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Merhaba! Ben Kamu Yolu asistanıyım. Hangi bölümden mezunsun ya da ne tür bir kamu ilanı arıyorsun, bana yazman yeterli.",
};

export function ChatBot() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const panelGlow = useMouseGlow<HTMLDivElement>();
  const inputGlow = useMouseGlow<HTMLDivElement>();

  function scrollToBottom() {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    });
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: nextMessages.slice(-7, -1).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error("request failed");
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, action: data.action },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Üzgünüm, şu anda cevap veremiyorum. Birazdan tekrar dener misin?",
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }

  return (
    <section
      ref={panelGlow.ref}
      onMouseMove={panelGlow.onMouseMove}
      className="group/panel relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-blue-600/15 via-indigo-500/10 to-sky-400/10 p-5 shadow-2xl shadow-blue-500/15 backdrop-blur-2xl sm:p-6"
    >
      {/* Mouse'u takip eden yumusak isik */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/panel:opacity-100 bg-[radial-gradient(500px_circle_at_var(--mx,50%)_var(--my,50%),rgba(255,255,255,0.4),transparent_70%)]"
      />

      <div className="relative flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30">
          <Sparkles className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Kamu Yolu Asistanı</p>
          <p className="text-xs text-slate-600">Sana uygun ilanları birlikte bulalım</p>
        </div>
      </div>

      <div
        ref={listRef}
        className="relative mt-4 flex max-h-80 flex-col gap-3 overflow-y-auto rounded-2xl bg-white/40 p-4 backdrop-blur-sm"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2",
              m.role === "user" && "flex-row-reverse",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                m.role === "assistant"
                  ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
                  : "bg-slate-200 text-slate-600",
              )}
            >
              {m.role === "assistant" ? (
                <Bot className="h-3.5 w-3.5" />
              ) : (
                <User className="h-3.5 w-3.5" />
              )}
            </span>
            <div className="flex max-w-[80%] flex-col gap-1.5">
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2 text-sm",
                  m.role === "assistant"
                    ? "bg-white/90 text-slate-800 shadow-sm"
                    : "ml-auto bg-gradient-to-br from-blue-600 to-indigo-600 text-white",
                )}
              >
                {m.content}
              </div>
              {m.action && (
                <Link
                  href={m.action.href}
                  className={buttonVariants({
                    size: "sm",
                    variant: "outline",
                    className: "w-fit border-primary/30 bg-white/90 text-primary",
                  })}
                >
                  {m.action.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Yazıyor...
          </div>
        )}
      </div>

      <div ref={inputGlow.ref} onMouseMove={inputGlow.onMouseMove} className="group/input relative mt-3">
        {/* Mouse'u takip eden, yalnizca cerceve renginde beliren isik - kutuyu gizlemez */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-[2px] rounded-2xl bg-[radial-gradient(180px_circle_at_var(--mx,50%)_var(--my,50%),rgba(96,165,250,0.9),rgba(59,130,246,0.35)_45%,transparent_70%)] opacity-0 transition-opacity duration-300 group-hover/input:opacity-100 group-focus-within/input:opacity-100"
        />
        <div className="relative flex items-center rounded-2xl border border-primary/15 bg-gradient-to-r from-white via-blue-50/80 to-white pr-1.5">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Örn: Hemşirelik mezunuyum, bana uygun ilan var mı?"
            disabled={isLoading}
            className="h-12 flex-1 rounded-2xl border-none bg-transparent shadow-none focus-visible:ring-0"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            aria-label="Gönder"
            className={buttonVariants({
              size: "icon",
              className:
                "h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md shadow-blue-500/30",
            })}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
