/**
 * עמוד צ'אט עם סוכן AI על פרויקט CodeKeeper
 */

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Bot, User, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AskAI() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // גלילה לתחתית בכל הודעה חדשה
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // פוקוס על שדה הקלט בעליית העמוד
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      // שליחת היסטוריית השיחה לשרת
      const history = updatedMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to get response");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "מצטער, נתקלתי בשגיאה. אפשר לנסות שוב או ליצור קשר ישירות עם אמיר.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // שליחה עם Enter (בלי Shift)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border py-4 shrink-0">
        <div className="container flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80"
            onClick={() => setLocation("/project/codekeeper")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to CodeKeeper
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-accent" />
            <span className="text-accent font-mono text-sm">
              AI Agent — CodeKeeper
            </span>
          </div>
        </div>
      </header>

      {/* הודעת פתיחה + אזור הודעות */}
      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-3xl py-8 space-y-6">
          {/* הודעת פתיחה */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="terminal-window">
                <div className="terminal-header">
                  <div className="terminal-dot border-primary" />
                  <div className="terminal-dot border-accent" />
                  <div className="terminal-dot border-destructive" />
                  <span className="text-sm text-muted-foreground ml-2">
                    ai_agent.exe
                  </span>
                </div>
                <div dir="rtl" className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Bot className="h-6 w-6 text-accent shrink-0 mt-1" />
                    <div className="space-y-3">
                      <p className="text-foreground/90">
                        <span className="text-accent font-bold">היי!</span> אני
                        סוכן ה-AI של אמיר. אני יודע הכל על{" "}
                        <span className="text-primary font-bold">
                          CodeKeeper
                        </span>{" "}
                        — פרויקט הדגל שלו.
                      </p>
                      <p className="text-foreground/70 text-sm">
                        אפשר לשאול אותי על הארכיטקטורה, הטכנולוגיות, הפיצ'רים,
                        או כל שאלה אחרת על הפרויקט. למשל:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          "מה הפרויקט הזה עושה?",
                          "איזה טכנולוגיות נמצאות בשימוש?",
                          "מה האתגר הטכני הגדול ביותר?",
                        ].map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => {
                              setInput(suggestion);
                              textareaRef.current?.focus();
                            }}
                            className="text-xs px-3 py-1.5 bg-primary/10 border border-primary text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* הודעות */}
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "assistant" && (
                <Bot className="h-6 w-6 text-accent shrink-0 mt-1" />
              )}
              <div
                dir="rtl"
                className={`max-w-[80%] p-4 whitespace-pre-wrap text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary/20 border border-primary text-foreground"
                    : "terminal-window"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="space-y-1">
                    <div className="terminal-header !p-0 !border-0 !mb-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        response.md
                      </span>
                    </div>
                    <div className="text-foreground/90">{msg.content}</div>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <User className="h-6 w-6 text-primary shrink-0 mt-1" />
              )}
            </motion.div>
          ))}

          {/* אינדיקטור טעינה */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <Bot className="h-6 w-6 text-accent shrink-0 mt-1" />
              <div className="terminal-window p-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="font-mono">Processing query...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* שדה קלט */}
      <div className="border-t border-border p-4 shrink-0">
        <form
          onSubmit={handleSubmit}
          className="container max-w-3xl flex gap-3"
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="שאלו אותי על CodeKeeper..."
            dir="rtl"
            rows={1}
            className="bg-muted border-border text-foreground font-mono resize-none flex-1 min-h-[44px] max-h-[120px]"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-accent text-accent-foreground hover:bg-accent/90 neon-border shrink-0 self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
