import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // שליחת הודעת יצירת קשר דרך טלגרם
  app.post("/api/contact", async (req, res) => {
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

    try {
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
