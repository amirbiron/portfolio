/**
 * עמוד המלצה מפורט — מציג צילום מסך של ההמלצה המקורית בסגנון טרמינל
 */

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { testimonials } from "@/lib/testimonials";

export default function TestimonialPage() {
  const params = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [lightbox, setLightbox] = useState(false);

  // גלילה לראש העמוד בכניסה
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.slug]);

  const testimonial = testimonials.find((t) => t.slug === params.slug);

  if (!testimonial) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="terminal-window p-8 text-center">
          <p className="text-destructive text-lg mb-4">
            המלצה לא נמצאה
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
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Button>
        </div>
      </header>

      {/* תוכן ההמלצה */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="terminal-window">
              <div className="terminal-header">
                <div className="terminal-dot border-primary" />
                <div className="terminal-dot border-accent" />
                <div className="terminal-dot border-destructive" />
                <span className="text-sm text-muted-foreground ml-2">
                  ~/testimonials/{testimonial.fileName}
                </span>
              </div>

              <div className="p-6 md:p-8">
                {/* הודעת טרמינל - טוען קובץ */}
                <div className="mb-6 space-y-1">
                  <p className="text-xs font-mono text-muted-foreground">
                    <span className="text-accent">[System]:</span> Fetching {testimonial.fileName}...{" "}
                    <span className="text-primary">Success.</span>
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    <span className="text-accent">[System]:</span> Rendering attachment...{" "}
                    <span className="text-primary">Done.</span>
                  </p>
                </div>

                {/* צילום מסך ההמלצה */}
                <div
                  className="border border-border/50 rounded cursor-pointer group"
                  onClick={() => setLightbox(true)}
                >
                  <img
                    src={testimonial.screenshot}
                    alt={`המלצה מ${testimonial.clientName}`}
                    className="w-full rounded group-hover:opacity-90 transition-opacity duration-200"
                  />
                </div>

                {/* כיתוב מתחת לתמונה */}
                <p className="text-xs text-muted-foreground font-mono mt-3 text-center">
                  <span className="text-accent">[Source]:</span> {testimonial.clientName} — {testimonial.role}
                </p>
              </div>
            </div>
          </motion.div>

          {/* כפתור חזרה */}
          <div className="mt-8 flex justify-center">
            <Button
              variant="ghost"
              className="text-primary"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Button>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightbox(false)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={testimonial.screenshot}
              alt={`המלצה מ${testimonial.clientName}`}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
