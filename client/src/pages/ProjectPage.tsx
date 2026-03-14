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
import { toast } from "sonner";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import mermaid from "mermaid";
import { projects } from "@/lib/projects";

// הגדרות Mermaid לערכת נושא כהה
const mermaidConfig = {
  startOnLoad: false,
  theme: "dark" as const,
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
};


// קומפוננטת רינדור Mermaid
function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const renderDiagram = async () => {
      // אתחול לפני כל רינדור כדי לא לדרוס הגדרות גלובליות
      mermaid.initialize(mermaidConfig);
      const id = `mermaid-${Date.now()}`;
      try {
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML =
            '<p class="text-destructive">שגיאה ברינדור הדיאגרמה</p>';
        }
      }
    };
    renderDiagram();
    return () => { cancelled = true; };
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
    setSelected((prev) => (prev === null ? null : (prev + 1) % images.length));
  }, [images.length]);

  const goPrev = useCallback(() => {
    setSelected((prev) =>
      prev === null ? null : (prev - 1 + images.length) % images.length,
    );
  }, [images.length]);

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

  // גלילה לראש העמוד בכניסה
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.slug]);

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
                if (project.repo === "#") { toast.info("הקוד עדיין לא זמין"); } else { window.open(project.repo, "_blank"); }
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
              {project.fullDescription}
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
                if (project.repo === "#") { toast.info("הקוד עדיין לא זמין"); } else { window.open(project.repo, "_blank"); }
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
