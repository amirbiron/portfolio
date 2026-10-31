/**
 * כפתור שפותח כתובת חיצונית בלשונית חדשה — כקישור אמיתי (<a href>) ולא דרך window.open,
 * כדי שמנועי חיפוש יזהו אותו, ושמבקר יוכל להעתיק אותו או לפתוח אותו בקליק אמצעי.
 * קישור עם target="_blank" לא נותן לעמוד החדש גישה לחלון שלנו (window.opener), בניגוד ל-window.open.
 * המאפיין rel="noopener" אומר את זה במפורש, ובכוונה בלי noreferrer: היעד ממשיך לקבל את ה-Referer, כמו קודם.
 * מקור: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/noopener
 *
 * בנתוני הפרויקטים, הכתובת "#" מסמנת קישור שעוד לא זמין. אז נשאר כפתור, שמציג את unavailableMessage.
 */
import type { ComponentProps } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ExternalLinkButtonProps = Omit<ComponentProps<typeof Button>, "asChild" | "onClick"> & {
  href: string;
  unavailableMessage?: string;
};

export function ExternalLinkButton({ href, unavailableMessage, children, ...buttonProps }: ExternalLinkButtonProps) {
  if (href === "#") {
    return (
      <Button {...buttonProps} onClick={() => unavailableMessage && toast.info(unavailableMessage)}>
        {children}
      </Button>
    );
  }

  return (
    <Button {...buttonProps} asChild>
      <a href={href} target="_blank" rel="noopener">
        {children}
      </a>
    </Button>
  );
}
