/**
 * חלון "תהליך העבודה" בדף הבית. לחיצה בכל מקום בכרטיס מכווצת אותו לרשימה ממוספרת של שש הכותרות בשני טורים,
 * ולחיצה נוספת, או גרירה של הפס "החלק לפירוט" שבתחתית הכרטיס המכווץ, מרחיבה אותו בחזרה, והשלבים רצים שוב
 * מההתחלה (WorkflowSteps נטען מחדש).
 * מבוסס על רכיבים מ-finesse:
 * - expand-card: הגובה משתנה עם עקומת הקפיצה שלו, cubic-bezier(.2, 1.3, .3, 1) בחצי שנייה.
 * - spring-dropdown: הכותרות נכנסות אחת אחרי השנייה מלמעלה, עם קפיצה (ראו CollapsedSteps).
 * - slide-confirm: הפס "החלק לפירוט" (SlideToExpand), שמראה שאפשר להרחיב את הכרטיס בחזרה.
 * מה שמתחת לכרטיס (טופס יצירת הקשר) עולה ויורד יחד עם הגובה, כי הכרטיס הוא חלק מזרימת העמוד.
 * אין כפתור כיווץ גלוי, בהחלטת בעל הפרויקט: הלחיצה על הכרטיס עצמו מכווצת אותו. למקלדת ולקוראי מסך יש כפתור
 * "פירוט" בשורת הכותרת, שמוסתר מהעין ומופיע רק כשמגיעים אליו ב-Tab (ראו DetailsToggle).
 */
