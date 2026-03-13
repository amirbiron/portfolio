/**
 * עמוד פרויקט מפורט — צילומי מסך, תיאור מורחב, ארכיטקטורה (Mermaid)
 */

import { Button } from "@/components/ui/button";
import {
  Github,
  ExternalLink,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import mermaid from "mermaid";

// אתחול Mermaid עם ערכת נושא כהה
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#00ff41",
    primaryTextColor: "#e0e0e0",
    primaryBorderColor: "#00ff41",
    lineColor: "#00f5ff",
    secondaryColor: "#1a1a2e",
    tertiaryColor: "#0d0d1a",
    background: "#0d0d1a",
    mainBkg: "#1a1a2e",
    nodeBorder: "#00ff41",
    clusterBkg: "#1a1a2e",
    clusterBorder: "#00f5ff",
    titleColor: "#00ff41",
    edgeLabelBackground: "#1a1a2e",
  },
});

interface ProjectData {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  screenshots: string[];
  mermaidDiagram: string;
  demo: string;
  demoLabel?: string;
  repo: string;
  repoLabel?: string;
  challenges: string[];
  features: string[];
}

const projects: ProjectData[] = [
  {
    slug: "codekeeper",
    title: "CodeKeeper",
    subtitle: "בוט טלגרם + אפליקציית ווב לגיבוי ושמירת קוד",
    description:
      "CodeKeeper (Codely) הוא פלטפורמה מלאה לניהול קוד — בוט טלגרם שמאפשר לשמור קטעי קוד, לגבות ריפוזיטורי מ-GitHub, לחפש בקוד, ולנהל קבצים גדולים. כולל אפליקציית ווב עם דשבורד, דפדפן ריפוזיטורי, ספריית snippets קהילתית, ומערכת Bookmarks.",
    tech: [
      "Python",
      "Flask",
      "Telegram Bot API",
      "GitHub API",
      "MongoDB",
      "Redis",
      "Docker",
      "OpenTelemetry",
      "Prometheus",
      "Grafana",
    ],
    screenshots: [
      "/projects/Screenshot_20260313_202612_Telegram.jpg",
      "/projects/Screenshot_20260313_202856_Telegram.jpg",
    ],
    mermaidDiagram: `graph TB
    subgraph Clients["לקוחות"]
        TG["Telegram Client"]
        Browser["Web Browser"]
    end
    subgraph TelegramBot["Telegram Bot Layer"]
        Main["main.py - Entry Point"]
        Handlers["handlers/ - Conversation Flows"]
    end
    subgraph WebApp["Flask WebApp"]
        FlaskApp["Flask Application"]
        Routes["Routes - Auth, Dashboard, Files, Repo, Settings"]
        APIs["REST APIs - Collections, Bookmarks, Backup, Code Tools"]
    end
    subgraph Services["Services Layer"]
        CoreServices["AI Explain, Code Formatter, Code Execution, Embedding"]
        IntegrationServices["GitHub, Google Drive, Repo Sync, Git Mirror"]
        SearchServices["Repo Search, Code Indexer, Query Profiler"]
    end
    subgraph DataLayer["Database Layer"]
        MongoDB[("MongoDB")]
        Redis[("Redis Cache")]
    end
    subgraph External["External"]
        GitHubAPI["GitHub API"]
        GDriveAPI["Google Drive API"]
        TelegramAPI["Telegram Bot API"]
    end
    subgraph Observability["Observability"]
        Sentry["Sentry"]
        Prometheus["Prometheus"]
        Grafana["Grafana"]
    end
    TG --> TelegramAPI
    TelegramAPI --> Main
    Browser --> FlaskApp
    Main --> Handlers
    Handlers --> Services
    FlaskApp --> Routes
    FlaskApp --> APIs
    Routes --> Services
    APIs --> Services
    Services --> DataLayer
    IntegrationServices --> GitHubAPI
    IntegrationServices --> GDriveAPI
    DataLayer --> MongoDB
    DataLayer --> Redis
    Main -.-> Sentry
    FlaskApp -.-> Sentry
    Prometheus -.-> Grafana`,
    demo: "https://code-keeper-webapp.onrender.com",
    repo: "https://github.com/amirbiron/CodeBot",
    challenges: [
      "ניהול קבצים גדולים (מעל 20MB) דרך Telegram עם חלוקה אוטומטית",
      "אינדקסור קוד עם Embeddings לחיפוש סמנטי",
      "ארכיטקטורת Domain-Driven Design עם הפרדת שכבות מלאה",
      "מערכת Observability מלאה — Prometheus, Grafana, Sentry, Jaeger",
    ],
    features: [
      "שמירת קוד וקטעי Snippet דרך טלגרם",
      "גיבוי אוטומטי של ריפוזיטורי GitHub",
      "דפדפן ריפוזיטורי מלא באפליקציית הווב",
      "חיפוש סמנטי בקוד עם AI",
      "ספריית Snippets קהילתית",
      "ייצוא ל-Google Drive ו-Pastebin",
    ],
  },
  {
    slug: "modularbot",
    title: "ModularBot",
    subtitle: "בוט ליצירת בוטים — מהרעיון לבוט עובד ב-10 דקות",
    description:
      "ModularBot הוא מפעל בוטים אוטומטי. המשתמש שולח טוקן מ-BotFather ומתאר מה הבוט צריך לעשות, ותוך דקות הבוט נבנה, נדחף ל-GitHub, ומתחיל לרוץ אוטומטית. משתמש ב-Claude AI לכתיבת הקוד, ומערכת Plugin דינמית לניהול כל הבוטים.",
    tech: [
      "Python",
      "Flask",
      "Telegram Bot API",
      "Anthropic Claude API",
      "GitHub API",
      "MongoDB",
    ],
    screenshots: [
      "/projects/Screenshot_20260313_204900_Telegram.jpg",
      "/projects/Screenshot_20260313_210121_Telegram.jpg",
    ],
    mermaidDiagram: `graph TB
    subgraph Users["משתמשים"]
        TelegramUser["Telegram User"]
        WebAdmin["Web Admin"]
    end
    subgraph FlaskApp["Flask Application"]
        Router["Request Router"]
        PluginLoader["Dynamic Plugin Loader"]
        Dashboard["Dashboard"]
        WebhookRoute["Webhook - POST /token"]
    end
    subgraph PluginSystem["Plugin System"]
        Architect["architect.py - Bot Creation Wizard"]
        Bot1["bot_XXX.py - Generated Bot 1"]
        Bot2["bot_YYY.py - Generated Bot 2"]
    end
    subgraph BotFactory["Bot Factory Flow"]
        Step1["1. User describes bot"]
        Step2["2. Claude AI generates code"]
        Step3["3. Push to GitHub"]
        Step4["4. Register webhook"]
        Step5["5. Bot goes live"]
    end
    subgraph Storage["Storage"]
        MongoDB[("MongoDB - bot_registry, bot_flows, funnel_events")]
    end
    subgraph External["External Services"]
        TelegramAPI["Telegram Bot API"]
        ClaudeAI["Anthropic Claude API"]
        GitHubAPI["GitHub API"]
        RenderCom["Render.com - Auto-Deploy"]
    end
    TelegramUser --> WebhookRoute
    WebAdmin --> Dashboard
    WebhookRoute --> Router
    Router --> PluginLoader
    PluginLoader --> Architect
    PluginLoader --> Bot1
    PluginLoader --> Bot2
    Architect --> Step1
    Step1 --> Step2
    Step2 --> Step3
    Step3 --> Step4
    Step4 --> Step5
    Step2 --> ClaudeAI
    Step3 --> GitHubAPI
    Step4 --> TelegramAPI
    GitHubAPI --> RenderCom
    Router --> MongoDB`,
    demo: "https://t.me/ModularBot_V2_bot",
    repo: "https://github.com/amirbiron/Modular_Bot_V2",
    challenges: [
      "יצירת קוד דינמי עם Claude AI שעובד בפרודקשן בלי התערבות",
      "מערכת Plugin שטוענת בוטים חדשים בזמן ריצה בלי restart",
      "ניתוב Webhook יחיד שמפנה הודעות לבוט הנכון מתוך עשרות בוטים",
      "Conversion Funnel Analytics לניטור תהליך יצירת בוטים",
    ],
    features: [
      "יצירת בוט מלא מתיאור בטקסט חופשי",
      "דחיפה אוטומטית ל-GitHub + Deploy אוטומטי",
      "דשבורד ווב עם ווידג'טים לכל בוט",
      "מערכת Plugin דינמית עם Cache",
      "ניטור Funnel Analytics",
    ],
  },
  {
    slug: "markdownbot",
    title: "MarkdownBot",
    subtitle: "בוט אינטראקטיבי ללימוד Markdown עם תרגילים וגיימיפיקציה",
    description:
      "MarkdownBot מלמד Markdown בצורה מהנה — 15+ שיעורים, אימונים ממוקדים לפי נושא, סנדבוקס לרינדור Markdown לתמונה, מערכת Gamification עם ניקוד ורמות, וספריית תבניות קהילתית. כולל גם אפליקציית ווב (Markdown Academy) עם מדריכים אינטראקטיביים.",
    tech: [
      "Node.js",
      "Telegram Bot API",
      "Puppeteer",
      "marked.js",
      "SQLite",
      "Express",
    ],
    screenshots: [
      "/projects/Screenshot_20260313_212337_Telegram.jpg",
      "/projects/Screenshot_20260313_212430_Telegram.jpg",
      "/projects/Screenshot_20260313_212549_Chrome.jpg",
      "/projects/Screenshot_20260313_212721_Chrome.jpg",
    ],
    mermaidDiagram: `graph TB
    subgraph Users["משתמשים"]
        Student["Telegram User"]
    end
    subgraph TelegramBot["Telegram Bot"]
        TBot["node-telegram-bot-api - Polling"]
        Commands["/start /next /train /sandbox /progress /templates /tips"]
    end
    subgraph Modes["User Modes"]
        NormalMode["Normal Mode - Lessons"]
        SandboxMode["Sandbox Mode - MD to Image"]
        TrainingMode["Training Mode - Challenges"]
    end
    subgraph LessonEngine["Lesson Engine"]
        Lessons["15+ Lessons"]
        Quiz["Quiz System"]
    end
    subgraph RenderEngine["Render Engine"]
        Marked["marked.js - MD to HTML"]
        Puppeteer["Puppeteer - HTML to PNG"]
        Themes["5+ Visual Themes"]
    end
    subgraph Gamification["Gamification"]
        Scoring["Score System"]
        Levels["Beginner to Master"]
        Badges["Achievement Badges"]
    end
    subgraph Storage["Storage"]
        SQLite[("SQLite - users, progress, lessons, templates")]
    end
    Student --> TBot
    TBot --> Commands
    Commands --> NormalMode
    Commands --> SandboxMode
    Commands --> TrainingMode
    NormalMode --> LessonEngine
    Lessons --> Quiz
    Quiz --> Scoring
    SandboxMode --> RenderEngine
    Marked --> Puppeteer
    Puppeteer --> Themes
    Scoring --> Levels
    Scoring --> Badges
    LessonEngine --> SQLite
    Gamification --> SQLite`,
    demo: "https://t.me/markdown_trainer_bot",
    repo: "https://github.com/amirbiron/MarkdownBot",
    challenges: [
      "רינדור Markdown לתמונה עם Puppeteer ותמיכה ב-5 ערכות עיצוב",
      "מערכת חינוכית עם זיהוי נקודות חולשה ותרגילים ממוקדים",
      "תמיכה ב-Mermaid diagrams בתוך הסנדבוקס",
      "מערכת תבניות קהילתית עם אישור אדמין",
    ],
    features: [
      "15+ שיעורים אינטראקטיביים עם חידונים",
      "סנדבוקס — שליחת Markdown ורינדור לתמונה",
      "אימונים ממוקדים לפי נושא (טבלאות, לינקים, Mermaid...)",
      "מערכת ניקוד ורמות (Beginner → Master)",
      "אפליקציית ווב — Markdown Academy",
    ],
  },
  {
    slug: "fb-leads-scanner",
    title: "FB Leads Scanner",
    subtitle: "סורק קבוצות פייסבוק אוטומטי עם סיווג AI + פאנל ניהול",
    description:
      "סורק אוטומטי שעובר על קבוצות פייסבוק, מזהה פוסטים שרלוונטיים כלידים באמצעות AI, ושולח התראות לטלגרם. כולל פאנל ווב מלא לניהול קבוצות, מילות מפתח, הגדרות סריקה, ודשבורד סטטיסטיקות.",
    tech: [
      "Python",
      "Flask",
      "Playwright",
      "OpenAI API",
      "SQLite",
      "Telegram Bot API",
    ],
    screenshots: [
      "/projects/Screenshot_20260313_213118_Chrome.jpg",
      "/projects/Screenshot_20260313_213141_Chrome.jpg",
      "/projects/Screenshot_20260313_203519_Chrome.jpg",
      "/projects/Screenshot_20260313_203916_Chrome.jpg",
    ],
    mermaidDiagram: `graph TB
    subgraph Users["משתמשים"]
        Owner["Bot Owner - Telegram"]
        WebAdmin["Web Admin"]
    end
    subgraph MainLoop["Main Scan Loop"]
        Scheduler["Scheduler - Every N minutes"]
        QuietHours["Quiet Hours Check"]
    end
    subgraph Scraper["Scraper - Playwright"]
        Browser["Headless Chromium"]
        PostExtractor["Post Extractor - DOM Parsing"]
    end
    subgraph FilterPipeline["Filter Pipeline"]
        Dedup["Deduplication"]
        AgeFilter["Age Filter"]
        BlockedUsers["Blocked Users"]
        PreFilter["Pre-Filter Keywords"]
    end
    subgraph Classifier["AI Classifier"]
        BatchClassify["Batch Classification - 5 posts/request"]
        ModelFallback["Fallback: gpt-4.1-mini to gpt-4o-mini"]
    end
    subgraph WebPanel["Web Panel - Flask"]
        Dashboard["Scan Status Dashboard"]
        Settings["Groups, Keywords, AI Prompt, Quiet Hours"]
    end
    subgraph Storage["Storage"]
        SQLite[("SQLite - seen_posts, sent_leads, groups, keywords")]
    end
    subgraph External["External"]
        Facebook["Facebook - m.facebook.com"]
        OpenAI["OpenAI API"]
        TelegramAPI["Telegram Bot API"]
    end
    Owner --> TelegramAPI
    WebAdmin --> WebPanel
    Scheduler --> QuietHours
    QuietHours --> Scraper
    Browser --> Facebook
    PostExtractor --> FilterPipeline
    Dedup --> AgeFilter
    AgeFilter --> BlockedUsers
    BlockedUsers --> PreFilter
    PreFilter --> Classifier
    BatchClassify --> OpenAI
    BatchClassify --> ModelFallback
    Classifier --> TelegramAPI
    WebPanel --> SQLite
    Scraper --> SQLite
    Classifier --> SQLite`,
    demo: "https://amirbiron.github.io/Landing_FB_Lids/",
    demoLabel: "Landing Page",
    repo: "#",
    challenges: [
      "Scraping של פייסבוק עם Playwright וחסימת משאבים לחיסכון בזיכרון",
      "מערכת Deduplication חוצת-קבוצות (post_id hash + content_hash)",
      "סיווג AI ב-Batch (5 פוסטים לבקשה) עם Fallback בין מודלים",
      "ריצה על 512MB RAM ב-Render עם ניהול זיכרון אופטימלי",
    ],
    features: [
      "סריקה אוטומטית לפי לוח זמנים + שעות שקט",
      "סיווג AI חכם עם prompt מותאם לכל סוג ליד",
      "פאנל ווב מלא — סטטיסטיקות, קבוצות, מילות מפתח, חסימות",
      "התראות טלגרם עם מילות Hot Word",
      "פילטר מרובה שלבים — גיל, כפילויות, מילות חסימה",
    ],
  },
  {
    slug: "ai-business-bot",
    title: "AI Business Bot",
    subtitle: "צ'אטבוט AI לשירות לקוחות 24/7 עם זימון תורים ופאנל ניהול",
    description:
      "בוט AI שלומד את העסק שלך ועונה ללקוחות 24/7 בטלגרם. כולל מערכת RAG (Retrieval-Augmented Generation) עם 3 שכבות LLM, זימון תורים אוטומטי, מצב חופשה, שעות פעילות עם לוח חגים ישראלי, ופאנל ניהול מלא.",
    tech: [
      "Python",
      "Flask",
      "HTMX",
      "OpenAI API",
      "FAISS",
      "SQLite",
      "Telegram Bot API",
    ],
    screenshots: [
      "/projects/Screenshot_20260313_215842_Telegram.jpg",
      "/projects/Screenshot_20260313_213735_Chrome.jpg",
    ],
    mermaidDiagram: `graph TB
    subgraph Users["משתמשים"]
        Customer["Telegram User - Customer"]
        Admin["Admin - Business Owner"]
    end
    subgraph TelegramBot["Telegram Bot"]
        TBot["python-telegram-bot v20+"]
        Commands["/start /help /stop /subscribe"]
        Buttons["Price List, Book Appointment, Location, Talk to Agent"]
    end
    subgraph AdminPanel["Admin Panel - Flask + HTMX"]
        Dashboard["Dashboard"]
        KBManager["Knowledge Base Manager"]
        LiveChat["Live Chat Interface"]
        ApptManager["Appointments"]
        Broadcast["Broadcast Messages"]
    end
    subgraph RAGPipeline["RAG Pipeline"]
        Chunker["Chunker - Hebrew-aware"]
        Embeddings["Embeddings - text-embedding-3-small"]
        VectorStore["FAISS Vector Store"]
        RAGEngine["RAG Orchestrator"]
    end
    subgraph LLMLayer["LLM - 3 Tier"]
        LayerA["Layer A - System and Behavior"]
        LayerB["Layer B - Context and RAG"]
        LayerC["Layer C - Quality Check"]
    end
    subgraph Services["Services"]
        RateLimiter["Rate Limiter"]
        LiveChatSvc["Live Chat - Agent Takeover"]
        Vacation["Vacation Mode"]
        BizHours["Business Hours + Israeli Holidays"]
    end
    subgraph Storage["Storage"]
        SQLite[("SQLite - kb_entries, conversations, appointments, settings")]
    end
    subgraph External["External"]
        OpenAI["OpenAI API"]
        TelegramAPI["Telegram Bot API"]
    end
    Customer --> TBot
    Admin --> AdminPanel
    TBot --> RateLimiter
    RateLimiter --> LiveChatSvc
    LiveChatSvc --> Vacation
    Vacation --> RAGEngine
    RAGEngine --> Chunker
    RAGEngine --> Embeddings
    RAGEngine --> VectorStore
    RAGEngine --> LLMLayer
    LayerA --> LayerB
    LayerB --> LayerC
    Embeddings --> OpenAI
    LLMLayer --> OpenAI
    TBot --> TelegramAPI
    KBManager --> RAGEngine
    AdminPanel --> SQLite
    RAGEngine --> SQLite`,
    demo: "https://t.me/ai_business2U_bot",
    repo: "https://amirbiron.github.io/landing-page/",
    repoLabel: "Landing Page",
    challenges: [
      "מערכת RAG עם 3 שכבות LLM — התנהגות, הקשר, ובקרת איכות",
      "Chunker מותאם לעברית עם tiktoken",
      "מעבר חי בין בוט AI לנציג אנושי (Agent Takeover)",
      "לוח חגים ישראלי לשעות פעילות אוטומטיות",
    ],
    features: [
      "מענה AI 24/7 מבוסס בסיס ידע של העסק",
      "זימון תורים אוטומטי עם תזכורות",
      "מצב Live Chat — העברה לנציג אנושי",
      "מצב חופשה עם הודעה אוטומטית",
      "Broadcast — שליחת הודעות מרוכזות לכל המשתמשים",
      "פאנל ניהול מלא עם HTMX",
    ],
  },
];

