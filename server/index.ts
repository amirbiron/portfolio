import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

  // --- AI Agent endpoint עבור CodeKeeper ---

  // טעינת מסמך הידע פעם אחת בעת עליית השרת
  let knowledgeDoc = "";
  try {
    const docsPath = path.resolve(__dirname, "..", "docs", "CodeBot_Features_Summary.md");
    knowledgeDoc = fs.readFileSync(docsPath, "utf-8");
  } catch {
    console.warn("Warning: CodeBot knowledge doc not found, AI agent will have limited knowledge");
  }

  const SYSTEM_PROMPT = `אתה סוכן AI המייצג את אמיר, מפתח Full-Stack ומערכות מורכבות. תפקידך הוא לענות למגייסים וללקוחות פוטנציאליים על פרויקט הדגל של אמיר: CodeBot.
כשאתה נשאל על הפרויקט, השתמש במסמך התיעוד המצורף, אך פעל לפי הכללים הבאים:
* אל תעתיק רשימות ארוכות: אם מישהו שואל 'אילו פיצ'רים יש בבוט?', תן לו 3-4 פיצ'רים מרכזיים (כמו חיפוש מתקדם, אינטגרציה עם GitHub, ולוח ה-Kanban), והצע לו לשאול על נושאים ספציפיים (למשל: 'תרצה לשמוע על הארכיטקטורה או על כלי ה-AI?').
* הדגש את החשיבה ה'שורשית': כשאתה מתאר פתרון, תסביר למה אמיר בחר בו. למשל, 'אמיר השתמש ב-Redis כדי להבטיח זמני תגובה מהירים למערכת החיפוש', או 'אמיר בנה ארכיטקטורת CI/CD מלאה עם GitHub Actions כדי להבטיח יציבות'.
* התאם את התשובה לקהל:
  - אם השאלה טכנית (למשל 'איזה מסד נתונים יש?'), פרט על MongoDB, Motor אסינכרוני, והאינדקסים.
  - אם השאלה עסקית/מוצרית (למשל 'מי קהל היעד?'), דבר על ה-Onboarding המקיף, ה-Live Preview, ומערכת ההרשאות.
* תמיד שמור על טון מקצועי, צנוע אבל בטוח בעצמו (כמו אמיר).
* ענה בעברית אלא אם השאלה נשאלה באנגלית.
* שמור על תשובות קצרות וממוקדות — עד 3-4 פסקאות. הצע לשאול שאלת המשך.

מסמך תיעוד הפרויקט:
${knowledgeDoc}`;

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

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("Missing GEMINI_API_KEY env var");
        res.status(500).json({ error: "AI service not configured" });
        return;
      }

      const { message, history } = req.body;
      if (!message || typeof message !== "string") {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      // הגבלת אורך הודעה בודדת
      const MAX_MESSAGE_LENGTH = 2000;
      if (message.length > MAX_MESSAGE_LENGTH) {
        res.status(400).json({ error: "Message too long" });
        return;
      }

      // ולידציה והגבלת היסטוריית שיחה
      const MAX_HISTORY_LENGTH = 20;
      let validatedHistory: { role: string; content: string }[] = [];
      if (Array.isArray(history)) {
        validatedHistory = history
          .slice(-MAX_HISTORY_LENGTH)
          .filter(
            (msg: unknown): msg is { role: string; content: string } =>
              typeof msg === "object" &&
              msg !== null &&
              typeof (msg as Record<string, unknown>).role === "string" &&
              typeof (msg as Record<string, unknown>).content === "string" &&
              ((msg as Record<string, unknown>).role === "user" || (msg as Record<string, unknown>).role === "assistant") &&
              ((msg as Record<string, unknown>).content as string).length <= MAX_MESSAGE_LENGTH,
          );
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // בניית היסטוריית שיחה ל-Gemini
      const chatHistory = validatedHistory.map((msg) => ({
        role: msg.role === "user" ? ("user" as const) : ("model" as const),
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history: chatHistory,
        systemInstruction: SYSTEM_PROMPT,
      });

      const result = await chat.sendMessage(message);
      const response = result.response.text();

      res.json({ response });
    } catch (err) {
      console.error("AI agent error:", err);
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
