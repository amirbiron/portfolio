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
    slug: "modularbot",
    title: "ModularBot",
    description:
      "בוט ליצירת בוטים בטלגרם - שולחים טוקן ותיאור, ותוך 10 דקות יש לכם בוט חדש מוכן לשימוש",
    subtitle: "בוט ליצירת בוטים — מהרעיון לבוט עובד ב-10 דקות",
    fullDescription:
      "ModularBot הוא מפעל בוטים אוטומטי. המשתמש שולח טוקן מ-BotFather ומתאר מה הבוט צריך לעשות, ותוך דקות הבוט נבנה, נדחף ל-GitHub, ומתחיל לרוץ אוטומטית. משתמש ב-Claude AI לכתיבת הקוד, ומערכת Plugin דינמית לניהול כל הבוטים.",
    tech: [
      "Python",
      "Flask",
      "Telegram Bot API",
      "Anthropic Claude API",
      "GitHub API",
      "MongoDB",
    ],
    image:
      "https://private-us-east-1.manuscdn.com/sessionFile/iZqkMR8hDZfDPcDJFadzMD/sandbox/iV6qLqFHcv9NxJKZPGTqj2-img-3_1771100621000_na1fn_cHJvamVjdC1vcGVuc291cmNl.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaVpxa01SOGhEWmZEUGNESkZhZHpNRC9zYW5kYm94L2lWNnFMcUZIY3Y5TnhKS1pQR1RxajItaW1nLTNfMTc3MTEwMDYyMTAwMF9uYTFmbl9jSEp2YW1WamRDMXZjR1Z1YzI5MWNtTmwucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=ErGpckQQbsoshaSqNCPzUEwxiOPUpwplKm93FpmakQIA8Hx0PG-5z9pucdaEl94hKphl7Ehhk68cFoSU9BwNBgpAwpvAkOhjoZHzeh5oPwjLOrQGR1pJD3MzeFh3mcDIYayI4qjeg0P7nCZuArC~0lY4aY8l0~ztMUKrAfSRDmWprvN3hfps9ppNBDx1EVFvZM0923qXFc94mwEmJtLR~avC7shQMeYulVbD8~Nb9FZPNyWbgPYChSGJDBDNjvRQTV-MupqFAZ5MWguFi30e-J-rGuMXs7k42rpWd0kqKwqSP7FiL2iW5LBNP1pT~mB-B3qrZ1q9RUbsM0mXdDmySQ__",
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
    description:
      "בוט שמלמד מארקדאון בצורה מהנה - תרגילים אינטראקטיביים ללמידת סינטקס מארקדאון בטלגרם",
    subtitle: "בוט אינטראקטיבי ללימוד Markdown עם תרגילים וגיימיפיקציה",
    fullDescription:
      "MarkdownBot מלמד Markdown בצורה מהנה — 43 שיעורים, אימונים ממוקדים לפי נושא, סנדבוקס לרינדור Markdown לתמונה, מערכת Gamification עם ניקוד ורמות, וספריית תבניות קהילתית. כולל גם אפליקציית ווב (Markdown Academy) עם מדריכים אינטראקטיביים.",
    tech: [
      "Node.js",
      "Telegram Bot API",
      "Puppeteer",
      "marked.js",
      "SQLite",
      "Express",
    ],
    image:
      "https://private-us-east-1.manuscdn.com/sessionFile/iZqkMR8hDZfDPcDJFadzMD/sandbox/iV6qLqFHcv9NxJKZPGTqj2-img-4_1771100634000_na1fn_cHJvamVjdC13ZWJhcHA.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaVpxa01SOGhEWmZEUGNESkZhZHpNRC9zYW5kYm94L2lWNnFMcUZIY3Y5TnhKS1pQR1RxajItaW1nLTRfMTc3MTEwMDYzNDAwMF9uYTFmbl9jSEp2YW1WamRDMTNaV0poY0hBLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=h222YWmfmv~0z1a3Cs6jDp2vcSGYPX7-nhWhWl30VB9nZf-IiFq9twYEYuLsrE6PUmkP70tGUJxVeMJk6nFax5SA0BXIqiPq3GM-1xDASCUy4IGkkI-NKD-8vt5oG9L-iuRgxvFyPZtYqFJ9hQhhQnq-X4I6JAVJpNk0W6wOhp0yNMDn0glkvbRrJvlKceAPvat3Ls768J3vXh84YCDPrKXt3cOHKV26Av8QrhOOE0YHtq82jOSv7zj63TJkexqAnfEMjLUICASGULVFW41POLGrjJBgVrMYyMRFcN07bG1-q-WthtaPJHwj38Nsc2VVHeudqCikyBCf4p6PxBZhww__",
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
        Lessons["43 Lessons"]
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
      "43 שיעורים אינטראקטיביים עם חידונים",
      "סנדבוקס — שליחת Markdown ורינדור לתמונה",
      "אימונים ממוקדים לפי נושא (טבלאות, לינקים, Mermaid...)",
      "מערכת ניקוד ורמות (Beginner → Master)",
      "אפליקציית ווב — Markdown Academy",
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
];
