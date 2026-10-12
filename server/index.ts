import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createAiProvider, type ChatTurn } from "./ai";
import { isKnownAgent, loadAgents } from "./agents";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// rate limiter משותף — מונע כפילות קוד בין endpoints
function createRateLimiter(maxRequests: number, windowMs: number) {
  const map = new Map<string, number[]>();

  // ניקוי רשומות ישנות כל 10 דקות
  setInterval(() => {
    const now = Date.now();
    map.forEach((timestamps, ip) => {
      const active = timestamps.filter((t: number) => now - t < windowMs);
      if (active.length === 0) map.delete(ip);
      else map.set(ip, active);
    });
  }, 10 * 60_000);

  return {
    // מחזיר true אם הבקשה חסומה
    check(ip: string): boolean {
      const now = Date.now();
      const timestamps = (map.get(ip) ?? []).filter((t) => now - t < windowMs);
      if (timestamps.length >= maxRequests) return true;
      timestamps.push(now);
      map.set(ip, timestamps);
      return false;
    },
  };
}

async function startServer() {
  const app = express();
  // Render.com מריץ מאחורי reverse proxy — נדרש כדי לקבל IP אמיתי מ-X-Forwarded-For
  app.set("trust proxy", 1);
  const server = createServer(app);

  app.use(express.json());

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  const contactLimiter = createRateLimiter(3, 60_000);
  const aiLimiter = createRateLimiter(10, 60_000);

  // שליחת הודעת יצירת קשר דרך טלגרם
  app.post("/api/contact", async (req, res) => {
    try {
      // הגנה מפני body חסר (בקשה ללא Content-Type: application/json)
      if (!req.body) {
        res.status(400).json({ error: "Request body is required" });
        return;
      }

      // rate limiting לפי IP
      if (contactLimiter.check(req.ip ?? "unknown")) {
        res.status(429).json({ error: "Too many requests. Try again later." });
        return;
      }

      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (!token || !chatId) {
        console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars");
        res.status(500).json({ error: "Server not configured for contact messages" });
        return;
      }

      const { email, message } = req.body;
      if (!email || !message) {
        res.status(400).json({ error: "Email and message are required" });
        return;
      }

      // סניטציה של קלט משתמש כדי למנוע שבירת HTML parsing בטלגרם
      const escapeHtml = (s: string) =>
        s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const text = `🚀 <b>ליד חדש מהפורטפוליו!</b>\n\n📧 <b>מאת:</b> ${escapeHtml(email)}\n💬 <b>הודעה:</b> ${escapeHtml(message)}`;

      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      });

      if (!tgRes.ok) {
        const err = await tgRes.text();
        console.error("Telegram API error:", err);
        res.status(502).json({ error: "Failed to send message" });
        return;
      }

      res.json({ ok: true });
    } catch (err) {
      console.error("Telegram send error:", err);
      res.status(502).json({ error: "Failed to send message" });
    }
  });

  // --- AI Agent endpoint — סוכן נפרד לכל פרויקט שיש לו עמוד Ask AI ---

  // טעינת מסמכי הידע והנחיות המערכת פעם אחת בעליית השרת (ראה server/agents.ts)
  const agents = loadAgents(path.resolve(__dirname, "..", "docs"));

  // אתחול ספק ה-AI פעם אחת בעליית השרת — Claude או Gemini לפי משתני הסביבה (ראה server/ai.ts)
  const aiProvider = createAiProvider();
  if (aiProvider) {
    console.log(
      `AI agent: ${aiProvider.name} (model: ${aiProvider.model}), projects: ${Array.from(agents.keys()).join(", ") || "none"}`
    );
  }

  const MAX_MESSAGE_LENGTH = 2000;
  const MAX_HISTORY_LENGTH = 20;

  app.post("/api/ask-ai", async (req, res) => {
    try {
      if (!req.body) {
        res.status(400).json({ error: "Request body is required" });
        return;
      }

      // rate limiting
      if (aiLimiter.check(req.ip ?? "unknown")) {
        res.status(429).json({ error: "Too many requests. Try again later." });
        return;
      }

      if (!aiProvider) {
        res.status(500).json({ error: "AI service not configured" });
        return;
      }

      const { project, message, history } = req.body;
      if (!project || typeof project !== "string") {
        res.status(400).json({ error: "Project is required" });
        return;
      }
      if (!isKnownAgent(project)) {
        res.status(404).json({ error: "Unknown project" });
        return;
      }
      // פרויקט מוכר שהסוכן שלו לא נטען בעלייה — הסיבה כתובה בלוג של העלייה
      const agent = agents.get(project);
      if (!agent) {
        res
          .status(500)
          .json({ error: "AI agent for this project is not configured" });
        return;
      }

      if (!message || typeof message !== "string") {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      // הגבלת אורך הודעה בודדת
      if (message.length > MAX_MESSAGE_LENGTH) {
        res.status(400).json({ error: "Message too long" });
        return;
      }

      // ולידציה והגבלת היסטוריית שיחה
      let validatedHistory: ChatTurn[] = [];
      if (Array.isArray(history)) {
        validatedHistory = history
          .slice(-MAX_HISTORY_LENGTH)
          .filter(
            (msg: unknown): msg is ChatTurn =>
              typeof msg === "object" &&
              msg !== null &&
              typeof (msg as Record<string, unknown>).role === "string" &&
              typeof (msg as Record<string, unknown>).content === "string" &&
              ((msg as Record<string, unknown>).role === "user" || (msg as Record<string, unknown>).role === "assistant") &&
              ((msg as Record<string, unknown>).content as string).length <= MAX_MESSAGE_LENGTH,
          );
      }

      const response = await aiProvider.reply(
        agent.systemPrompt,
        validatedHistory,
        message
      );

      res.json({ response });
    } catch (err) {
      console.error(`AI agent error (${aiProvider?.name}):`, err);
      res.status(502).json({ error: "Failed to get AI response" });
    }
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
