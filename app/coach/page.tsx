"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiFetch("/api/coach/history")
      .then((data) => setMessages(data.messages || []))
      .catch((err) => setError(err.message))
      .finally(() => setHistoryLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/api/coach/chat", {
        method: "POST",
        body: JSON.stringify({ message: trimmed }),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get response");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    try {
      await apiFetch("/api/coach/history", { method: "DELETE" });
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear history");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-4 py-4 sm:px-8">
        <h1 className="text-xl font-semibold sm:text-2xl">Career Coach</h1>
        <div className="flex items-center gap-4">
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">Dashboard</a>
          <button onClick={handleClear} className="text-sm text-gray-500 hover:text-red-600">
            Clear chat
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {historyLoading ? (
            <p className="text-sm text-gray-500">Loading conversation...</p>
          ) : messages.length === 0 ? (
            <div className="mx-auto max-w-md rounded-lg border bg-white p-6 text-center shadow-sm">
              <p className="text-gray-600">
                Ask me anything about your career path, resume, or how to prep for interviews.
                I know your profile and resume, so feel free to be specific.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                      msg.role === "user"
                        ? "bg-black text-white"
                        : "border bg-white text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-lg border bg-white px-4 py-2 text-sm text-gray-400">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="mx-auto max-w-2xl px-4 pb-2 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSend} className="border-t bg-white p-4 sm:p-6">
          <div className="mx-auto flex max-w-2xl gap-2">
            <input
              className="flex-1 rounded border px-3 py-2"
              placeholder="Ask your career coach..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded bg-black px-5 py-2 text-white disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