import {
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type Ref,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import { ChevronDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyTextButton } from "@/components/CopyTextButton";
import { SlideToExpand } from "@/components/SlideToExpand";
import { WorkflowSteps } from "@/components/WorkflowSteps";
import { workflowAsText, workflowSteps } from "@/lib/workflow";
import { cn } from "@/lib/utils";

/** עקומת הקפיצה של expand-card. framer-motion לא חותך ערכים מעל 1, ולכן יש קפיצה קטנה מעבר ליעד.
 *  מקור: cubicBezier ב-node_modules/motion-utils/dist/es/easing/cubic-bezier.mjs */
const SPRING_EASE = [0.2, 1.3, 0.3, 1] as const;

/** עקומת הקפיצה של spring-dropdown, לכניסת הכותרות בכרטיס המכווץ */
const DROPDOWN_EASE = [0.2, 1.5, 0.3, 1] as const;

/**
 * הרוחב המקסימלי של הכרטיס המכווץ: בערך הרוחב של הכרטיס בנייד (358px ברוחב 390), שבעל הפרויקט אישר.
 * במסך רחב הכרטיס המכווץ מצטמצם לרוחב הזה ועומד במרכז, ובנייד הוא ממילא צר יותר, ולכן לא משתנה.
 */
const COLLAPSED_MAX_WIDTH = "22.5rem";
/** משך השינוי ברוחב, באותה עקומה כמו הגובה */
const WIDTH_MS = 500;

export function WorkflowCard() {
  const [collapsed, setCollapsed] = useState(false);
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // המזהה של מיכל התוכן, בשביל aria-controls של כפתור "פירוט"
  const contentId = useId();
  // גובה המיכל של התוכן. מהמדידה הראשונה הוא מספר מפורש, ולא auto: כשהתוכן מתחלף (מלא ↔ מכווץ), המיכל
  // נשאר בגובה הקודם ומונפש ממנו לגובה החדש. עם auto המיכל היה מתכווץ לבד, מיד, עוד לפני שהאנימציה מתחילה
  // (נמדד: בלי הנעילה הכיווץ קפץ מ-760 ל-176 פיקסלים בפריים אחד, וההרחבה כן הונפשה).
  const height = useMotionValue(0);
  const [heightLocked, setHeightLocked] = useState(false);
  const lockedRef = useRef(false);
  // רוחב הכרטיס: צר כשהוא מכווץ. נפרד מ-collapsed, כי בהרחבה הרוחב משתנה קודם, ורק אחריו התוכן (ראו expand)
  const [narrow, setNarrow] = useState(false);
  const expandTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  useEffect(() => () => clearTimeout(expandTimer.current), []);

  // מודד את התוכן בכל שינוי גודל: מעבר בין מלא למכווץ, וגם סיבוב מסך או שינוי רוחב חלון.
  // המדידה הראשונה (ומצב של פחות תנועה) קובעת את הגובה מיד; השאר מונפשות בעקומה של expand-card.
  // animate(MotionValue<number>, יעד, אפשרויות) ו-stop() על מה שהוא מחזיר: index.d.ts של framer-motion 12.23.22
  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;
    let controls: ReturnType<typeof animate> | undefined;
    const observer = new ResizeObserver(() => {
      const target = content.offsetHeight;
      controls?.stop();
      if (!lockedRef.current || reduceMotion) {
        height.set(target);
        lockedRef.current = true;
        setHeightLocked(true);
        return;
      }
      controls = animate(height, target, { duration: 0.5, ease: SPRING_EASE });
    });
    observer.observe(content);
    return () => {
      observer.disconnect();
      controls?.stop();
    };
  }, [height, reduceMotion]);

  // כשהתוכן מתחלף (מלא ↔ מכווץ), מה שהיה בתוכו נמחק מהעמוד. אם הפוקוס היה שם, למשל על הידית של "החלק לפירוט"
  // אחרי Enter, הדפדפן מוריד אותו ל-body, ומשתמש המקלדת צריך להתחיל מתחילת העמוד (נמדד לפני התיקון).
  // לכן מעבירים אותו לכפתור "פירוט" שבכותרת, שלא מתחלף. focus() מסקריפט מציג את הפוקוס רק אם הפוקוס הקודם
  // הוצג, ולכן אחרי גרירה בעכבר הכפתור מקבל את הפוקוס בלי להופיע. מקור: ההיוריסטיקות של :focus-visible
  // ב-Selectors Level 4, https://www.w3.org/TR/selectors-4/#the-focus-visible-pseudo
  const keepFocus = () => {
    if (contentRef.current?.contains(document.activeElement)) {
      toggleRef.current?.focus();
    }
  };

  // כיווץ: התוכן מתחלף לרשימה הקצרה, והגובה והרוחב קטנים יחד. הרשימה לא תלויה ברוחב, ולכן הגובה שלה לא זז בדרך.
  // כיווץ אחרי גלילה לתחתית הכרטיס היה משאיר את הכרטיס הקטן מעל המסך: מחזירים את ראש הכרטיס למסך.
  // ראש הכרטיס לא זז כשהגובה משתנה (רק התחתית זזה), ולכן הגלילה מדויקת גם בזמן האנימציה
  const collapse = () => {
    keepFocus();
    const card = cardRef.current;
    if (card && card.getBoundingClientRect().top < 0) {
      card.scrollIntoView({
        block: "start",
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
    setCollapsed(true);
    setNarrow(true);
  };

  // הרחבה בשני שלבים: קודם הכרטיס חוזר לרוחב המלא, ורק אחר כך השלבים נכנסים והגובה גדל. אם שניהם היו קורים יחד,
  // הטקסט של השלבים היה נשבר מחדש לאורך כל שינוי הרוחב, והגובה היה רודף אחרי יעד שזז.
  // כשהרוחב ממילא לא משתנה (נייד, שבו הכרטיס צר מ-COLLAPSED_MAX_WIDTH) או בהפחתת תנועה, אין למה לחכות
  const expand = () => {
    keepFocus();
    setNarrow(false);
    const card = cardRef.current;
    const widthWillChange =
      !!card?.parentElement &&
      card.parentElement.clientWidth > card.offsetWidth + 1;
    clearTimeout(expandTimer.current);
    if (reduceMotion || !widthWillChange) {
      setCollapsed(false);
      return;
    }
    expandTimer.current = setTimeout(() => setCollapsed(false), WIDTH_MS);
  };

  const toggle = (event: MouseEvent<HTMLDivElement>) => {
    // כפתורים וקישורים בתוך הכרטיס (Contact Me, העתק) והפס "החלק לפירוט" עושים את שלהם, ולא מכווצים
    // או מרחיבים את הכרטיס: גרירה של הפס מסתיימת בלחיצה, שאחרת הייתה מגיעה גם לכרטיס
    if (
      event.target instanceof Element &&
      event.target.closest("button, a, [data-no-card-toggle]")
    )
      return;
    // לחיצה שמסיימת סימון טקסט (כדי להעתיק) היא לא בקשה לכווץ
    if (window.getSelection()?.toString()) return;
    if (collapsed) expand();
    else collapse();
  };

  return (
    <div
      ref={cardRef}
      className="terminal-window mx-auto cursor-pointer"
      onClick={toggle}
      style={{
        // מעבר בין 100% לרוחב קבוע: הדפדפן מנפיש בין אחוזים ל-rem (שניהם אורך)
        maxWidth: narrow ? COLLAPSED_MAX_WIDTH : "100%",
        transition: reduceMotion
          ? "none"
          : `max-width ${WIDTH_MS}ms cubic-bezier(.2, 1.3, .3, 1)`,
      }}
    >
      <div className="terminal-header">
        <div className="terminal-dot border-primary" />
        <div className="terminal-dot border-accent" />
        <div className="terminal-dot border-destructive" />
        <span className="text-sm text-muted-foreground ml-2">workflow.log</span>
        <div className="ml-auto flex items-center gap-2">
          <DetailsToggle
            ref={toggleRef}
            expanded={!collapsed}
            controls={contentId}
            onToggle={() => (collapsed ? expand() : collapse())}
          />
          {/* בכרטיס המכווץ אין מה להעתיק, ולכן גם אין כפתור */}
          {!collapsed && (
            <CopyTextButton
              text={workflowAsText()}
              label="העתק"
              title="העתק את תהליך העבודה ללוח"
              compact
            />
          )}
        </div>
      </div>

      <motion.div
        id={contentId}
        className="overflow-hidden"
        style={heightLocked ? { height } : undefined}
      >
        <div ref={contentRef} className="p-8">
          {collapsed ? (
            <>
              <CollapsedSteps />
              <div className="mt-8 flex justify-center">
                <SlideToExpand label="החלק לפירוט" onConfirm={expand} />
              </div>
            </>
          ) : (
            <>
              <WorkflowSteps steps={workflowSteps} />
              {/* אותו כפתור כמו Contact Me ב-Hero: גולל לטופס שמתחת. המיכל משמאל לימין, ולכן הכפתור
                  בצד שמאל של החלון, כמו כפתורי ה-Hero */}
              <div dir="ltr" className="mt-8">
                <Button
                  variant="outline"
                  className="border-accent text-accent hover:bg-accent/10 transition-all hover:scale-105"
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Me
                </Button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * כפתור "פירוט" בשורת הכותרת: הדרך לכווץ ולהרחיב את הכרטיס מהמקלדת ומקורא מסך.
 * הכרטיס עצמו לא הופך לכפתור (role="button"), כי לכפתור יש Children Presentational: True, והדפדפן לא אמור
 * לחשוף לטכנולוגיה מסייעת את מה שבתוכו. כך "העתק", Contact Me והידית היו נעלמים לקורא המסך.
 * מקור: WAI-ARIA 1.2, טבלת התכונות של button וסעיף 5.2.9, https://www.w3.org/TR/wai-aria-1.2/#button
 * הכפתור מוסתר מהעין (sr-only) ומופיע רק בפוקוס מקלדת (focus-visible), כדי שמשתמשי עכבר ומגע לא יראו
 * כפתור נוסף. not-sr-only מאפס גם את הריפוד, ולכן הריפוד על ה-span הפנימי (sr-only ו-not-sr-only:
 * node_modules/tailwindcss/dist/lib.js, גרסה 4.1.14).
 * השם קבוע, "פירוט תהליך העבודה", והמצב עובר ב-aria-expanded (true כשהפירוט המלא מוצג), ו-aria-controls
 * מצביע על מיכל התוכן. Enter ורווח מפעילים כפתור מעצמם, ואין צורך בטיפול נפרד במקלדת.
 * מקור: תבנית Disclosure ב-APG, https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
 * המילה הגלויה "פירוט" היא תחילת השם, כדי שמי שמפעיל בקול יוכל לומר את מה שהוא רואה.
 * מקור: WCAG 2.5.3 Label in Name, https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html
 */
function DetailsToggle({
  ref,
  expanded,
  controls,
  onToggle,
}: {
  ref?: Ref<HTMLButtonElement>;
  expanded: boolean;
  controls: string;
  onToggle: () => void;
}) {
  return (
    <button
      ref={ref}
      type="button"
      dir="rtl"
      aria-label="פירוט תהליך העבודה"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className="sr-only rounded-md font-mono text-xs text-muted-foreground outline-none hover:text-primary focus-visible:not-sr-only focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <span className="inline-flex h-6 items-center gap-1 px-2">
        פירוט
        {/* חץ למטה כשהכרטיס מכווץ (יש עוד מה לפתוח), ולמעלה כשהוא פתוח */}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 transition-transform motion-reduce:transition-none",
            expanded && "rotate-180"
          )}
        />
      </span>
    </button>
  );
}

/**
 * המצב המכווץ: רשימה ממוספרת של הכותרות בשני טורים, 1–3 בטור הימני ו-4–6 בטור השמאלי
 * (grid-flow-col עם שלוש שורות ממלא טור אחרי טור, וב-dir="rtl" הטור הראשון הוא הימני).
 * הכניסה לפי spring-dropdown: כל כותרת יורדת 14px וגדלה מ-0.92, בחצי שנייה עם קפיצה, והשקיפות ב-0.25 שנייה.
 * ההשהיה, 55ms בין כותרת לכותרת, לפי סדר המספרים: הטור הימני יורד מלמעלה למטה, ואחריו השמאלי.
 * המספר והכותרת באותה שורת טקסט (ולא כפריטי flex נפרדים), כדי שהנקודה תופיע בין המספר לכותרת כמו ברשימה עברית.
 * פרמטר transition עם default וערך נפרד ל-opacity: TransitionWithValueOverrides ב-motion-dom (framer-motion 12.23.22).
 */
function CollapsedSteps() {
  return (
    <ol
      dir="rtl"
      className="grid grid-flow-col grid-cols-2 grid-rows-3 gap-x-8 gap-y-3"
    >
      {workflowSteps.map((step, i) => (
        <motion.li
          key={step.title}
          initial={{ opacity: 0, y: -14, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            default: { duration: 0.5, ease: DROPDOWN_EASE, delay: i * 0.055 },
            opacity: { duration: 0.25, delay: i * 0.055 },
          }}
        >
          <span className="font-mono text-primary">{i + 1}.</span>{" "}
          <span className="font-bold text-foreground/90">{step.title}</span>
        </motion.li>
      ))}
    </ol>
  );
}
