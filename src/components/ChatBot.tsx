"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Bot, Send, User, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  department?: { slug: string; name: string } | null;
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
        { role: "assistant", content: data.reply, department: data.department },
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
    <section className="mx-auto max-w-3xl rounded-3xl border border-primary/20 bg-primary/10 p-5 shadow-xl shadow-primary/10 backdrop-blur-xl sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Bot className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Kamu Yolu Asistanı</p>
          <p className="text-xs text-slate-500">Sana uygun ilanları birlikte bulalım</p>
        </div>
      </div>

      <div
        ref={listRef}
        className="mt-4 flex max-h-80 flex-col gap-3 overflow-y-auto rounded-2xl bg-white/50 p-4"
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
                  ? "bg-primary text-primary-foreground"
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
                    ? "bg-white text-slate-800 shadow-sm"
                    : "ml-auto bg-primary text-primary-foreground",
                )}
              >
                {m.content}
              </div>
              {m.department && (
                <Link
                  href={`/bolum/${m.department.slug}`}
                  className={buttonVariants({
                    size: "sm",
                    variant: "outline",
                    className: "w-fit border-primary/30 bg-white text-primary",
                  })}
                >
                  {m.department.name} ilanlarını gör
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

      <div className="mt-3 flex items-center gap-2">
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
          className="h-11 rounded-xl border-primary/20 bg-white"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          aria-label="Gönder"
          className={buttonVariants({ size: "icon", className: "h-11 w-11 shrink-0" })}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
