/**
 * Terminal Aesthetic Portfolio - Home Page
 * Design: Retro-futurism with 1980s terminal aesthetic
 * Colors: Matrix green (#00ff41), neon pink (#ff006e), cyan (#00f5ff)
 * Typography: JetBrains Mono monospace
 * Effects: Scanlines, CRT glow, typing animations
 */

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Github, Mail, ExternalLink, Code2, GitBranch, Cpu, User, ArrowLeft, Send, MessageSquareQuote, Bot } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { projects } from "@/lib/projects";
import { testimonials } from "@/lib/testimonials";
import { useHomeScrollRestoration } from "@/hooks/useScrollRestoration";

// קומפוננטת עזר לאנימציית כניסה בגלילה
function FadeInSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  useHomeScrollRestoration();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ביטול טיימר קודם כדי למנוע race condition
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    setContactStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      if (!res.ok) throw new Error("Failed to send");

      setContactStatus("success");
      toast.success("ההודעה נשלחה! אני אחזור אליך בקרוב");
      setEmail("");
      setMessage("");
      resetTimerRef.current = setTimeout(() => setContactStatus("idle"), 4000);
    } catch {
      setContactStatus("error");
      toast.error("שגיאה בשליחה. אפשר לנסות שוב או ליצור קשר בטלגרם.");
      resetTimerRef.current = setTimeout(() => setContactStatus("idle"), 4000);
    }
  };


  const skills = [
    { category: "Languages", items: ["Python", "JavaScript/TypeScript", "SQL"], level: 95 },
    { category: "Backend", items: ["Node.js", "Flask", "FastAPI", "MongoDB", "PostgreSQL", "Redis"], level: 90 },
    { category: "Bots & APIs", items: ["Telegram Bot API", "WhatsApp API (WPP, PyWa)", "Facebook Graph API"], level: 95 },
    { category: "Frontend", items: ["PWA", "HTML/CSS", "CSS Variables"], level: 80 },
    { category: "DevOps", items: ["Docker", "Prometheus", "Grafana", "Sentry", "GitHub Actions"], level: 85 }
  ];

  const blogPosts = [
    {
      title: "מדריך ליצירת בוט טרמינל לטלגרם בפייתון — הרצת קוד מרחוק דרך הצ'אט",
      date: "27-03-2026",
      excerpt: "איך לבנות בוט טלגרם שמאפשר הרצת קוד Python, JavaScript ופקודות shell — עם מערכת הרשאות, ניהול סשנים, ופריסה ב-Docker.",
      slug: "telegram-terminal-bot-guide"
    },
    {
      title: "איך לבנות סורק אתרים עם התראות טלגרם — מדריך מהשטח",
      date: "22-03-2026",
      excerpt: "מדריך מעשי לבניית פייפליין סריקה: scraping, סינון חכם, dedup רב-שכבתי, סיווג AI, והתראות טלגרם — מבוסס על פרויקט אמיתי ב-512MB RAM.",
      slug: "web-scraper-telegram-alerts"
    },
    {
      title: "איך לבנות בוט WhatsApp שעובד כמו מוצר אמיתי",
      date: "14-03-2026",
      excerpt: "הלקחים, הדפוסים והמלכודות מבניית בוט WhatsApp שרץ בפרודקשן — עם דוגמאות קוד ב-Python ו-FastAPI.",
      slug: "whatsapp-bot-python-guide"
    },
    {
      title: "Distributed Lock במונגו – פתרון ל-telegram.error.Conflict",
      date: "15-02-2026",
      excerpt: "בזמן האחרון נתקלתי בבעיה מעצבנת: הבוט שלי רץ על כמה אינסטנסים. הפתרון? מנגנון נעילה מבוזר (Distributed Lock) מבוסס MongoDB.",
      slug: "distributed-lock-mongo"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/iZqkMR8hDZfDPcDJFadzMD/sandbox/iV6qLqFHcv9NxJKZPGTqj2-img-1_1771100628000_na1fn_aGVyby10ZXJtaW5hbC1iZw.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaVpxa01SOGhEWmZEUGNESkZhZHpNRC9zYW5kYm94L2lWNnFMcUZIY3Y5TnhKS1pQR1RxajItaW1nLTFfMTc3MTEwMDYyODAwMF9uYTFmbl9hR1Z5YnkxMFpYSnRhVzVoYkMxaVp3LnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=k3yJSTBDdb5QOu52Tqx6EMqb2JWdsa~Zuk6wUMEm3cIKHg5dAF1Pn78Tc-nbQnlFqI5hv6WCWX4GYD0vVYY7aNmQrtsWI15sxscxR5zSUAXtMeAGSaqLFG7gDXBFJ1hVAlX0uIuXqJs6DqQu75k-raQ90ug7hr5LiVXYRz5QxLndMfxuHXDfiMZs8mIegiXC3UhzE9U5YAs4~8BGAHA8H8O8mqLeHz0GzniXM2gnZ32y6itvEmcqUuoRKYlCHZgYemBvCYTOmUXw6YSN1L7IV4l6j0DGDfLu4ZlTICEoX3qkv~J1mJbK7QHdnGo66Gg-QiWmiF01cLNOwsFFqH1MMw__')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-background/80" />
        
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="terminal-window max-w-4xl mx-auto"
          >
            <div className="terminal-header">
              <div className="terminal-dot border-[#00ff41]" />
              <div className="terminal-dot border-[#00f5ff]" />
              <div className="terminal-dot border-[#ff006e]" />
              <span className="text-sm text-muted-foreground ml-2">~/portfolio/home</span>
            </div>
            
            <div dir="rtl" className="p-8 md:p-12">
              <div dir="ltr" className="mb-6 text-left">
                <span className="text-primary text-sm">$</span>
                <span className="text-muted-foreground text-sm ml-2">whoami</span>
              </div>
              
              <h1 dir="ltr" className="text-4xl md:text-6xl font-bold text-primary neon-glow mb-4 cursor-blink text-left">
                AUTOMATION DEVELOPER
              </h1>
              
              <p dir="rtl" className="text-lg md:text-xl text-foreground/90 mb-8 max-w-2xl">
                מפתח אוטומציות, בוטים ופתרונות חכמים<br />
                התמחות: טלגרם, ווטסאפ, פייתון
              </p>
              
              <div dir="ltr" className="flex flex-wrap gap-3 mb-8">
                <span className="px-4 py-2 bg-primary/20 border border-primary text-primary text-sm">
                  Python
                </span>
                <span className="px-4 py-2 bg-accent/20 border border-accent text-accent text-sm">
                  Telegram Bot API
                </span>
                <span className="px-4 py-2 bg-destructive/20 border border-destructive text-destructive text-sm">
                  WhatsApp API
                </span>
                <span className="px-4 py-2 bg-primary/20 border border-primary text-primary text-sm">
                  Automation
                </span>
                <span className="px-4 py-2 bg-accent/20 border border-accent text-accent text-sm">
                  AI Integration
                </span>
              </div>
              
              <div dir="ltr" className="flex flex-wrap gap-4">
                <Button
                  className="bg-primary text-primary-foreground hover:bg-primary/90 neon-border transition-all hover:scale-105"
                  onClick={() => window.open('https://github.com/amirbiron', '_blank')}
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub Profile
                </Button>
                <Button 
                  variant="outline" 
                  className="border-destructive text-destructive hover:bg-destructive/10 transition-all hover:scale-105"
                  onClick={() => window.open('https://t.me/AndroidAndAI', '_blank')}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  Telegram Channel
                </Button>
                <Button 
                  variant="outline" 
                  className="border-accent text-accent hover:bg-accent/10 transition-all hover:scale-105"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Me
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-card/50">
        <div className="container max-w-4xl">
          <FadeInSection>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-8 w-8 text-accent" />
                <h2 className="text-3xl md:text-4xl font-bold text-accent neon-glow">
                  $ whoami --verbose
                </h2>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection delay={0.15}>
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dot border-primary" />
                <div className="terminal-dot border-accent" />
                <div className="terminal-dot border-destructive" />
                <span className="text-sm text-muted-foreground ml-2">~/about.md</span>
              </div>

              <div dir="rtl" className="p-8 space-y-4 text-foreground/90 leading-relaxed">
                {/* תמונת פרופיל */}
                <div dir="ltr" className="flex flex-col items-center mb-6">
                  <div className="border border-primary/50 rounded p-1" style={{ boxShadow: "0 0 8px var(--primary)" }}>
                    <img
                      src="/developer_profile_sketch.png"
                      alt="Developer Profile Sketch"
                      className="w-48 h-48 object-cover rounded"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-2">
                    <span className="text-accent">[System]:</span> Rendering developer_profile_sketch.png... <span className="text-primary">Success.</span>
                  </p>
                </div>

                <p>
                  <span className="text-primary font-bold">{'>'}</span>{" "}
                  התחלתי את המסע שלי בעולם הפיתוח מבוטים לטלגרם — למדתי לבד, ניסיתי, טעיתי, ושברתי דברים עד שהם עבדו. מאז בניתי{" "}
                  <span className="text-primary font-bold">60+ בוטים</span>, ממשקי ווב, ומערכות אוטומציה.
                </p>
                <p>
                  <span className="text-accent font-bold">{'>'}</span>{" "}
                  מה שמניע אותי? אני אוהב לראות את התוצאה הסופית — ממשק מוכן עם עיצוב מרשים, מערכת שעובדת חלק, ולקוח מרוצה שאומר "וואו, זה בדיוק מה שרציתי".
                </p>
                <p>
                  <span className="text-destructive font-bold">{'>'}</span>{" "}
                  היום אני מתמחה ב-Python, בוטים (Telegram & WhatsApp), ופתרונות אוטומציה מקצה לקצה — מהרעיון ועד למוצר עובד.
                </p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20">
        <div className="container">
          <FadeInSection>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Code2 className="h-8 w-8 text-primary" />
                <h2 className="text-3xl md:text-4xl font-bold text-primary neon-glow">
                  $ ls -la ./projects
                </h2>
              </div>
              <p dir="rtl" className="text-muted-foreground text-lg">
                פרויקטים נבחרים שמציגים מומחיות טכנית ופתרון בעיות
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <FadeInSection key={idx} delay={idx * 0.1}>
              <Card
                className="terminal-window overflow-hidden group hover:scale-105 transition-all duration-300 h-full !py-0 !gap-0"
              >
                <div className="terminal-header">
                  <div className="terminal-dot border-primary" />
                  <div className="terminal-dot border-accent" />
                  <div className="terminal-dot border-destructive" />
                </div>
                
                <div className="aspect-video overflow-hidden bg-muted">
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={project.title}
                      className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500${project.imagePosition === 'top' ? ' object-top' : project.imagePosition === 'bottom' ? ' object-bottom' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Code2 className="h-16 w-16 text-primary/40" />
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {project.title}
                  </h3>
                  <p dir="rtl" className="text-sm text-foreground/80 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2 py-1 bg-muted border border-border text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-3">
                      <Button
                        size="sm"
                        className="flex-1 bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-primary-foreground"
                        onClick={() => setLocation(`/project/${project.slug}`)}
                      >
                        <ArrowLeft className="mr-2 h-3 w-3" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-accent text-accent hover:bg-accent/10"
                        onClick={() => {
                          if (project.demo === "#") {
                            toast.info("Demo link - Feature coming soon");
                          } else {
                            window.open(project.demo, "_blank");
                          }
                        }}
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        {project.demoLabel || "Demo"}
                      </Button>
                    </div>
                    {project.slug === "codekeeper" && (
                      <Button
                        size="sm"
                        className="w-full bg-accent/20 text-accent border border-accent hover:bg-accent hover:text-accent-foreground font-mono"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation("/project/codekeeper/ask-ai");
                        }}
                      >
                        <Bot className="mr-2 h-3 w-3" />
                        Ask AI about CodeKeeper
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-card/50">
        <div className="container">
          <FadeInSection>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquareQuote className="h-8 w-8 text-accent" />
                <h2 className="text-3xl md:text-4xl font-bold text-accent neon-glow">
                  $ cat testimonials.log
                </h2>
              </div>
              <p dir="rtl" className="text-muted-foreground text-lg">
                מה הלקוחות אומרים
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, idx) => (
              <FadeInSection key={idx} delay={idx * 0.1}>
                <Card
                  className="terminal-window overflow-hidden group hover:scale-105 transition-all duration-300 h-full !py-0 !gap-0 cursor-pointer"
                  onClick={() => setLocation(`/testimonial/${testimonial.slug}`)}
                >
                  <div className="terminal-header">
                    <div className="terminal-dot border-primary" />
                    <div className="terminal-dot border-accent" />
                    <div className="terminal-dot border-destructive" />
                    <span className="text-xs text-muted-foreground ml-2">
                      {testimonial.fileName}
                    </span>
                  </div>

                  <div dir="rtl" className="p-6">
                    {/* ציטוט קצר */}
                    <div className="mb-4">
                      <span className="text-accent text-lg leading-none">"</span>
                      <p className="text-sm text-foreground/80 leading-relaxed inline">
                        {testimonial.shortQuote}
                      </p>
                      <span className="text-accent text-lg leading-none">"</span>
                    </div>

                    {/* פרטי הלקוח */}
                    <div className="mb-4">
                      <p className="text-xs text-primary font-mono">
                        &gt; {testimonial.clientName}
                      </p>
                      {testimonial.role && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {testimonial.role}
                        </p>
                      )}
                    </div>

                    {/* כפתור פתיחה */}
                    <Button
                      size="sm"
                      className="w-full bg-accent/20 text-accent border border-accent hover:bg-accent hover:text-accent-foreground font-mono"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/testimonial/${testimonial.slug}`);
                      }}
                    >
                      Open_Attachment.exe
                    </Button>
                  </div>
                </Card>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Matrix Section */}
      <section 
        className="py-20 relative"
        style={{
          backgroundImage: `url('https://private-us-east-1.manuscdn.com/sessionFile/iZqkMR8hDZfDPcDJFadzMD/sandbox/iV6qLqFHcv9NxJKZPGTqj2-img-5_1771100635000_na1fn_c2tpbGxzLWFic3RyYWN0.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvaVpxa01SOGhEWmZEUGNESkZhZHpNRC9zYW5kYm94L2lWNnFMcUZIY3Y5TnhKS1pQR1RxajItaW1nLTVfMTc3MTEwMDYzNTAwMF9uYTFmbl9jMnRwYkd4ekxXRmljM1J5WVdOMC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=HO4Ce07djAsVaW5MipFbUtvt9PuVJkZCX6rco1gFB8FoQAi5YBSVBFuUt~iGkjrI8L~nrI1g~1ZRYGloe-m-4TLeekdSW3Jq6HWaADiAatSa3Qkq6fuiAG~w1cyA3he18tXR-mS9n1NpfW3i~hYjZmbe06hELM-ROAYPOCXCx-ajst13PD8HSnddZcZ2m6JOcq9wyQoeujn91Cijx3mF3K3mJQ13cvG6z6IliNZDy1bcDZ40bqp6um5NdebFFz0juGCh5JJt9yadN4tNkxDaiHbZNt1c1bUEenvqizQ-WYZTJEDq7zh1zQK2-F4TGwj~bMJrnA9NvNJcOhEp2~41Bg__')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-background/90" />
        
        <div className="container relative z-10">
          <FadeInSection>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <Cpu className="h-8 w-8 text-accent" />
                <h2 className="text-3xl md:text-4xl font-bold text-accent neon-glow">
                  $ cat skills.json
                </h2>
              </div>
              <p dir="rtl" className="text-muted-foreground text-lg">
                שליטה טכנית לאורך כל מחסנית הפיתוח
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {skills.map((skill, idx) => (
              <FadeInSection key={idx} delay={idx * 0.1}>
              <div className="terminal-window h-full">
                <div className="terminal-header">
                  <div className="terminal-dot border-primary" />
                  <div className="terminal-dot border-accent" />
                  <div className="terminal-dot border-destructive" />
                  <span className="text-xs text-muted-foreground ml-2">
                    {skill.category.toLowerCase()}.skill
                  </span>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-primary">
                      {skill.category}
                    </h3>
                    <span className="text-sm text-accent font-mono">
                      {skill.level}%
                    </span>
                  </div>
                  
                  <div className="h-2 bg-muted border border-border mb-4 overflow-hidden">
                    <div 
                      className="h-full bg-primary neon-border transition-all duration-1000"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {skill.items.map((item, i) => (
                      <span 
                        key={i}
                        className="text-xs px-3 py-1 bg-primary/10 border border-primary text-primary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-card/50">
        <div className="container">
          <FadeInSection>
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <GitBranch className="h-8 w-8 text-destructive" />
                <h2 className="text-3xl md:text-4xl font-bold text-destructive neon-glow">
                  $ git log --blog
                </h2>
              </div>
              <p dir="rtl" className="text-muted-foreground text-lg">
                מאמרים טכניים ותובנות מעולם הפיתוח
              </p>
            </div>
          </FadeInSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post, idx) => (
              <FadeInSection key={idx} delay={idx * 0.1}>
              <Card
                className="terminal-window hover:scale-105 transition-all duration-300 cursor-pointer h-full !py-0 !gap-0"
                onClick={() => {
                  if (post.slug) {
                    setLocation(`/blog/${post.slug}`);
                  } else {
                    toast.info("Blog post - Feature coming soon");
                  }
                }}
              >
                <div className="terminal-header">
                  <div className="terminal-dot border-primary" />
                  <div className="terminal-dot border-accent" />
                  <div className="terminal-dot border-destructive" />
                </div>
                
                <div dir="rtl" className="p-6">
                  <div dir="ltr" className="text-xs text-accent mb-2 font-mono">
                    {post.date}
                  </div>
                  <h3 className="text-lg font-bold text-primary mb-3 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </Card>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container max-w-3xl">
          <FadeInSection>
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-8 w-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-primary neon-glow">
                $ ./contact.sh
              </h2>
            </div>
            <p dir="rtl" className="text-muted-foreground text-lg">
              בואו נשתף פעולה על הפרויקט הבא שלכם
            </p>
          </div>
          </FadeInSection>

          <FadeInSection delay={0.15}>
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dot border-primary" />
              <div className="terminal-dot border-accent" />
              <div className="terminal-dot border-destructive" />
              <span className="text-sm text-muted-foreground ml-2">contact_form.tsx</span>
            </div>
            
            <form onSubmit={handleContactSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm text-primary mb-2 font-mono">
                  $ echo "your_email"
                </label>
                <Input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="bg-muted border-border text-foreground font-mono"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-primary mb-2 font-mono">
                  $ cat message.txt
                </label>
                <Textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message here..."
                  rows={6}
                  className="bg-muted border-border text-foreground font-mono resize-none"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={contactStatus === "sending"}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 neon-border disabled:opacity-50"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {contactStatus === "sending" ? "> SENDING..." : contactStatus === "success" ? "> SENT!" : "> Send Message"}
                </Button>
              </div>
              {contactStatus === "success" && (
                <p className="text-primary text-sm font-mono animate-in fade-in">
                  <span className="text-accent">[System]:</span> Transmission complete. Message delivered to secure channel.
                </p>
              )}
              {contactStatus === "error" && (
                <p className="text-destructive text-sm font-mono animate-in fade-in">
                  <span className="text-accent">[System]:</span> Transmission failed. Try again or use Telegram directly.
                </p>
              )}
            </form>
          </div>
          </FadeInSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-mono">
              $ echo "© 2026 Developer Portfolio. Built with React + Tailwind"
            </p>
            <div className="flex gap-4">
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-primary hover:text-primary/80"
                onClick={() => window.open('https://github.com/amirbiron', '_blank')}
              >
                <Github className="h-5 w-5" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-destructive hover:text-destructive/80"
                onClick={() => window.open('https://t.me/AndroidAndAI', '_blank')}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-accent hover:text-accent/80"
                onClick={() => window.open('mailto:amirbiron@gmail.com', '_blank')}
              >
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
