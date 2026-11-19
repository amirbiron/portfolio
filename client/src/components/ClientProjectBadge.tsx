/**
 * תווית לפרויקט שנבנה ללקוח (clientProject ב-projects.ts): מסבירה למה אין לו קישור לקוד, ולרובם גם לא דמו פתוח.
 * מקור יחיד לנוסח ולמראה, לכרטיס בדף הבית ולעמוד הפרויקט. המסגרת המקווקוות מבדילה אותה מתגיות הטכנולוגיות,
 * והיא לא נראית כמו כפתור, כי אין בה מה ללחוץ.
 */
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClientProjectBadge({ className }: { className?: string }) {
  return (
    <span
      dir="rtl"
      className={cn(
        "inline-flex items-center gap-1.5 border border-dashed border-muted-foreground/50 px-2 py-1 font-mono text-xs text-muted-foreground",
        className
      )}
    >
      <Lock className="h-3 w-3 shrink-0" aria-hidden="true" />
      פרויקט ללקוח · קוד סגור
    </span>
  );
}