// קומפוננטת רינדור Mermaid
function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;
      const id = `mermaid-${Date.now()}`;
      try {
        const { svg } = await mermaid.render(id, chart);
        containerRef.current.innerHTML = svg;
      } catch {
        containerRef.current.innerHTML =
          '<p class="text-destructive">שגיאה ברינדור הדיאגרמה</p>';
      }
    };
    renderDiagram();
  }, [chart]);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-x-auto [&_svg]:mx-auto [&_svg]:max-w-full"
    />
  );
}

// גלריית צילומי מסך עם Lightbox
function ScreenshotGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  const goNext = useCallback(() => {
    if (selected === null) return;
    setSelected((selected + 1) % images.length);
  }, [selected, images.length]);

  const goPrev = useCallback(() => {
    if (selected === null) return;
    setSelected((selected - 1 + images.length) % images.length);
  }, [selected, images.length]);

  // מקשי מקלדת לניווט
  useEffect(() => {
    if (selected === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "ArrowRight") goPrev(); // RTL
      if (e.key === "ArrowLeft") goNext(); // RTL
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected, goNext, goPrev]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((src, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="cursor-pointer group"
            onClick={() => setSelected(idx)}
          >
            <div className="terminal-window overflow-hidden">
              <div className="terminal-header">
                <div className="terminal-dot border-primary" />
                <div className="terminal-dot border-accent" />
                <div className="terminal-dot border-destructive" />
              </div>
              <img
                src={src}
                alt={`Screenshot ${idx + 1}`}
                className="w-full aspect-[9/16] object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-4 right-4 text-foreground z-50"
              onClick={() => setSelected(null)}
            >
              <X className="h-6 w-6" />
            </Button>

            {images.length > 1 && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground z-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    goPrev();
                  }}
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground z-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    goNext();
                  }}
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
              </>
            )}

            <motion.img
              key={selected}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={images[selected]}
              alt={`Screenshot ${selected + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="absolute bottom-4 text-sm text-muted-foreground">
              {selected + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ProjectPage() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();

  const project = projects.find((p) => p.slug === params.slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="terminal-window p-8 text-center">
          <p className="text-destructive text-lg mb-4">
            פרויקט לא נמצא
          </p>
          <Button onClick={() => setLocation("/")}>
            <ArrowRight className="mr-2 h-4 w-4" />
            חזרה לדף הבית
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="container flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-primary hover:text-primary/80"
            onClick={() => setLocation("/")}
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה לפורטפוליו
          </Button>
          <div className="flex gap-3">
            <Button
              size="sm"
              className="bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => {
                if (project.demo !== "#") window.open(project.demo, "_blank");
              }}
            >
              <ExternalLink className="mr-2 h-3 w-3" />
              {project.demoLabel || "Demo"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
              onClick={() => {
                if (project.repo !== "#") window.open(project.repo, "_blank");
              }}
            >
              {project.repoLabel ? (
                <ExternalLink className="mr-2 h-3 w-3" />
              ) : (
                <Github className="mr-2 h-3 w-3" />
              )}
              {project.repoLabel || "Code"}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16">
        <div className="container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary neon-glow mb-3">
              {project.title}
            </h1>
            <p
              dir="rtl"
              className="text-xl text-foreground/90 mb-6"
            >
              {project.subtitle}
            </p>
            <p
              dir="rtl"
              className="text-foreground/70 leading-relaxed max-w-3xl mb-8"
            >
              {project.description}
            </p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 bg-primary/10 border border-primary text-primary"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Screenshots */}
      <section className="py-16 bg-card/50">
        <div className="container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-accent neon-glow mb-8">
              $ ls ./screenshots
            </h2>
          </motion.div>
          <ScreenshotGallery images={project.screenshots} />
        </div>
      </section>

      {/* Features & Challenges */}
      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Features */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="terminal-window h-full">
                <div className="terminal-header">
                  <div className="terminal-dot border-primary" />
                  <div className="terminal-dot border-accent" />
                  <div className="terminal-dot border-destructive" />
                  <span className="text-sm text-muted-foreground ml-2">
                    features.md
                  </span>
                </div>
                <div dir="rtl" className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-primary mb-4">
                    פיצ'רים עיקריים
                  </h3>
                  {project.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">▸</span>
                      <span className="text-foreground/80 text-sm">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Challenges */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="terminal-window h-full">
                <div className="terminal-header">
                  <div className="terminal-dot border-primary" />
                  <div className="terminal-dot border-accent" />
                  <div className="terminal-dot border-destructive" />
                  <span className="text-sm text-muted-foreground ml-2">
                    challenges.md
                  </span>
                </div>
                <div dir="rtl" className="p-6 space-y-3">
                  <h3 className="text-lg font-bold text-accent mb-4">
                    אתגרים טכניים
                  </h3>
                  {project.challenges.map((c, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-accent mt-0.5">▸</span>
                      <span className="text-foreground/80 text-sm">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="py-16 bg-card/50">
        <div className="container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-destructive neon-glow mb-8">
              $ cat architecture.mmd
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dot border-primary" />
                <div className="terminal-dot border-accent" />
                <div className="terminal-dot border-destructive" />
                <span className="text-sm text-muted-foreground ml-2">
                  {project.slug}.architecture.mmd
                </span>
              </div>
              <div className="p-6">
                <MermaidDiagram chart={project.mermaidDiagram} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 border-t border-border">
        <div className="container max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <Button
            variant="ghost"
            className="text-primary"
            onClick={() => setLocation("/")}
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            חזרה לפורטפוליו
          </Button>
          <div className="flex gap-3">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 neon-border"
              onClick={() => {
                if (project.demo !== "#") window.open(project.demo, "_blank");
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              {project.demoLabel || "Demo"}
            </Button>
            <Button
              variant="outline"
              className="border-accent text-accent hover:bg-accent/10"
              onClick={() => {
                if (project.repo !== "#") window.open(project.repo, "_blank");
              }}
            >
              {project.repoLabel ? (
                <ExternalLink className="mr-2 h-4 w-4" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              {project.repoLabel || "Code"}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
