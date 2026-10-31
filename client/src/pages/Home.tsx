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
import { Github, Mail, ExternalLink, Code2, GitBranch, User, ArrowLeft, Send, MessageSquareQuote, Bot } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ExternalLinkButton } from "@/components/ExternalLinkButton";
import { projects } from "@/lib/projects";
import { testimonials } from "@/lib/testimonials";
import { blogPosts, blogSlugs } from "@/lib/blog";
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

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
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
                <ExternalLinkButton
                  href="https://github.com/amirbiron"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 neon-border transition-all hover:scale-105"
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub Profile
                </ExternalLinkButton>
                <ExternalLinkButton
                  href="https://t.me/AndroidAndAI"
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10 transition-all hover:scale-105"
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                  </svg>
                  Telegram Channel
                </ExternalLinkButton>
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
                        asChild
                        size="sm"
                        className="flex-1 bg-primary/20 text-primary border border-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Link href={`/project/${project.slug}`}>
                          <ArrowLeft className="mr-2 h-3 w-3" />
                          Details
                        </Link>
                      </Button>
                      <ExternalLinkButton
                        href={project.demo}
                        unavailableMessage="Demo link - Feature coming soon"
                        size="sm"
                        variant="outline"
                        className="flex-1 border-accent text-accent hover:bg-accent/10"
                      >
                        <ExternalLink className="mr-2 h-3 w-3" />
                        {project.demoLabel || "Demo"}
                      </ExternalLinkButton>
                    </div>
                    {project.askAi && (
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-accent/20 text-accent border border-accent hover:bg-accent hover:text-accent-foreground font-mono"
                      >
                        <Link href={`/project/${project.slug}/ask-ai`}>
                          <Bot className="mr-2 h-3 w-3" />
                          Ask AI about {project.title}
                        </Link>
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
                {/* הכרטיס כולו הוא קישור אחד לעמוד ההמלצה */}
                <Link href={`/testimonial/${testimonial.slug}`} className="block h-full">
                <Card
                  className="terminal-window overflow-hidden group hover:scale-105 transition-all duration-300 h-full !py-0 !gap-0 cursor-pointer"
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

                    {/* כפתור פתיחה — נראה ככפתור, אבל הוא חלק מהקישור של הכרטיס ולכן span:
                        קישור לא יכול להכיל רכיב לחיץ נוסף */}
                    <Button
                      asChild
                      size="sm"
                      className="w-full bg-accent/20 text-accent border border-accent hover:bg-accent hover:text-accent-foreground font-mono"
                    >
                      <span>Open_Attachment.exe</span>
                    </Button>
                  </div>
                </Card>
                </Link>
              </FadeInSection>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20">
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
            {blogSlugs.map((slug, idx) => {
              const post = blogPosts[slug];
              return (
              <FadeInSection key={idx} delay={idx * 0.1}>
              <Link href={`/blog/${slug}`} className="block h-full">
              <Card
                className="terminal-window hover:scale-105 transition-all duration-300 cursor-pointer h-full !py-0 !gap-0"
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
              </Link>
              </FadeInSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-card/50">
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
              <ExternalLinkButton
                href="https://github.com/amirbiron"
                aria-label="GitHub"
                size="sm"
                variant="ghost"
                className="text-primary hover:text-primary/80"
              >
                <Github className="h-5 w-5" />
              </ExternalLinkButton>
              <ExternalLinkButton
                href="https://t.me/AndroidAndAI"
                aria-label="Telegram"
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive/80"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                </svg>
              </ExternalLinkButton>
              {/* mailto נפתח בתוכנת המייל, ולכן קישור רגיל בלי לשונית חדשה */}
              <Button
                asChild
                aria-label="Email"
                size="sm"
                variant="ghost"
                className="text-accent hover:text-accent/80"
              >
                <a href="mailto:amirbiron@gmail.com">
                  <Mail className="h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
