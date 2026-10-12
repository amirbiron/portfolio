import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";

// הודעה בהיסטוריית השיחה, בצורה שהפרונט שולח אותה
export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AiProvider {
  name: "claude" | "gemini";
  model: string;
  /**
   * שולח את ההודעה יחד עם היסטוריית השיחה ומחזיר את טקסט התשובה.
   * ערוץ הכשל היחיד הוא זריקה — כולל סירוב של המודל ותשובה בלי טקסט,
   * כדי שהמשתמש לא יקבל בועה ריקה כאילו הכל תקין.
   */
  reply(history: ChatTurn[], message: string): Promise<string>;
}

const DEFAULT_CLAUDE_MODEL = "claude-opus-5-5";
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

// דדליין משלנו לקריאה ל-Claude: ברירת המחדל של ה-SDK היא 10 דקות לכל ניסיון
// ו-2 ניסיונות חוזרים, והפרונט מחכה בלי timeout משלו — בקשה תקועה הייתה
// משאירה את המשתמש מול ספינר. מקור: ClientOptions ב-@anthropic-ai/sdk/client.d.ts
const CLAUDE_TIMEOUT_MS = 60_000;
const CLAUDE_MAX_RETRIES = 1;

// תקרת הפלט כוללת גם את טוקני החשיבה של המודל, ולכן היא רחבה בהרבה מאורך תשובה רגילה
const CLAUDE_MAX_TOKENS = 16_000;

// ערך ריק או רווחים בלבד נחשב "לא הוגדר" — אין משמעות למודל או למפתח ריקים
function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/**
 * בוחר ספק AI לפי משתני הסביבה:
 * - `AI_PROVIDER=claude` או `AI_PROVIDER=gemini` — בחירה מפורשת.
 * - בלי `AI_PROVIDER`: Claude כש-`ANTHROPIC_API_KEY` מוגדר, אחרת Gemini כש-`GEMINI_API_KEY` מוגדר.
 * - המודל: `ANTHROPIC_MODEL` / `GEMINI_MODEL`, עם ברירת מחדל לכל ספק.
 *
 * מחזיר null כשאין ספק זמין. אין נפילה שקטה לספק השני: ספק שנבחר במפורש
 * בלי מפתח משבית את הסוכן עם אזהרה, ושאר השרת ממשיך לעבוד.
 */
export function createAiProvider(systemPrompt: string): AiProvider | null {
  const anthropicKey = readEnv("ANTHROPIC_API_KEY");
  const geminiKey = readEnv("GEMINI_API_KEY");
  const requested = readEnv("AI_PROVIDER")?.toLowerCase();

  let name: AiProvider["name"];
  if (requested === undefined) {
    if (anthropicKey) name = "claude";
    else if (geminiKey) name = "gemini";
    else {
      console.warn(
        "Warning: neither ANTHROPIC_API_KEY nor GEMINI_API_KEY is set, AI agent will be unavailable"
      );
      return null;
    }
  } else if (requested === "claude" || requested === "gemini") {
    name = requested;
  } else {
    console.warn(
      `Warning: unknown AI_PROVIDER "${requested}" (expected "claude" or "gemini"), AI agent will be unavailable`
    );
    return null;
  }

  // אתחול שנכשל מוריד את הסוכן בלבד, לא את עליית השרת כולו
  try {
    if (name === "claude") {
      if (!anthropicKey) {
        console.warn(
          "Warning: AI_PROVIDER is claude but ANTHROPIC_API_KEY is not set, AI agent will be unavailable"
        );
        return null;
      }
      const model = readEnv("ANTHROPIC_MODEL") ?? DEFAULT_CLAUDE_MODEL;
      return createClaudeProvider(anthropicKey, model, systemPrompt);
    }

    if (!geminiKey) {
      console.warn(
        "Warning: AI_PROVIDER is gemini but GEMINI_API_KEY is not set, AI agent will be unavailable"
      );
      return null;
    }
    const model = readEnv("GEMINI_MODEL") ?? DEFAULT_GEMINI_MODEL;
    return createGeminiProvider(geminiKey, model, systemPrompt);
  } catch (err) {
    console.error(
      `Failed to initialize ${name} AI provider, AI agent will be unavailable:`,
      err
    );
    return null;
  }
}

