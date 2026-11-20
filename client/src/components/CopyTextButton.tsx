/**
 * כפתור שמעתיק טקסט ללוח, עם חיווי "הועתק" או "ההעתקה נכשלה" לשתי שניות.
 * משמש את עמוד הבלוג (העתקת המאמר כולו) ואת בלוק תהליך העבודה בדף הבית.
 * writeText נקרא ישירות מתוך ה-onClick כדי לשמור על transient user activation,
 * שנדרשת בכל דפדפן (ב-Firefox ו-Safari בכל העתקה מחדש).
 * מקור: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API#security_considerations
 */
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyTextButton({
  text,
  label,
  title,
  compact = false,
}: {
  /** הטקסט שמועתק ללוח */
  text: string;
  /** מה שכתוב על הכפתור במצב הרגיל */
  label: string;
  /** הטקסט שמופיע במעבר עכבר (title) */
  title: string;
  /** גרסה קטנה, לשורת כותרת של חלון טרמינל */
  compact?: boolean;
}) {
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
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch {
      setStatus("error");
    }
  };

  const Icon = status === "copied" ? Check : Copy;
  const shownLabel =
    status === "copied" ? "הועתק" : status === "error" ? "ההעתקה נכשלה" : label;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      title={title}
      className={
        compact
          ? "h-6 gap-1.5 px-2 font-mono text-xs text-muted-foreground hover:text-primary"
          : "gap-2 font-mono text-xs text-muted-foreground hover:text-primary"
      }
    >
      <Icon className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
      <span aria-live="polite">{shownLabel}</span>
    </Button>
  );
}
