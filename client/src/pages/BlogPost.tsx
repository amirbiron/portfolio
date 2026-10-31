/**
 * Terminal Aesthetic Portfolio - Blog Post Page
 * Design: Retro-futurism with 1980s terminal aesthetic
 */

import "../blog-styles.css";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Streamdown } from 'streamdown';
import { blogPosts, blogSlugs } from "@/lib/blog";

/**
 * כפתור שמעתיק את המאמר כולו (Markdown גולמי) ללוח.
 * writeText נקרא ישירות מתוך ה-onClick כדי לשמור על transient user activation,
 * שנדרשת בכל דפדפן (ב-Firefox ו-Safari בכל העתקה מחדש).
 * מקור: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API#security_considerations
 */
function CopyArticleButton({ markdown, compact = false }: { markdown: string; compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  // החיווי חוזר למצב הרגיל אחרי 2 שניות; ניקוי הטיימר מונע עדכון state אחרי unmount
  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  const handleCopy = async () => {
    try {
      // navigator.clipboard קיים רק ב-secure context (HTTPS או localhost);
      // מחוץ לזה הגישה עצמה זורקת, ולכן היא בתוך ה-try
      await navigator.clipboard.writeText(markdown);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  };

  const Icon = status === "copied" ? Check : Copy;
  const label =
    status === "copied" ? "הועתק" : status === "error" ? "ההעתקה נכשלה" : compact ? "העתק" : "העתק את כל המאמר";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      title="העתק את כל המאמר ללוח"
      className={
        compact
          ? "h-6 gap-1.5 px-2 font-mono text-xs text-muted-foreground hover:text-primary"
          : "gap-2 font-mono text-xs text-muted-foreground hover:text-primary"
      }
    >
      <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span aria-live="polite">{label}</span>
    </Button>
  );
}

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  const slug = params?.slug || "";
  const post = blogPosts[slug as keyof typeof blogPosts];

  // בלוגים אחרים להצעה בתחתית
  const otherBlogs = blogSlugs.filter((s) => s !== slug);

  // הטקסט שמועתק ללוח: כותרת ותאריך כמו שמוצגים בראש הדף, ואחריהם ה-Markdown המקורי
  const articleMarkdown = post ? `# ${post.title}\n\n${post.date}\n\n${post.content}` : "";

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
          <p className="text-foreground/80 mb-8">Blog post not found</p>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-6">
        <div className="container">
          <Button
            asChild
            variant="ghost"
            className="text-primary hover:text-primary/80"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Link>
          </Button>
        </div>
      </header>

      {/* Article Content */}
      <article className="py-12">
        <div className="container max-w-4xl">
          <div className="terminal-window">
            <div className="terminal-header">
              <div className="terminal-dot border-primary" />
              <div className="terminal-dot border-accent" />
              <div className="terminal-dot border-destructive" />
              <span className="text-sm text-muted-foreground ml-2">
                {slug}.md
              </span>
              <div className="ml-auto">
                <CopyArticleButton markdown={articleMarkdown} compact />
              </div>
            </div>
            
            <div className="p-8 md:p-12">
              {/* Meta */}
              <div className="mb-8" dir="rtl">
                <div className="text-xs text-accent mb-2 font-mono" dir="ltr" style={{ textAlign: "right" }}>
                  {post.date}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary neon-glow mb-4">
                  {post.title}
                </h1>
              </div>

              {/* Content with Markdown rendering */}
              <div className="prose prose-invert max-w-none">
                <Streamdown>{
                  post.content
                    // שורה ריקה אחרי סגירת בלוק קוד — מונע פרסור שגוי
                    .replace(/```\n(?!\n)/g, '```\n\n')
                    // שורה ריקה לפני --- — מונע setext heading (טקסט + --- = h2)
                    .replace(/([^\n])\n---/g, '$1\n\n---')
                }</Streamdown>
              </div>

              {/* העתקת המאמר גם בסוף, בלי לגלול חזרה למעלה */}
              <div className="mt-10 pt-6 border-t border-border/40 flex justify-end">
                <CopyArticleButton markdown={articleMarkdown} />
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Footer — Back to Portfolio + הצעות לבלוגים אחרים */}
      <footer className="py-12 border-t border-border">
        <div className="container max-w-4xl">
          {/* הצעות לבלוגים אחרים */}
          {otherBlogs.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-4 text-center font-mono">$ ls ./more-posts</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* הגלילה לראש העמוד נעשית ב-useEffect שבראש הקומפוננטה, כשה-slug מתחלף */}
                {otherBlogs.map((otherSlug) => (
                  <Link
                    key={otherSlug}
                    href={`/blog/${otherSlug}`}
                    className="terminal-window text-right p-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                  >
                    <div className="terminal-header mb-2">
                      <div className="terminal-dot border-primary" />
                      <div className="terminal-dot border-accent" />
                      <div className="terminal-dot border-destructive" />
                      <span className="text-xs text-muted-foreground ml-2">{otherSlug}.md</span>
                    </div>
                    <h3 className="text-sm font-bold text-primary leading-tight" dir="rtl">
                      {blogPosts[otherSlug].title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              asChild
              variant="ghost"
              className="text-primary hover:text-primary/80"
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Portfolio
              </Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