function createClaudeProvider(
  apiKey: string,
  model: string,
  systemPrompt: string
): AiProvider {
  const client = new Anthropic({
    apiKey,
    timeout: CLAUDE_TIMEOUT_MS,
    maxRetries: CLAUDE_MAX_RETRIES,
  });

  return {
    name: "claude",
    model,
    async reply(history, message) {
      const response = await client.beta.messages.create({
        model,
        max_tokens: CLAUDE_MAX_TOKENS,
        // הנחיית המערכת (כולל מסמך הידע הגדול) זהה בכל בקשה. נקודת cache מפורשת
        // בסופה נותנת קריאה מה-cache גם לשיחות של מבקרים שונים, והנקודה האוטומטית
        // ברמת הבקשה מכסה את השיחה שהולכת ומתארכת — שתיהן יחד מותרות.
        // מקור: https://platform.claude.com/docs/en/build-with-claude/prompt-caching
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" },
          },
        ],
        cache_control: { type: "ephemeral" },
        messages: [
          ...history.map(turn => ({ role: turn.role, content: turn.content })),
          { role: "user", content: message },
        ],
        // כשמסווג בטיחות של המודל מסרב, ה-API מריץ את אותה בקשה על המודל החלופי
        // שמומלץ לקטגוריית הסירוב, בתוך אותה קריאה. במודל בלי חלופה (Haiku 5.5)
        // הסירוב פשוט נשאר. מודלים מדור 4.x לא מוזכרים בתיעוד — לא נבדק מולם.
        // מקור: https://platform.claude.com/docs/en/build-with-claude/refusals-and-fallback
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });

      if (response.stop_reason === "refusal") {
        throw new Error(
          `Claude refused the request (category: ${response.stop_details?.category ?? "unknown"})`
        );
      }

      // התוכן יכול לכלול גם בלוקי thinking ו-fallback; למשתמש מוצג רק הטקסט.
      // בבקשה בלי streaming, פלט חלקי של מודל שסירב לא נכלל בתשובה.
      const text = response.content
        .flatMap(block => (block.type === "text" ? [block.text] : []))
        .join("");

      if (!text.trim()) {
        throw new Error(
          `Claude returned no text (stop_reason: ${response.stop_reason})`
        );
      }
      if (
        response.stop_reason === "max_tokens" ||
        response.stop_reason === "model_context_window_exceeded"
      ) {
        // התשובה נקטעה באמצע: החלק שנכתב מוחזר עם סימון גלוי, ולא כאילו הוא שלם,
        // ונרשם בלוג כדי שאפשר יהיה לספור כמה פעמים זה קורה
        console.warn(
          `Claude response was cut off (stop_reason: ${response.stop_reason})`
        );
        return `${text}\n\n*(התשובה נקטעה)*`;
      }
      return text;
    },
  };
}

function createGeminiProvider(
  apiKey: string,
  model: string,
  systemPrompt: string
): AiProvider {
  const ai = new GoogleGenAI({ apiKey });

  return {
    name: "gemini",
    model,
    async reply(history, message) {
      // בניית היסטוריית שיחה ל-Gemini
      const chat = ai.chats.create({
        model,
        history: history.map(turn => ({
          role: turn.role === "user" ? ("user" as const) : ("model" as const),
          parts: [{ text: turn.content }],
        })),
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const result = await chat.sendMessage({ message });
      const text = result.text ?? "";
      if (!text.trim()) {
        throw new Error("Gemini returned no text");
      }
      return text;
    },
  };
}
