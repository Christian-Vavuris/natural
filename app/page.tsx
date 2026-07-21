"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

const PLACEHOLDER_DEFAULT = "Ask a question about Christian…";

const PLACEHOLDER_EXAMPLES = [
  "What are Christian's top three qualifications?",
  "How has Christian built a GTM motion from zero before?",
  "Why does Natural's mission resonate with Christian?",
];

const SUGGESTED_QUESTIONS = [
  "What are Christian's top three qualifications to work at Natural?",
  "Where has Christian sold to financial technology startups before, and what is his approach?",
  "Agentic payments is a brand new space, but Natural's partner financial institutions have legacy incentives. How would Christian navigate that dichotomy when selling?",
  "Natural sells to startups and developers building with agents — a category with no established playbook yet. How would Christian define positioning and build distribution from scratch?",
  "Why is Natural the perfect place for Christian?",
];

type DisplayMessage = { role: "user" | "assistant"; content: string };

function NaturalLogo() {
  return (
    <div className="flex items-center gap-2" aria-label="Natural logo">
      <span className="block h-4 w-4 bg-[#161514]" />
      <span className="text-[15px] font-medium tracking-tight text-[#161514]">
        Natural
      </span>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER_DEFAULT);
  const latestQuestionRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (messages.length > 0 || input) {
      setPlaceholder(PLACEHOLDER_DEFAULT);
      return;
    }

    let cancelled = false;
    const wait = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    async function animate() {
      while (!cancelled) {
        for (const question of PLACEHOLDER_EXAMPLES) {
          for (let i = 1; i <= question.length; i++) {
            if (cancelled) return;
            setPlaceholder(question.slice(0, i));
            await wait(28);
          }
          await wait(1100);
          for (let i = question.length; i >= 0; i--) {
            if (cancelled) return;
            setPlaceholder(question.slice(0, i));
            await wait(16);
          }
          await wait(250);
        }
        for (let i = 0; i < 3 && !cancelled; i++) {
          setPlaceholder("...");
          await wait(500);
          if (cancelled) return;
          setPlaceholder("");
          await wait(500);
        }
      }
    }

    animate();

    return () => {
      cancelled = true;
    };
  }, [messages.length, input]);

  useEffect(() => {
    if (messages[messages.length - 1]?.role === "user") {
      latestQuestionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setInput("");

    const nextMessages: DisplayMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) throw new Error("Request failed");

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply ?? "" },
      ]);
    } catch {
      setError("Something went wrong reaching the AI Cover Letter. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12 sm:py-20">
      <NaturalLogo />

      <h1 className="mb-8 mt-5 text-3xl font-medium tracking-tight text-[#161514] sm:text-4xl">
        I&apos;m Christian, and I want to work for Natural
      </h1>

      <div className="text-[17px] leading-[1.75] text-neutral-700">
        <p className="mb-[18px]">
          I&apos;m{" "}
          <a
            href="https://www.linkedin.com/in/cvavuris/?skipRedirect=true"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#161514] underline underline-offset-2 hover:text-neutral-500"
          >
            Christian Vavuris
          </a>
          , a financial technology salesperson with 10 years of experience.
        </p>
        <p className="mb-[18px]">
          This AI Cover Letter is designed to help you understand who I am
          and what I&apos;ve done. Use it to understand where I can help
          Natural succeed.
        </p>
        <p>
          Here is a copy of my{" "}
          <a
            href="https://drive.google.com/file/d/15KOYS1W8pQ7i_ET4DvBvUUBihsVg5hBG/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#161514] underline underline-offset-2 hover:text-neutral-500"
          >
            resume
          </a>
          , and at the bottom of the page are some example questions you can
          use to get started.
        </p>
      </div>

      <div className="mt-8 rounded-md border border-neutral-200 bg-white shadow-sm">
        {(messages.length > 0 || loading) && (
          <div className="max-h-[420px] overflow-y-auto p-5 sm:p-6">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <p
                  key={i}
                  ref={i === messages.length - 1 ? latestQuestionRef : undefined}
                  className={`scroll-mt-4 text-[16px] font-bold text-[#161514] ${
                    i === 0 ? "" : "mt-6 border-t border-neutral-200 pt-6"
                  }`}
                >
                  {m.content}
                </p>
              ) : (
                <div
                  key={i}
                  className="mt-3 space-y-3 text-[16px] leading-[1.75] text-neutral-700 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5 [&_strong]:font-bold [&_strong]:text-[#161514] [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5"
                >
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              )
            )}
            {loading && (
              <p className="mt-3 text-[16px] text-neutral-400">Thinking…</p>
            )}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className={`flex items-center gap-3 p-4 ${
            messages.length > 0 || loading ? "border-t border-neutral-200" : ""
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 bg-transparent text-[16px] text-[#161514] placeholder:text-neutral-400 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="text-[15px] font-bold text-[#161514] hover:text-neutral-500 disabled:text-neutral-300"
          >
            Send
          </button>
        </form>
      </div>

      <p className="mt-2.5 text-[12px] text-neutral-500">
        AI Cover Letter answering on Christian&apos;s behalf, based on
        information he&apos;s provided.
      </p>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <div className="mt-12 flex flex-col">
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={q}
            type="button"
            onClick={() => sendMessage(q)}
            disabled={loading}
            className={`group flex items-start gap-2 border-t border-neutral-200 px-2 py-2.5 text-left text-[15px] text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-[#161514] disabled:opacity-50 ${
              i === SUGGESTED_QUESTIONS.length - 1 ? "border-b" : ""
            }`}
          >
            <span
              aria-hidden
              className="mt-0.5 shrink-0 text-neutral-400 transition-colors group-hover:text-[#161514]"
            >
              →
            </span>
            <span>{q}</span>
          </button>
        ))}
      </div>

      <div className="mt-12 border-t border-neutral-200 pt-6 text-[15px] text-neutral-600">
        <p>
          <a
            href="mailto:cvavuris@gmail.com"
            className="text-[#161514] underline underline-offset-2 hover:text-neutral-500"
          >
            cvavuris@gmail.com
          </a>
        </p>
        <p className="mt-1">
          <a
            href="tel:+14152464384"
            className="text-[#161514] underline underline-offset-2 hover:text-neutral-500"
          >
            1-415-246-4384
          </a>
        </p>
        <p className="mt-1">
          <a
            href="https://www.linkedin.com/in/cvavuris/?skipRedirect=true"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#161514] underline underline-offset-2 hover:text-neutral-500"
          >
            linkedin.com/in/cvavuris
          </a>
        </p>
      </div>
    </main>
  );
}
