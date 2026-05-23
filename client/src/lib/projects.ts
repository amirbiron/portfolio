/**
 * מידע על הפרויקטים — מקור יחיד לדף הבית ולעמודי הפרויקטים
 */

export interface ProjectData {
  slug: string;
  title: string;
  /** תיאור קצר לכרטיס בדף הבית */
  description: string;
  /** תת-כותרת לעמוד הפרויקט */
  subtitle: string;
  /** תיאור מורחב לעמוד הפרויקט */
  fullDescription: string;
  tech: string[];
  /** תמונת כרטיס בדף הבית (URL חיצוני או ריק) */
  image: string;
  /** מיקום התמונה בכרטיס — ברירת מחדל center */
  imagePosition?: string;
  screenshots: string[];
  mermaidDiagram: string;
  demo: string;
  demoLabel?: string;
  repo: string;
  repoLabel?: string;
  challenges: string[];
  features: string[];
}

export const projects: ProjectData[] = [
  {
    slug: "ai-business-bot",
    title: "AI Business Bot",
    description:
      "בוט שלומד את העסק שלך, עונה ללקוחות 24/7, ומציע תורים אוטומטית + פאנל ווב לניהול",
    subtitle: "צ'אטבוט AI לשירות לקוחות 24/7 עם זימון תורים ופאנל ניהול",
    fullDescription:
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
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036748622/C8CMzJWXcynJDR75BV9TgK/ai-business-bot-n5bkLYBJ6Xz5GCL2gLyvfN.webp",
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
  {
    slug: "myagent",
    title: "myAgent",
    description:
      "סוכן מכירות אישי לוואטסאפ וטלגרם — מנהל בשבילך שיחות התעניינות כשאתה לא זמין",
    subtitle: "סוכן AI אישי לוואטסאפ וטלגרם עם בסיס ידע אישי ודשבורד ניהול",
    fullDescription:
      "סוכן AI אישי שמנהל בשבילך שיחות מכירה והתעניינות בוואטסאפ ובטלגרם, כשאתה לא זמין לענות בעצמך — מבוסס על בסיס ידע שאתה מכניס ועל הטון שלך. Listener נפרד לכל ערוץ נכנס לאותו backend, השיחות מופרדות לפי ערוץ, ויש דשבורד Next.js לניהול בסיס הידע, מעקב והשתלטות על שיחות. נפרס כשלושה שירותים נפרדים ב-Render עם Persistent Disks לשמירת סשנים.",
    tech: [
      "FastAPI",
      "MongoDB",
      "Node.js",
      "whatsapp-web.js",
      "Telethon",
      "Next.js 14",
      "Tailwind",
      "Gemini 2.5 Pro",
      "Claude Sonnet",
      "Render",
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036748622/C8CMzJWXcynJDR75BV9TgK/myagent-7Lod562R8dLjThpijRkjRn.webp",
    screenshots: ["/projects/Screenshot_20260511_190937_Chrome.jpg"],
    mermaidDiagram: `graph TB
    subgraph Users["משתמשים"]
        Customer["Customer - WhatsApp / Telegram"]
        Owner["Owner - Dashboard"]
    end
    subgraph Listeners["Listeners"]
        WAListener["WhatsApp Listener - Node.js + whatsapp-web.js"]
        TGListener["Telegram Listener - Python + Telethon"]
    end
    subgraph Backend["FastAPI Backend"]
        Webhook["Webhook Endpoint - WEBHOOK_SECRET"]
        Router["Channel-aware Router"]
        AgentCore["Agent Core - Conversation Engine"]
        RAG["RAG over Personal KB"]
        Notifier["Telegram Notifier"]
    end
    subgraph Models["LLM Backends"]
        Gemini["Gemini 2.5 Pro"]
        Claude["Claude Sonnet"]
    end
    subgraph Dashboard["Next.js Dashboard"]
        Toggle["Availability Toggle"]
        Chats["Live Chats - Takeover"]
        KBEditor["Knowledge Base Editor"]
    end
    subgraph Storage["Storage"]
        Mongo[("MongoDB - sessions, kb, messages")]
        Disks[("Persistent Disks - WA/TG sessions")]
    end
    Customer --> WAListener
    Customer --> TGListener
    WAListener --> Webhook
    TGListener --> Webhook
    Webhook --> Router
    Router --> AgentCore
    AgentCore --> RAG
    RAG --> Mongo
    AgentCore --> Gemini
    AgentCore --> Claude
    AgentCore --> Notifier
    Notifier --> Owner
    Owner --> Dashboard
    Dashboard --> Backend
    WAListener --> Disks
    TGListener --> Disks`,
    demo: "#",
    repo: "#",
    challenges: [
      "האזנה במקביל לשני ערוצים (WhatsApp + Telegram) עם הפרדת context לכל שיחה",
      "החלפת מודלים (Gemini / Claude) דרך משתנה סביבה ללא שינוי קוד",
      "אבטחה דו-שכבתית — WEBHOOK_SECRET בין listeners ל-backend ו-DASHBOARD_TOKEN ל-API",
      "שמירת סשנים של WhatsApp ו-Telegram על Persistent Disks כדי לשרוד restarts ב-Render",
    ],
    features: [
      "Listener נפרד ל-WhatsApp ול-Telegram (חשבון אישי, לא בוט) שמזין אותו backend",
      "הפרדת שיחות לפי ערוץ — אותו איש קשר בשני ערוצים = שתי שיחות נפרדות",
      "תמיכה ב-2 מודלים (Gemini 2.5 Pro / Claude Sonnet) בלחיצת משתנה סביבה",
      "RAG פשוט מבסיס ידע אישי שמזין המשתמש",
      "דשבורד Next.js עם מתג זמין/לא זמין, צפייה והתערבות בשיחות וניהול בסיס הידע",
      "התראות טלגרם בזמן אמת על כל מענה — אפשרות לקפוץ ולהשתלט על השיחה",
      "פריסה כשלושה שירותים נפרדים ב-Render עם Persistent Disks",
    ],
  },
  {
    slug: "fb-leads-scanner",
    title: "FB Leads Scanner",
    description:
      "בוט שסורק קבוצות פייסבוק ושולח לך פוסטים שאתה מחשיב ללידים + פאנל ווב לניהול",
    subtitle: "סורק קבוצות פייסבוק אוטומטי עם סיווג AI + פאנל ניהול",
    fullDescription:
      "סורק אוטומטי שעובר על קבוצות פייסבוק, מזהה פוסטים שרלוונטיים כלידים באמצעות AI, ושולח התראות לטלגרם. כולל פאנל ווב מלא לניהול קבוצות, מילות מפתח, הגדרות סריקה, ודשבורד סטטיסטיקות.",
    tech: [
      "Python",
      "Flask",
      "Playwright",
      "OpenAI API",
      "SQLite",
      "Telegram Bot API",
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036748622/C8CMzJWXcynJDR75BV9TgK/fb-leads-scanner-YyVXVKwyqsGwG9UZCVeERV.webp",
    screenshots: [
      "/projects/Screenshot_20260313_213118_Chrome.jpg",
      "/projects/Screenshot_20260313_213141_Chrome.jpg",
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
    slug: "leadsflow",
    title: "LeadsFlow",
    description:
      "מערכת ניהול תקשורת ולידים רב-ערוצית — מייל, וואטסאפ, מסנג'ר ואינסטגרם בתיבה אחת עם טיוטות AI",
    subtitle: "Inbox מאוחד לכל ערוצי הלידים עם סיווג AI וטיוטת תשובה אוטומטית",
    fullDescription:
      "מערכת SaaS שמרכזת לבעל העסק מקום אחד לכל הפניות הנכנסות — מהמייל, מהוואטסאפ, ממסנג'ר ומהאינסטגרם — מסווגת אוטומטית כל הודעה, ומכינה טיוטת תשובה מתאימה כדי שבעל העסק רק יאשר וישלח. כוללת התראות טלגרם בזמן אמת על לידים חמים עם כפתור 'שלח' inline, בסיס ידע (FAQ) עם חיפוש סמנטי (pgvector + OpenAI embeddings), שכבת ספקים מופשטת ל-WhatsApp (Green API / Meta Cloud API), multi-tenant מלא עם הצפנת credentials (Fernet), ו-follow-up אוטומטי ללידים שלא ענו אליהם.",
    tech: [
      "FastAPI",
      "SQLAlchemy 2.0 (async)",
      "PostgreSQL + pgvector",
      "Anthropic Claude",
      "OpenAI Embeddings",
      "Green API",
      "Meta Cloud API",
      "Next.js 15",
      "Tailwind",
      "shadcn/ui",
      "APScheduler",
      "Render",
      "Supabase",
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036748622/C8CMzJWXcynJDR75BV9TgK/leadsflow-Hab8u6YTDprDoPcciCNpYj.webp",
    screenshots: ["/projects/Screenshot_20260516_121229_Chrome.jpg"],
    mermaidDiagram: `graph TB
    subgraph Channels["ערוצי כניסה"]
        Email["Email"]
        WA["WhatsApp"]
        Messenger["Messenger"]
        Instagram["Instagram"]
    end
    subgraph Adapters["Provider Adapters"]
        WAAdapter["WhatsApp Adapter - Green API / Meta Cloud"]
        MetaAdapter["Meta Adapter - Messenger + Instagram"]
        EmailAdapter["Email Adapter"]
    end
    subgraph Backend["FastAPI Backend (Async)"]
        Ingest["Ingest Pipeline"]
        Classifier["Claude Haiku - Classifier + Lead Score"]
        Drafter["Claude Sonnet - Draft Reply"]
        FAQ["FAQ Semantic Search"]
        Scheduler["APScheduler - Follow-up"]
        TenantGuard["Multi-tenant Guard + Fernet"]
    end
    subgraph Storage["Storage"]
        Postgres[("Postgres + pgvector - tenants, leads, messages, faq")]
    end
    subgraph Notify["Notify"]
        TGBot["Telegram Bot - inline Send button"]
    end
    subgraph Frontend["Next.js 15 Dashboard"]
        Inbox["Unified Inbox"]
        LeadView["Lead Detail + Draft"]
        Settings["Settings - FAQ, Channels, Templates"]
    end
    Email --> EmailAdapter
    WA --> WAAdapter
    Messenger --> MetaAdapter
    Instagram --> MetaAdapter
    EmailAdapter --> Ingest
    WAAdapter --> Ingest
    MetaAdapter --> Ingest
    Ingest --> TenantGuard
    TenantGuard --> Classifier
    Classifier --> Drafter
    Drafter --> FAQ
    FAQ --> Postgres
    Classifier --> Postgres
    Drafter --> Postgres
    Drafter --> TGBot
    Scheduler --> Postgres
    Scheduler --> TGBot
    Frontend --> Backend`,
    demo: "#",
    repo: "#",
    challenges: [
      "Multi-tenant ברמת ה-DB עם הצפנת credentials של ספקים חיצוניים (Fernet)",
      "שכבת Adapter אחידה ל-WhatsApp שמאפשרת מעבר Green API ↔ Meta Cloud API בלי לגעת בקוד העסקי",
      "חיפוש סמנטי ב-FAQ עם pgvector + OpenAI embeddings כדי לענות גם על שאלות מנוסחות אחרת",
      "Lead Score וסיווג מהיר עם Claude Haiku, וטיוטת תשובה איכותית עם Claude Sonnet — איזון עלות/איכות",
      "Follow-up אוטומטי עם APScheduler שמזהה לידים שלא ענו אליהם בזמן",
    ],
    features: [
      "דשבורד מאוחד לכל הערוצים — מייל, WhatsApp, Messenger ו-Instagram",
      "סיווג חכם של פניות עם Claude Haiku — חם/פושר/קר, לקוח קיים, שאלה, ספאם + Lead Score",
      "טיוטת תשובה אוטומטית עם Claude Sonnet בטון של העסק וההיסטוריה של הלקוח",
      "התראות טלגרם בזמן אמת עם כפתור 'שלח' inline — סגירה מלאה מהנייד תוך שניות",
      "בסיס ידע (FAQ) עם חיפוש סמנטי (pgvector + OpenAI embeddings)",
      "Adapter אחיד ל-WhatsApp — מעבר חופשי בין Green API ל-Meta Cloud API",
      "Multi-tenant מלא עם בידוד ב-DB והצפנת credentials (Fernet)",
      "Follow-up אוטומטי לבעל העסק או ללקוח עצמו",
      "Alembic migrations מסודרות + Postgres עם pgvector",
      "דשבורד Next.js 15 + React 19, RTL בעברית מלא",
    ],
  },
  {
    slug: "contentflow",
    title: "ContentFlow",
    description:
      "מחולל תוכן שיווקי לעסקים — יוצר פוסטים בעברית בסגנון שלך לפי דוגמאות שסיפקת",
    subtitle: "מחולל פוסטים שיווקיים בעברית עם פרופיל עסק וניתוח דוגמאות סגנון",
    fullDescription:
      "מערכת SaaS שיוצרת פוסטים שיווקיים בעברית עבור בעלי עסקים, על בסיס פרופיל מותאם והדוגמאות שהלקוח סיפק — כדי שכל פוסט יישמע 'ממש כמוהם' ולא כמו AI גנרי. כוללת Onboarding שמלמד את המערכת על העסק, פרופיל עסק מתמשך שכל פוסט נשען עליו, יצירת תוכן עם Prompt Caching של Claude Sonnet 4.6 (חוסך עלות וזמן דרמטית), מערכת Auth רב-משתמשית, ו-UI עברית עם Design System אחיד.",
    tech: [
      "FastAPI",
      "MongoDB",
      "Anthropic Claude (Sonnet 4.6)",
      "Prompt Caching",
      "Jinja2",
      "Alpine.js",
      "Tailwind",
      "Render",
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036748622/C8CMzJWXcynJDR75BV9TgK/contentflow-EBa2b5dteRp3ZzuJDjF3mU.webp",
    screenshots: [
      "/projects/Screenshot_20260523_223347_Chrome.jpg",
      "/projects/Screenshot_20260523_223356_Chrome.jpg",
    ],
    mermaidDiagram: `graph TB
    subgraph User["משתמש"]
        Owner["בעל העסק"]
    end
    subgraph Onboarding["Onboarding"]
        Wizard["Onboarding Wizard"]
        StyleAnalyzer["Style Analyzer - דוגמאות תוכן"]
    end
    subgraph Backend["FastAPI Backend"]
        Auth["Auth - bcrypt + Cookie Sessions"]
        ProfileSvc["Business Profile Service"]
        Generator["Content Generator"]
    end
    subgraph LLM["LLM Layer"]
        Claude["Claude Sonnet 4.6"]
        Cache["Prompt Caching - Profile + Templates"]
    end
    subgraph Storage["MongoDB"]
        Users[("users")]
        Profiles[("business_profiles")]
        Posts[("generated_posts")]
    end
    subgraph UI["UI - Hebrew RTL"]
        Landing["Landing"]
        Signup["Signup / Login"]
        Dashboard["Dashboard - Generate Post"]
    end
    Owner --> UI
    UI --> Auth
    Owner --> Wizard
    Wizard --> StyleAnalyzer
    StyleAnalyzer --> ProfileSvc
    ProfileSvc --> Profiles
    Dashboard --> Generator
    Generator --> Cache
    Cache --> Claude
    Generator --> Posts
    Auth --> Users`,
    demo: "#",
    repo: "#",
    challenges: [
      "ניתוח דוגמאות תוכן של הלקוח כדי לזקק את סגנון הכתיבה — לא רק טון, גם מבנה משפט ואורך",
      "Prompt Caching של פרופיל העסק והתבניות עם Claude Sonnet 4.6 — חיסכון דרמטי בעלות וזמן",
      "בידוד מלא של נתוני לקוחות (users collection, bcrypt, cookie sessions) במערכת רב-משתמשית",
      "Design System אחיד בעברית עם RTL מלא — landing, signup, login ו-dashboard לפי טוקנים זהים",
      "תשתית בדיקות עם pytest + mongomock-motor — הרצה ללא Mongo חי",
    ],
    features: [
      "Onboarding שמלמד את המערכת על העסק — תחום, קהל יעד, טון דיבור",
      "ניתוח דוגמאות תוכן שהלקוח מספק לזיקוק הסגנון",
      "פרופיל עסק מתמשך — כל פוסט עתידי נשען עליו ללא הסבר מחדש",
      "יצירת תוכן עם Claude Sonnet 4.6 + Prompt Caching — מהיר וזול",
      "מערכת Auth רב-משתמשית עם bcrypt ו-cookie sessions",
      "UI בעברית עם Design System אחיד ו-RTL מלא",
      "תשתית בדיקות עם pytest + mongomock-motor",
    ],
  },
  {
    slug: "offerflow",
    title: "OfferFlow",
    description:
      "מחולל הצעות מחיר וחוזים ב-AI — מתיאור חופשי ל-PDF ממותג ב-60 שניות, עם חתימה דיגיטלית ו-tracking",
    subtitle: "מחולל הצעות מחיר וחוזים בעברית עם AI, חתימה דיגיטלית ומעקב פתיחה",
    fullDescription:
      "מערכת SaaS בעברית שמייצרת הצעות מחיר מקצועיות ב-PDF עבור עסקי שירות תוך 60 שניות — עם AI שמנסח את הטקסט, מילוי חכם מתיאור חופשי (Quick AI), חתימה דיגיטלית בעמוד הציבורי ומעקב על מתי הלקוח פתח את ההצעה. כוללת עורך עם תצוגה חיה (Split-View), הפקת PDF ממותג בעברית עם WeasyPrint, חישובי מע\"מ, AI לניסוח טקסטים, קטלוג שירותים, עמוד צפייה ציבורי עם כפתורי אישור/דחייה, שליחה ב-Email ו-WhatsApp Deep Link, Onboarding 5 שלבים, 9 פלטות צבע סמנטיות עם בדיקת WCAG, גרסאות (Revisions), Prompt Caching שחוסך 70-80% מעלות ה-AI, ודשבורד KPIs.",
    tech: [
      "FastAPI",
      "Python 3.11",
      "MongoDB (Motor async)",
      "Anthropic Claude (Sonnet 4.6)",
      "Prompt Caching",
      "WeasyPrint",
      "Jinja2",
      "Tailwind",
      "Alpine.js",
      "Cloudflare R2",
      "Render",
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036748622/C8CMzJWXcynJDR75BV9TgK/offerflow-2CDpNggdSfmGNBbDEYjzn9.webp",
    screenshots: ["/projects/Screenshot_20260523_223540_Chrome.jpg"],
    mermaidDiagram: `graph TB
    subgraph Owner["בעל העסק"]
        QuickAI["Quick AI - תיאור חופשי"]
        Editor["Editor - Split-View"]
    end
    subgraph Backend["FastAPI Backend"]
        AIParser["AI Parser - free text to JSON"]
        QuoteSvc["Quote Service - חישובי מע\\\"מ + מספור"]
        CatalogSvc["Catalog Service"]
        Wording["AI Wording - פתיח / סיום / תיאור פריט"]
        Tracker["View / Sign Tracker"]
        Notifier["Notifier - Email + WA Deep Link"]
    end
    subgraph LLM["LLM"]
        Claude["Claude Sonnet 4.6"]
        Cache["Prompt Caching - Business Profile + Templates"]
    end
    subgraph PDF["PDF Pipeline"]
        Jinja["Jinja2 - HTML Template"]
        Weasy["WeasyPrint - RTL + Hebrew Fonts"]
        R2["Cloudflare R2 - PDF Storage"]
    end
    subgraph Public["Public View"]
        PublicPage["/q/token - Interactive Page"]
        Sign["Canvas Signature"]
        Accept["Accept / Reject Buttons"]
    end
    subgraph Storage["MongoDB"]
        Quotes[("quotes + revisions")]
        Catalog[("catalog")]
        Events[("view_events")]
    end
    Owner --> QuickAI
    QuickAI --> AIParser
    AIParser --> Cache
    Cache --> Claude
    AIParser --> Editor
    Editor --> QuoteSvc
    QuoteSvc --> Wording
    Wording --> Cache
    QuoteSvc --> Jinja
    Jinja --> Weasy
    Weasy --> R2
    QuoteSvc --> Quotes
    CatalogSvc --> Catalog
    Editor --> CatalogSvc
    QuoteSvc --> Notifier
    Notifier --> PublicPage
    PublicPage --> Sign
    PublicPage --> Accept
    PublicPage --> Tracker
    Tracker --> Events
    Tracker --> Notifier`,
    demo: "#",
    repo: "#",
    challenges: [
      "Quick AI — המרת תיאור חופשי בעברית ל-JSON מובנה עם פרטי לקוח, פריטים, פתיח, סיום ותנאי תשלום",
      "הפקת PDF בעברית עם WeasyPrint — RTL מלא, ערבוב עברית-אנגלית-מספרים נכון (unicode-bidi), web fonts (Heebo / Assistant)",
      "Prompt Caching של פרופיל העסק והתבניות — חיסכון 70-80% מעלות ה-AI",
      "עמוד צפייה ציבורי אינטראקטיבי (לא PDF סטטי) עם חתימה דיגיטלית canvas ו-tracking מלא של זמן קריאה",
      "בדיקת WCAG (AA/AAA) בזמן אמת ל-9 פלטות צבע סמנטיות — מונע בחירת קומבינציות לא קריאות",
      "ניהול גרסאות (Revisions) של הצעה עם שכפול ומעקב גרסאות קודמות",
    ],
    features: [
      "Quick AI — מתיאור חופשי להצעה מלאה ב-JSON מובנה",
      "עורך עם תצוגה חיה (Split-View) של ה-PDF",
      "הפקת PDF ממותג בעברית עם WeasyPrint — RTL, צבעי מותג, לוגו וחתימה",
      "חישובי מע\"מ, הנחות, מטבע, תוקף ומספור הצעות אוטומטי (QT-2026-0001)",
      "AI לניסוח פתיח, סיום ותיאור פריט 'מקטן למקצועי'",
      "קטלוג שירותים — CRUD מלא עם מחירים ויחידות (פריט/שעה/יום/פרויקט)",
      "עמוד צפייה ציבורי (/q/{token}) עם כפתורי אישור/דחייה/הורד PDF וחתימה דיגיטלית canvas",
      "Tracking מלא — מתי נפתח, מאיזה IP, כמה זמן נקרא, מתי נחתם",
      "שליחה ב-Email וב-WhatsApp Deep Link מוכן (wa.me)",
      "Onboarding 5 שלבים — מיתוג, קטלוג, תיק עבודות, ברירות מחדל, הוכחה חברתית",
      "9 פלטות צבע סמנטיות + בדיקת WCAG בזמן אמת",
      "גרסאות (Revisions) של הצעה — שכפול ומעקב",
      "Prompt Caching — חיסכון 70-80% בעלות ה-AI",
      "דשבורד KPIs — sent, viewed, accepted, conversion rate, פעילות אחרונה",
    ],
  },
  {
    slug: "mentoros",
    title: "MentorOS",
    description:
      "מנטור אישי מבוסס AI עם זיכרון ארוך טווח — מזהה דפוסים, מנתח החלטות ומלווה צמיחה אישית",
    subtitle:
      "מנטור AI אישי עם זיכרון סמנטי, ניתוח החלטות מובנה וזיהוי דפוסי חשיבה",
    fullDescription:
      "MentorOS הוא מנטור אישי שזוכר אותך — כל שיחה מחלצת זיכרונות (ערכים, פחדים, דפוסים, מטרות) ושומרת אותם כוקטורים ב-pgvector. במקום צ'אטבוט חסר הקשר, המנטור מזהה חזרות מעגליות בחשיבה, מציע עדשות קוגניטיביות חלופיות ומנתח החלטות מכמה זוויות. כולל תהליך הכרות מובנה, מודולי העמקה ב-6 תחומים, רפלקציה שבועית, וייבוא שיחות מ-ChatGPT/Claude/Gemini — מערכת שלמה לליווי צמיחה אישית.",
    tech: [
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "FastAPI",
      "PostgreSQL",
      "pgvector",
      "Google Gemini API",
      "OpenAI Embeddings",
      "Zustand",
      "React Query",
    ],
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036748622/C8CMzJWXcynJDR75BV9TgK/mentorios-dp9UZSZMBXWsxobfqR7dac.webp",
    screenshots: [
      "/projects/mentoros_memory.jpg",
      "/projects/mentoros_profile.jpg",
      "/projects/mentoros_dashboard.jpg",
    ],
    mermaidDiagram: `graph TD
    User[משתמש] --> NextJS[Next.js 16 Frontend]

    NextJS -->|JWT + Axios| FastAPI[FastAPI Backend]

    FastAPI --> Auth[Auth Layer<br/>JWT + Refresh Tokens]
    FastAPI --> Chat[Chat Engine]
    FastAPI --> Decisions[Decision Room]
    FastAPI --> DeepDive[Deep Dive Modules]
    FastAPI --> Reflections[Weekly Reflections]
    FastAPI --> Import[AI Import Parser]

    Chat --> MemoryRetrieval[Memory Retrieval<br/>Cosine Similarity]
    Chat --> LoopDetector[Loop Detector<br/>Cross-Session Similarity]
    Chat --> QualityGuard[Quality Guard<br/>Background Evaluator]
    Chat --> SafetyLayer[Safety Classifier<br/>Keyword + LLM]

    Chat -->|Extract| MemoryPipeline[Memory Extraction<br/>11 Types · Dedup · Contradictions]

    MemoryRetrieval --> pgvector[(PostgreSQL + pgvector<br/>VECTOR 1536)]
    MemoryPipeline --> pgvector

    Chat --> Gemini[Google Gemini API<br/>3 Model Tiers]
    MemoryPipeline --> OpenAI[OpenAI Embeddings<br/>text-embedding-3-small]
    MemoryRetrieval --> OpenAI

    Decisions --> Gemini
    DeepDive --> Gemini
    Reflections --> Gemini

    FastAPI --> IdentityProfile[Identity Profile<br/>Auto-Synthesized]
    FastAPI --> PromptLab[Prompt Lab<br/>A/B Testing]`,
    demo: "https://mentorai-k5y0.onrender.com/?home=1",
    demoLabel: "Landing Page",
    repo: "#",
    challenges: [
      "חיפוש סמנטי בזיכרון עם pgvector — embeddings ב-1536 ממדים, cosine distance, fallback לדירוג לפי עדכניות",
      "ניהול מודלים מרובים — ניתוב 3 רמות (strong/fast/summary) עם מעקב עלויות per-call ותקרת הוצאות",
      "זיהוי סתירות — בדיקת similarity בין זיכרונות חדשים לקיימים למניעת כפילויות וסתירות",
      "זיהוי לולאות — השוואת דמיון סמנטי חוצה-סשנים לזיהוי דפוסי חשיבה מעגליים",
      "אבטחת auth ללא localStorage — JWT + refresh tokens מנוהלים בזיכרון בלבד (Zustand), עם interceptor אוטומטי",
      "ביצועי רקע — חילוץ זיכרונות, Quality Guard ובדיקת לולאות רצים כ-background tasks ולא חוסמים תשובה",
      "RTL-first UI — ממשק עברית מלא עם dark mode, מעברים חלקים ותמיכה ב-system preference",
    ],
    features: [
      "צ'אט מנטורינג עם שליפת זיכרונות סמנטית (cosine similarity)",
      "חילוץ זיכרונות אוטומטי — 11 סוגים (ערכים, דפוסים, פחדים, מטרות, החלטות ועוד)",
      "זיהוי לולאות חשיבה מעגליות + הזרקת עדשות קוגניטיביות (Best Friend, Future Self, Values-First...)",
      "ניתוח החלטות מובנה — אפשרויות, נקודות עיוורות, דפוסים רלוונטיים",
      "Deep Dive — 30 שאלות ב-6 מודולים לבניית פרופיל זהות מעמיק",
      "ייבוא שיחות מ-AI אחרים (ChatGPT, Claude, Gemini) עם חילוץ זיכרונות",
      "רפלקציה שבועית + סיכום שבועי נרטיבי אוטומטי",
      "פרופיל זהות מתעדכן — תכונות, חוזקות, טריגרים, גרסאות היסטוריות",
      "Quality Guard — הערכת איכות תשובות ברקע (שימוש בהקשר, חזרות, סתירות)",
      "מערכת בטיחות דו-שכבתית — מסווג מהיר + מסווג LLM (עברית + אנגלית)",
      "Prompt Lab — כלי A/B testing לפרומפטים (admin)",
    ],
  },
  {
    slug: "codekeeper",
    title: "CodeKeeper",
    description: "בוט טלגרם לגיבוי ריפוזיטורי + אתר למפתחים לשמירת קוד",
    subtitle: "בוט טלגרם + אפליקציית ווב לגיבוי ושמירת קוד",
    fullDescription:
      "CodeKeeper (קודלי) היא פלטפורמה מלאה לניהול קוד — בוט טלגרם שמאפשר לשמור קטעי קוד, לגבות ריפוזיטורי מ-GitHub,ליצור ריפו חדש ע\"י העלאת קובץ ZIP ולחפש בקוד. כולל אפליקציית ווב עם דשבורד, דפדפן ריפוזיטורי, ספריית snippets קהילתית ועוד כלים למפתחים.",
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
    image:
      "https://private-us-east-1.manuscdn.com/sessionFile/iZqkMR8hDZfDPcDJFadzMD/sandbox/iV6qLqFHcv9NxJKZPGTqj2-img-2_1771100624000_na1fn_cHJvamVjdC1jb2Rpbmc.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaVpxa01SOGhEWmZEUGNESkZhZHpNRC9zYW5kYm94L2lWNnFMcUZIY3Y5TnhKS1pQR1RxajItaW1nLTJfMTc3MTEwMDYyNDAwMF9uYTFmbl9jSEp2YW1WamRDMWpiMlJwYm1jLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=cczxpmQLFghuYIWKnZTrKQCqvReB6IBdYFIRByU7Hi1v5Exr1aR8Xen2kpCUCq5MMWievn8JzYNg6Ad2q3yB8W~AUPgTXWX8ibEOvwqE4KH8eKHurtheh5Rd1N5tY9KboAHKxonjgkNEGiuNW6dW5S8Z6kbWvwIaa24UDUbqmxocLDFep6G3biufpG7QFCiHibFBeLYXw9XcRtWTq7v9tuuMzDIY~tF9hgsU3-amHyJGPrfiKq70XvtYoWjv3a9vOlSvffjfy3VhGpSv3KBkfLpwpLF16044-RSpmVHrxQ~al5-4uhVnJfIymw70z27P72Vq6C5nDFuDrzQ8AsDEUA__",
    screenshots: [
      "/projects/Screenshot_20260313_202612_Telegram.jpg",
      "/projects/Screenshot_20260313_202856_Telegram.jpg",
      "/projects/Screenshot_20260313_203519_Chrome.jpg",
      "/projects/Screenshot_20260313_203916_Chrome.jpg",
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
      "תצוגת מארקדאון מלאה לקבצי מארקדאון",
      "תפריט תוכן עניינים צף אוטומטי לקבצי מארקדאון",
      "פתקים דביקים עם אפשרות ליצירת תזכורות פוש",
      "מערכת סימניות",
      "חיפוש סמנטי בקוד עם AI",
      "דשבורד עם הסטוריית פעולות אחרונות ועוד",
      "בונה ערכות נושא מובנה לממשק",
      "מערכת \"האוספים שלי\" לשמירת קטעי קוד לפי קטגוריות",
      "ייצוא קטעי קוד ל-Gist ו-Pastebin",
      "גיבוי אוטומטי ל-Google Drive",
    ],
  },
  {
    slug: "routine-anchors",
    title: "שגרה בחוסר שגרה",
    description:
      "כלי אינטראקטיבי לבניית עוגני שגרה יומיים לילדים בתקופות של חוסר ודאות",
    subtitle: "אפליקציית ווב לבניית שגרה יומית לילדים — עם דראג-אנד-דרופ, שיחת ערב ומערכת תגמולים",
    fullDescription:
      "אפליקציה אינטראקטיבית שעוזרת להורים וילדים לבנות סדר יום יציב בתקופות לא יציבות. כוללת בניית יום עם גרירת פעילויות, מאגר פעילויות מותאם אישית, שיחת ערב עם רפלקציה על היום, מערכת אסימונים (תגמולים וחיזוקים), מדריך מקצועי להורים מאת מנתחת התנהגות, Push Notifications לתזכורות, ודארק מוד.",
    tech: [
      "TypeScript",
      "React 19",
      "Tailwind CSS 4",
      "tRPC",
      "Drizzle ORM",
      "MySQL",
      "Express",
      "dnd-kit",
      "Framer Motion",
      "Web Push",
      "AWS S3",
    ],
    image:
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663036748622/C8CMzJWXcynJDR75BV9TgK/routine-anchors-hznWo9CY8YAPAQLCxoMCmN.webp",
    imagePosition: "bottom",
    screenshots: [
      "/projects/routine_home.jpg",
      "/projects/routine_my_day.jpg",
      "/projects/routine_activities.jpg",
      "/projects/routine_evening_chat.jpg",
      "/projects/routine_parent_guide.jpg",
    ],
    mermaidDiagram: `graph TB
    subgraph Users["משתמשים"]
        Parent["הורה"]
        Child["ילד"]
        Admin["אדמין"]
    end
    subgraph Client["React Client"]
        Home["דף בית — ניווט ראשי"]
        MyDay["היום שלי — סדר יום עם Drag & Drop"]
        Activities["מאגרים — ניהול פעילויות וקטגוריות"]
        EveningChat["שיחת ערב — רפלקציה על היום"]
        Tokens["אסימונים — חיזוקים ותגמולים"]
        ParentGuide["מדריך להורים — תוכן מקצועי"]
    end
    subgraph API["tRPC API Layer"]
        AuthRouter["Auth Router — JWT + HTTP-only Cookies"]
        DayRouter["Day Router — CRUD פעילויות יומיות"]
        ActivityRouter["Activity Router — מאגר פעילויות"]
        ChatRouter["Chat Router — שיחת ערב"]
        TokenRouter["Token Router — מערכת תגמולים"]
        PushRouter["Push Router — Web Push Notifications"]
    end
    subgraph Server["Express Server"]
        tRPCServer["tRPC Server"]
        PushService["Push Notification Service"]
        S3Service["AWS S3 — העלאת תמונות"]
    end
    subgraph Storage["Database"]
        MySQL[("MySQL — Drizzle ORM")]
    end
    Parent --> Client
    Child --> Client
    Admin --> Client
    Home --> MyDay
    Home --> Activities
    Home --> EveningChat
    Home --> Tokens
    Home --> ParentGuide
    MyDay --> DayRouter
    Activities --> ActivityRouter
    EveningChat --> ChatRouter
    Tokens --> TokenRouter
    Client --> AuthRouter
    Client --> PushRouter
    AuthRouter --> tRPCServer
    DayRouter --> tRPCServer
    ActivityRouter --> tRPCServer
    ChatRouter --> tRPCServer
    TokenRouter --> tRPCServer
    PushRouter --> PushService
    tRPCServer --> MySQL
    PushService --> MySQL
    S3Service --> MySQL`,
    demo: "https://routine-anchors.onrender.com",
    repo: "https://github.com/amirbiron/routine",
    challenges: [
      "דראג-אנד-דרופ מורכב עם dnd-kit — גרירת פעילויות בין קטגוריות ומשבצות זמן",
      "מערכת אימות עם JWT ו-HTTP-only Cookies עם tRPC",
      "Push Notifications עם web-push — רישום, שליחה ותזמון תזכורות",
      "תמיכה מלאה ב-RTL עם ממשק עברית מותאם",
    ],
    features: [
      "בניית סדר יום עם גרירת פעילויות לפי ארוחות (בוקר, צהריים, ערב)",
      "מאגר פעילויות מותאם אישית עם אייקונים וקטגוריות",
      "שיחת ערב — רפלקציה יומית עם בחירת מצב רוח ושאלות מנחות",
      "מערכת אסימונים — חיזוקים ותגמולים לילדים",
      "מדריך מקצועי להורים מאת מנתחת התנהגות",
      "Push Notifications לתזכורות יומיות",
      "דארק מוד",
      "ממשק מותאם למובייל עם ניווט תחתון",
    ],
  },
];
