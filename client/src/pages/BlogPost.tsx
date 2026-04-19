/**
 * Terminal Aesthetic Portfolio - Blog Post Page
 * Design: Retro-futurism with 1980s terminal aesthetic
 */

import "../blog-styles.css";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { Streamdown } from 'streamdown';

// Blog posts data
const blogPosts = {
  "whatsapp-bot-python-guide": {
    title: "איך לבנות בוט WhatsApp שעובד כמו מוצר אמיתי",
    date: "14-03-2026",
    content: `> הלקחים, הדפוסים והמלכודות מבניית בוט WhatsApp שרץ בפרודקשן — עם דוגמאות קוד ב-Python ו-FastAPI.
---
ה-webhook מקבל הודעה, ה-State Machine מחליט באיזה שלב של השיחה נמצא המשתמש, השירותים מבצעים את הלוגיקה, וההודעות החוזרות נשלחות אסינכרונית. פשוט ברעיון, מורכב בביצוע.
---
## 1. קבלת הודעות — Webhook Handler
### הבעיה הראשונה: WhatsApp לא מחכה
WhatsApp מצפה לתגובת 200 תוך 15 שניות. אם לא — הוא שולח שוב. ושוב. לכן הכלל הראשון:
\`\`\`python
@router.post("/webhook")
async def whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    payload = await request.json()
    message = parse_payload(payload)
    # מחזירים 200 מיד, מעבדים ברקע
    background_tasks.add_task(process_message, db, message)
    return {"status": "ok"}
\`\`\`
> **מלכודת:** לעולם לא \`asyncio.create_task()\` בתוך webhook. הוא בולע exceptions בשקט ואי אפשר לדעת שמשהו נכשל. תמיד \`background_tasks.add_task()\` של FastAPI.
### מניעת כפילויות — Idempotency
WhatsApp שולח retries. בלי הגנה, המשתמש יקבל תגובה כפולה. הפתרון: טבלת \`webhook_events\` ב-DB עם INSERT אופטימיסטי:
\`\`\`python
async def _try_acquire_message(db: AsyncSession, message_id: str) -> bool:
    """מחזיר True אם ההודעה חדשה, False אם כפולה"""
    try:
        async with db.begin_nested():
            db.add(WebhookEvent(
                message_id=message_id,
                status="processing",
            ))
        await db.commit()
        return True  # הודעה חדשה — מעבדים
    except IntegrityError:
        pass  # הודעה כבר קיימת
    # בדיקה: אולי ההודעה תקועה ב-processing (הסשן קרס)?
    row = await db.execute(
        select(WebhookEvent).where(WebhookEvent.message_id == message_id)
    )
    event = row.scalar_one_or_none()
    if event and event.status == "completed":
        return False  # כבר טופלה — דילוג
    # תקועה יותר מ-2 דקות? מאפשרים retry
    if (now() - event.created_at).seconds > 120:
        return True
    return False
\`\`\`
**למה DB ולא cache?** כי cache נעלם בריסטארט, לא משותף בין workers, ולא שורד כשלונות. DB נותן idempotency אמיתי.
### אימות חתימה — לוודא שההודעה מ-WhatsApp
\`\`\`python
def verify_signature(request: Request, body: bytes) -> bool:
    """HMAC-SHA256 — מוודא שה-webhook הגיע מ-Meta"""
    signature = request.headers.get("X-Hub-Signature-256", "")
    expected = hmac.new(
        settings.APP_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
\`\`\`

בלי אימות, כל אחד יכול לשלוח בקשות ל-webhook שלכם ולגרום לבוט לבצע פעולות.
---
## 2. מנוע השיחה — State Machine
הלב של כל בוט שעושה יותר מלענות על שאלות. כל משתמש נמצא ב-**state** — ה-state קובע מה קורה עם ההודעה הבאה.
### הגדרת States
\`\`\`python
class UserState(str, Enum):
    INITIAL = "INITIAL"
    NEW = "USER.NEW"
    # רישום
    REGISTER_NAME = "USER.REGISTER.NAME"
    REGISTER_PHONE = "USER.REGISTER.PHONE"
    # תפריט ראשי
    MENU = "USER.MENU"
    # טופס מרובה שלבים
    FORM_STEP_1 = "USER.FORM.STEP_1"
    FORM_STEP_2 = "USER.FORM.STEP_2"
    FORM_STEP_3 = "USER.FORM.STEP_3"
    FORM_CONFIRM = "USER.FORM.CONFIRM"
\`\`\`
**למה \`str, Enum\`?** ה-state נשמר ב-DB כמחרוזת. \`str, Enum\` מאפשר השוואה ישירה (\`state == "USER.MENU"\`) וגם type safety.
**קונבנציית שמות:** prefix לפי תפקיד (\`USER.\`, \`ADMIN.\`), ואז הזרימה (\`REGISTER.\`, \`FORM.\`). זה מאפשר guard functions שבודקות \`state.startswith("USER.FORM.")\` — לדעת בקלות אם המשתמש באמצע טופס.
### מפת מעברים — מה מותר
\`\`\`python
TRANSITIONS = {
    UserState.INITIAL: [UserState.NEW, UserState.REGISTER_NAME, UserState.MENU],
    UserState.REGISTER_NAME: [UserState.REGISTER_PHONE, UserState.MENU],
    UserState.REGISTER_PHONE: [UserState.MENU],
    UserState.MENU: [UserState.FORM_STEP_1],
    UserState.FORM_STEP_1: [UserState.FORM_STEP_2],
    UserState.FORM_STEP_2: [UserState.FORM_STEP_3],
    UserState.FORM_STEP_3: [UserState.FORM_CONFIRM],
    UserState.FORM_CONFIRM: [UserState.MENU],
}
\`\`\`
כל מעבר state **חייב** להיות מוגדר מראש. אם handler מנסה לעבור ל-state שלא ברשימה — \`transition_to\` מחזיר \`False\`. זה מונע באגים שקטים שבהם המשתמש מגיע למצב בלתי אפשרי.
### StateManager — שמירת המצב
\`\`\`python
class StateManager:
    async def get_or_create_session(self, user_id: int, platform: str):
        """מחזיר סשן קיים או יוצר חדש"""
        result = await self.db.execute(
            select(ConversationSession).where(
                ConversationSession.user_id == user_id,
                ConversationSession.platform == platform,
            )
        )
        session = result.scalar_one_or_none()
        if not session:
            session = ConversationSession(
                user_id=user_id,
                platform=platform,
                current_state=UserState.INITIAL.value,
            )
            self.db.add(session)
            await self.db.commit()
        return session
    async def transition_to(self, user_id, platform, new_state, context_update=None):
        """מעבר state — רק אם מותר"""
        session = await self.get_or_create_session(user_id, platform)
        if not self._is_valid_transition(session.current_state, new_state):
            return False
        session.current_state = new_state
        if context_update:
            context = copy.deepcopy(session.context_data or {})
            context.update(context_update)
            session.context_data = context
        await self.db.commit()
        return True
\`\`\`
**Context** — כל סשן מחזיק \`dict\` של context. כשמשתמש ממלא טופס בשלושה שלבים, כל שלב שומר את הנתונים ב-context, ורק בשלב האישור הכל נכתב ל-DB. זה מאפשר ביטול באמצע בלי שנשאר זבל ב-DB.
> **טיפ:** SQLAlchemy לא מזהה שינויים בעמודות JSON. חובה \`copy.deepcopy\` לפני update, אחרת השינוי לא יישמר.
### Handler — הדפוס המרכזי
\`\`\`python
async def handle_message(self, user, message, context):
    handler = self._get_handler(current_state)  # dispatch לפי state
    response, new_state, context_update = await handler(user, message, context)
    # ניקוי context ביציאה מזרימה
    if new_state == UserState.MENU.value and self._is_form_flow(current_state):
        context_update = {
            "form_field_1": None,
            "form_field_2": None,
            "form_field_3": None,
        }
    await self.state_manager.transition_to(user.id, platform, new_state, context_update)
    return response
\`\`\`
**שלוש הפלטים של כל handler:**
1. \`response\` — מה לשלוח למשתמש
2. \`new_state\` — לאיזה state לעבור
3. \`context_update\` — מה לשמור ב-context
**ניקוי context** — כשמשתמש חוזר לתפריט הראשי, חובה לנקות את ה-context של הזרימה הקודמת. בלי ניקוי, context ישן עלול לגרום לפעולה על נתונים מיושנים בפעם הבאה.
### Guard Functions — הגנה על טפסים רב-שלביים
\`\`\`python
def _is_in_multi_step_flow(state: str) -> bool:
    """האם המשתמש באמצע טופס?"""
    return (
        state.startswith("USER.FORM.")
        or state.startswith("USER.REGISTER.")
    )
\`\`\`
**למה?** נניח שיש לכם keyword trigger: כשמשתמש כותב "עזרה" — הבוט מציג הוראות. אבל מה אם המשתמש באמצע טופס ושם שדה הוא "מרכז עזרה"? בלי guard, המילה "עזרה" תפעיל את ה-trigger במקום להתקבל כקלט. Guard functions מוודאות שבזמן זרימה רב-שלבית, רק ה-handler של אותה זרימה מטפל בהודעה.
\`\`\`python
# לא נכון — תופס מילות מפתח גם באמצע טופס
if "עזרה" in text:
    return help_response()
# נכון — בודקים קודם אם באמצע זרימה
if not _is_in_multi_step_flow(current_state):
    if "עזרה" in text:
        return help_response()
\`\`\`
---
## 3. שליחת הודעות — Provider Pattern
### ממשק אחיד
יום אחד אתם משתמשים ב-Cloud API של Meta, למחרת אתם רוצים WPPConnect, ואולי מחר ספק אחר. אם הקוד שלכם קשור לספק ספציפי — אתם בבעיה.
\`\`\`python
class BaseWhatsAppProvider(ABC):
    @abstractmethod
    async def send_text(self, to: str, text: str, keyboard=None) -> None:
        """שליחת טקסט עם כפתורים אופציונליים"""
    @abstractmethod
    async def send_media(self, to: str, media_url: str, media_type: str = "image") -> None:
        """שליחת תמונה/מסמך/וידאו"""
    @abstractmethod
    def format_text(self, html_text: str) -> str:
        """המרת HTML → פורמט הספק (*bold*, _italic_)"""
    @abstractmethod
    def normalize_phone(self, phone: str) -> str:
        """נרמול לפורמט E.164: 0501234567 → +972501234567"""
\`\`\`
השירותים העסקיים תלויים רק בממשק. החלפת ספק = מימוש חדש של הממשק, אפס שינויים בלוגיקה.
### Retry — לא כל כשלון הוא סופי
\`\`\`python
async def _send_with_retry(self, endpoint: str, payload: dict):
    for attempt in range(self._max_retries):
        response = await client.post(
            f"{self._gateway_url}/{endpoint}",
            json=payload,
        )
        if response.status_code == 200:
            return
        # שגיאות זמניות — שווה לנסות שוב
        if response.status_code in (429, 502, 503, 504):
            backoff = 2 ** attempt  # 1s, 2s, 4s
            logger.warning("שגיאה זמנית, ממתין", extra_data={
                "status_code": response.status_code,
                "retry_in": backoff,
            })
            await asyncio.sleep(backoff)
            continue
        # שגיאה קבועה — אין טעם לנסות שוב
        raise WhatsAppError(f"Failed: {response.status_code}")
\`\`\`
**429 (Rate Limit)** — WhatsApp מגביל כמות הודעות. Exponential backoff נותן ל-API לנשום.
### Circuit Breaker — הגנה מפני כשלון מדורג
כש-WhatsApp API למטה, אלפי הודעות ממתינות לשליחה. בלי הגנה, כולן ינסו, ייכשלו, ינסו שוב — ויציפו את השרת.
\`\`\`python
class CircuitBreaker:
    """
    שלושה מצבים:
    CLOSED  → עובד רגיל, סופר כשלונות
    OPEN    → API למטה, חוסם הכל (מונע הצפה)
    HALF_OPEN → מנסה בקשה אחת לבדוק אם השירות חזר
    """
    @classmethod
    def get_instance(cls, service_name: str) -> "CircuitBreaker":
        """Singleton לכל שירות — Telegram ו-WhatsApp נפרדים"""
        if service_name not in cls._instances:
            cls._instances[service_name] = cls(
                name=service_name,
                config=CircuitBreakerConfig(
                    failure_threshold=5,     # 5 כשלונות רצופים → OPEN
                    timeout_seconds=30.0,    # אחרי 30 שניות → HALF_OPEN
                    success_threshold=2,     # 2 הצלחות → CLOSED
                ),
            )
        return cls._instances[service_name]
    async def execute(self, func, *args, **kwargs):
        if self._state == CircuitState.OPEN:
            if self._should_try_half_open():
                self._state = CircuitState.HALF_OPEN
            else:
                raise CircuitBreakerOpenError(self._name)
        try:
            result = await func(*args, **kwargs)
            self._record_success()
            return result
        except Exception as e:
            self._record_failure()
            raise
\`\`\`
---
## 4. Transactional Outbox — הודעות שלא הולכות לאיבוד
### הבעיה
מה קורה כשפעולה עסקית הצליחה (נשמרה ב-DB) אבל שליחת ההודעה ל-WhatsApp נכשלה? המשתמש לא יודע שהפעולה בוצעה.
### הפתרון
ההודעה נשמרת בטבלת outbox **באותה טרנזקציה** עם הפעולה העסקית:
\`\`\`python
class OutboxService:
    async def queue_message(self, recipient_id, content, platform="whatsapp"):
        """ההודעה נכנסת ל-outbox באותה טרנזקציה עם הפעולה העסקית"""
        self.db.add(OutboxMessage(
            platform=platform,
            recipient_id=recipient_id,
            content=content,
            status=MessageStatus.PENDING,
        ))
        # אין commit כאן — ה-commit קורה יחד עם הפעולה העסקית
\`\`\`
\`\`\`python
def _calculate_backoff(retry_count: int, base: int = 2, max_seconds: int = 3600) -> int:
    """Exponential backoff עם תקרה"""
    return min(base * (2 ** retry_count), max_seconds)
\`\`\`

**למה לא לשלוח ישירות?** כי זה מעכב את התגובה למשתמש, ואם השליחה נכשלת אחרי שה-DB כבר עודכן — אין דרך לדעת. Outbox מבטיח: אם הפעולה נשמרה, ההודעה **תישלח** — גם אם לוקח כמה ניסיונות.
---
## 5. פעולות מקביליות — Row-Level Locking
כשכמה משתמשים מנסים לבצע את אותה פעולה בו-זמנית (למשל: תפיסת פריט, עדכון יתרה), צריך נעילה:
\`\`\`python
async def claim_item(self, user_id: int, item_id: int):
    # 1. נעילת שורה — רק אחד יכול לגעת בה
    item = await self.db.execute(
        select(Item)
        .where(Item.id == item_id)
        .with_for_update()  # FOR UPDATE
    )
    # 2. בדיקת סטטוס
    if item.status != "available":
        raise AlreadyClaimedError(item_id)
    # 3. עדכון אטומי
    item.status = "claimed"
    item.claimed_by = user_id
    # 4. הודעה ב-outbox (אותה טרנזקציה!)
    await self.outbox.queue_message(
        recipient_id=user_id,
        content={"text": "הפריט שלך!"},
    )
    await self.db.commit()  # הכל ביחד, או כלום
\`\`\`
> **מלכודת PostgreSQL:** אסור \`joinedload()\` עם \`with_for_update()\`. PostgreSQL דוחה \`FOR UPDATE\` על \`LEFT OUTER JOIN\` שנוצר מ-joinedload. הפתרון: שאילתה ראשונה עם נעילה, שאילתה שנייה לטעינת קשרים.
---
## 6. אבטחה — הדברים שמחכים לכם בפרודקשן
### ולידציית קלט
משתמשים שולחים הכל. SQL injection, XSS, טקסט עם null bytes. כל קלט חייב לעבור סניטציה:
\`\`\`python
class TextSanitizer:
    @staticmethod
    def sanitize(text: str, max_length: int = 1000) -> str:
        """strip, חיתוך, הסרת null bytes, כיווץ רווחים"""
    @staticmethod
    def check_for_injection(text: str) -> tuple[bool, str | None]:
        """סריקת SQL injection, XSS, command injection"""
        # OR 1=1, UNION SELECT, <script>, javascript:, onclick=
\`\`\`
### מיסוך PII בלוגים
מספרי טלפון הם PII (Personally Identifiable Information). אסור שיופיעו בלוגים:
\`\`\`python
class PhoneNumberValidator:
    @staticmethod
    def mask(phone: str) -> str:
        """'+972501234567' → '+97250123****'"""
# לעולם לא
logger.info(f"הודעה נשלחה ל-{phone}")
# תמיד
logger.info("הודעה נשלחה", extra_data={
    "phone": PhoneNumberValidator.mask(phone)
})
\`\`\`
### Rate Limiting על Webhooks
\`\`\`python
class WebhookRateLimitMiddleware:
    """Sliding window: 100 בקשות ל-60 שניות, לפי IP"""
    # מחזיר 429 + Retry-After header + correlation ID
\`\`\`

בלי rate limiting, תוקף יכול להציף את ה-webhook שלכם ולגרום ל-DoS.
---
## 7. Middleware Stack
\`\`\`python
app.add_middleware(SecurityHeadersMiddleware)     # HSTS, CSP
app.add_middleware(CorrelationIdMiddleware)        # מזהה ייחודי לכל בקשה
app.add_middleware(RequestLoggingMiddleware)       # לוגים עם מיסוך PII
app.add_middleware(WebhookRateLimitMiddleware)     # הגנה מפני הצפה
\`\`\`
**Correlation ID** — כל בקשה מקבלת מזהה ייחודי שעובר דרך כל השכבות. כשיש באג בפרודקשן ומשתמש מדווח "ההודעה לא הגיעה", אתם מחפשים את ה-correlation ID בלוגים ורואים בדיוק מה קרה — מה-webhook, דרך ה-state machine, ועד לניסיון השליחה.
\`\`\`python
# אוטומטי בכל log
{
    "timestamp": "2026-03-14T10:30:00Z",
    "level": "ERROR",
    "correlation_id": "a1b2c3d4",
    "message": "שליחה נכשלה",
    "extra": {"phone": "+97250123****", "retry": 3}
}
\`\`\`
---
## 8. כפתורים ותצוגה — המלכודות
### כפתורים הם plain text
\`\`\`python
class MessageResponse:
    def __init__(self, text: str, keyboard: list[list[str]] | None = None):
        self.text = text
        self.keyboard = keyboard  # [["אישור", "ביטול"], ["חזור"]]
\`\`\`
**מלכודת:** כפתורי WhatsApp/Telegram הם plain text. אם תעשו \`html.escape()\` על טקסט כפתור, המשתמש יראה \`&amp;\` במקום \`&\`. ה-escape נדרש רק בגוף ההודעה.
\`\`\`python
# html entities בכפתור
keyboard.append([f"📦 {html.escape(item_name)}"])  # מציג: Ben &amp; Jerry's
# טקסט רגיל בכפתור
keyboard.append([f"📦 {item_name}"])  # מציג: Ben & Jerry's
\`\`\`
### חילוץ בחירה מכפתור — עיגון regex
כשמשתמש לוחץ כפתור, הטקסט של הכפתור חוזר כהודעה. צריך לחלץ ממנו את הבחירה:
\`\`\`python
# תופס כל מספר — גם בטקסט חופשי
match = re.search(r"(\\d+)", text)
# מעוגן לפורמט הכפתור
match = re.match(r"📦\\s*(\\d+)\\.", text)
\`\`\`
### המרת פורמט בין פלטפורמות
אם הבוט תומך גם ב-Telegram — הפורמט שונה:
\`\`\`python
def convert_html_to_whatsapp(text: str) -> str:
    """Telegram HTML → WhatsApp Markdown"""
    # <b>bold</b>     → *bold*
    # <i>italic</i>   → _italic_
    # <s>strike</s>   → ~strike~
    # <code>code</code> → \\\`code\\\`
\`\`\`
---
## 9. ניתוב לפי תפקידים
כשיש כמה סוגי משתמשים (לקוח, מנהל, ספק), הניתוב חייב להיות מפורש:
\`\`\`python
# else גנרי — מה קורה עם תפקיד חדש?
if user.role == "admin":
    handler = AdminHandler(db)
else:
    handler = UserHandler(db)  # גם manager? גם support?
# מפורש — כל תפקיד מטופל
if user.role == "admin":
    handler = AdminHandler(db)
elif user.role == "user":
    handler = UserHandler(db)
elif user.role == "manager":
    handler = ManagerHandler(db)
else:
    logger.warning("תפקיד לא מוכר", extra_data={"role": user.role})
    return unknown_role_response()
\`\`\`

כשמוסיפים תפקיד חדש ושוכחים לעדכן \`else\` — הבאג שקט ומתגלה רק כשמשתמש עם התפקיד החדש מדווח שמשהו לא עובד.
---
## 10. בדיקת None — המלכודת הכי שקטה
\`\`\`python
# 0 הוא falsy — ערכים לגיטימיים נעלמים
if user.latitude:
    save_location(user.latitude)  # קואורדינטה 0 = לא נשמר!
if price:
    apply_discount(price)  # מחיר 0 = לא מופעל!
# בדיקת None מפורשת
if user.latitude is not None:
    save_location(user.latitude)
if price is not None:
    apply_discount(price)
\`\`\`

כלל: בכל ערך מספרי שאפס הוא ערך תקין — \`is not None\`, לא \`if value\`.
---
## סיכום — 10 עקרונות לבוט WhatsApp שעובד
1. **תחזיר 200 מיד** — WhatsApp לא מחכה. עבד ברקע
2. **Idempotency** — WhatsApp שולח retries. מנע כפילויות ב-DB
3. **State Machine** — כל שיחה היא רצף מצבים. הגדר מעברים מותרים
4. **Guard Functions** — הגן על טפסים רב-שלביים מפני keyword hijacking
5. **ניקוי Context** — כשחוזרים לתפריט, נקו את ה-context של הזרימה הקודמת
6. **Transactional Outbox** — הודעות לא הולכות לאיבוד, גם כשה-API למטה
7. **Circuit Breaker** — כשספק למטה, הפסיקו לנסות. נסו שוב אחרי timeout
8. **Provider Pattern** — אל תהיו תלויים בספק ספציפי. ממשק + מימושים
9. **Row Locking** — פעולות מקביליות חייבות נעילת שורה, לא תקוות
10. **PII Masking** — לעולם לא מספר טלפון בלוגים
הדפוסים האלה לא ייחודיים ל-WhatsApp — הם רלוונטיים לכל בוט שרץ בפרודקשן, בכל פלטפורמה. אבל ב-WhatsApp, בגלל ה-retries, ה-rate limits וההגבלות של ה-API — הם הופכים מ-nice to have ל-must have.
---
*מבוסס על לקחים ממערכת פרודקשן אמיתית. קוד מפושט לצורך הדגמה.*`
  },
  "distributed-lock-mongo": {
    title: "Distributed Lock במונגו – פתרון ל-telegram.error.Conflict",
    date: "15-02-2026",
    content: `**🔒 Distributed Lock במונגו – פתרון ל-telegram.error.Conflict**

בזמן האחרון נתקלתי בבעיה מעצבנת: הבוט שלי רץ על כמה אינסטנסים. הפתרון? מנגנון נעילה מבוזר (Distributed Lock) מבוסס MongoDB.

**📌 למה צריך את זה?**

כשיש לך כמה אינסטנסים של בוט טלגרם רצים במקביל, כולם מנסים לענות לאותה עדכון - וטלגרם זורק \`telegram.error.Conflict\`. הפתרון הוא לוודא שרק אינסטנס **אחד** יעבד הודעות בכל רגע נתון.

**💡 הרעיון פשוט:**

✅ משתמשים ב-\`upsert\` כדי לרשום 'בעלות' על משימה
✅ מגדירים אינדקס TTL שדואג שהנעילה תשתחרר אוטומטית אם האינסטנס קרס
✅ מוסיפים Heartbeat שמרענן את הנעילה כל עוד אנחנו עובדים

**📝 הקוד המלא:**

\`\`\`python
"""
Distributed Lock במונגו – מניעת telegram.error.Conflict
רעיון:
- יש קולקציה אחת של נעילות (bot_locks)
- כל שירות ננעל לפי SERVICE_ID
- כל אינסטנס מזוהה ע"י INSTANCE_ID
- יש lease עם expiresAt + TTL index לניקוי נעילות יתומות
"""

import os
import asyncio
from datetime import datetime, timedelta
from pymongo import MongoClient, ReturnDocument

MONGODB_URI = os.getenv("MONGODB_URI")
SERVICE_ID = os.getenv("SERVICE_ID", "codebot-prod")
INSTANCE_ID = os.getenv("RENDER_INSTANCE_ID", "local")
LOCK_LEASE_SECONDS = int(os.getenv("LOCK_LEASE_SECONDS", "60"))
LOCK_RETRY_SECONDS = int(os.getenv("LOCK_RETRY_SECONDS", "20"))

client = MongoClient(MONGODB_URI)
locks_col = client["codebot"]["bot_locks"]

# אינדקס TTL – משחרר נעילות יתומות אוטומטית
locks_col.create_index("expiresAt", expireAfterSeconds=0)

async def acquire_lock():
    """
    מנסה לרכוש נעילה עבור SERVICE_ID.
    חוזר רק כשהאינסטנס הנוכחי הוא הבעלים.
    """
    while True:
        now = datetime.utcnow()
        expires = now + timedelta(seconds=LOCK_LEASE_SECONDS)

        doc = locks_col.find_one_and_update(
            {
                "_id": SERVICE_ID,
                "$or": [
                    {"expiresAt": {"$lte": now}},
                    {"owner": INSTANCE_ID},
                ],
            },
            {
                "$set": {
                    "owner": INSTANCE_ID,
                    "expiresAt": expires,
                    "updatedAt": now,
                },
                "$setOnInsert": {
                    "createdAt": now,
                    "host": os.getenv("RENDER_SERVICE_NAME", "local"),
                },
            },
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )

        if doc["owner"] == INSTANCE_ID:
            print(f"✅ lock acquired by {INSTANCE_ID}")
            return

        print(f"🔒 lock held by {doc['owner']}, retry...")
        await asyncio.sleep(LOCK_RETRY_SECONDS)

async def heartbeat():
    """
    מרענן את ה-lease כדי שהנעילה תישאר אצלנו.
    """
    interval = max(5, int(LOCK_LEASE_SECONDS * 0.4))

    while True:
        await asyncio.sleep(interval)
        now = datetime.utcnow()
        new_exp = now + timedelta(seconds=LOCK_LEASE_SECONDS)

        doc = locks_col.find_one_and_update(
            {"_id": SERVICE_ID, "owner": INSTANCE_ID},
            {"$set": {"expiresAt": new_exp, "updatedAt": now}},
            return_document=ReturnDocument.AFTER,
        )

        if not doc:
            print("⚠️ lost lock ownership – exiting")
            os._exit(0)

        print(f"💓 lock heartbeat renewed")

async def main():
    await acquire_lock()
    asyncio.create_task(heartbeat())

    # הפעלת הבוט שלך כאן
    await application.initialize()
    await application.start()
    await application.updater.start_polling()
    await application.updater.idle()

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

**🔑 איך זה עובד?**

1️⃣ **acquire_lock()** - מנסה לרכוש נעילה באמצעות \`upsert\`. אם הנעילה פנויה (או שה-\`expiresAt\` עבר), האינסטנס הנוכחי הופך לבעלים.

2️⃣ **heartbeat()** - רץ ברקע ומרענן את \`expiresAt\` כל כמה שניות. אם האינסטנס איבד בעלות, הוא יוצא אוטומטית.

3️⃣ **TTL Index** - MongoDB מוחק אוטומטית נעילות שפג תוקפן (\`expireAfterSeconds: 0\`)

**💡 טיפ חשוב:**

וודאו שהאינדקס מוגדר נכון במונגו:

\`\`\`python
locks_col.create_index("expiresAt", expireAfterSeconds=0)
\`\`\`

האינדקס הזה דואג שנעילות שפג תוקפן (למשל, כי האינסטנס קרס) יימחקו אוטומטית ולא יחסמו את השירות.

---

**🚀 השתמשתי בזה ב-CodeBot שלי והבעיה נפתרה לגמרי!**

מוזמנים להשתמש ולשתף 🙌`
  },

  "telegram-terminal-bot-guide": {
    title: "מדריך ליצירת בוט טרמינל לטלגרם בפייתון — הרצת קוד מרחוק דרך הצ'אט",
    date: "27-03-2026",
    content: `> איך לבנות בוט טלגרם שמאפשר הרצת קוד Python, JavaScript ופקודות shell — עם מערכת הרשאות, ניהול סשנים, ופריסה ב-Docker.

---

## רקע — למה בוט טרמינל?

לפעמים צריך להריץ פקודה מהירה על השרת, אבל אין גישה נוחה ל-SSH. בוט טרמינל בטלגרם נותן ממשק קליל — שולחים הודעה, מקבלים פלט. מדריך זה מבוסס על יישום אמיתי שרץ בפרודקשן.

> **אזהרה:** בוט כזה מאפשר הרצת קוד שרירותי על השרת. חובה להריץ בסביבה מבודדת (Docker/VM) ולהגביל גישה למשתמשים מורשים בלבד.

---

## מה הבוט יודע לעשות

- **הרצת Python** — עם שמירת מצב (משתנים, פונקציות) בין הרצות
- **הרצת JavaScript** — Node.js עם תמיכה ב-ES6+
- **הרצת Java** — קומפילציה והרצה אוטומטית עם זיהוי שם המחלקה
- **פקודות Shell** — עם שמירת working directory ו-env vars בין פקודות
- **מערכת הרשאות** — allowlist דינמי לפקודות, הגבלה למשתמשים מורשים
- **מצב Inline** — הרצת קוד מכל צ'אט
- **דיווח פעילות** — מעקב אוטומטי ל-MongoDB
- **ניהול סשנים** — מצב נפרד לכל צ'אט

---

## הקמת הפרויקט

### שלב 1: יצירת בוט בטלגרם

1. פתחו את \`@BotFather\` בטלגרם
2. שלחו \`/newbot\`, בחרו שם ו-username (חייב להסתיים ב-\`bot\`)
3. שמרו את ה-TOKEN — זה המפתח לבוט

כדי לאפשר מצב inline, שלחו ל-BotFather: \`/setinline\`

### שלב 2: תלויות

\`\`\`bash
python-telegram-bot>=22.0,<23.0
httpx>=0.27,<0.29
pymongo[srv]>=4.6,<5
python-dotenv>=1.0,<2
\`\`\`

### שלב 3: משתני סביבה

\`\`\`bash
# .env (לא מעלים ל-git!)
BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
OWNER_ID=123456789
CMD_TIMEOUT=60
TG_MAX_MESSAGE=4000
MAX_OUTPUT=10000
ALLOW_ALL_COMMANDS=false
\`\`\`

> **טיפ:** את ה-\`OWNER_ID\` אפשר למצוא על ידי שליחת \`/whoami\` לבוט אחרי ההפעלה הראשונה.

---

## מבנה הפרויקט

\`\`\`bash
my-telegram-bot/
├── bot.py                    # קובץ ראשי
├── activity_reporter.py      # דיווח פעילות
├── requirements.txt
├── Dockerfile
├── .env
└── .gitignore
\`\`\`

---

## יישום — צעד אחרי צעד

### שלד הבוט

\`\`\`python
import os
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

BOT_TOKEN = os.getenv("BOT_TOKEN")
OWNER_ID = int(os.getenv("OWNER_ID", "0"))

def allowed(update: Update) -> bool:
    return update.effective_user.id == OWNER_ID

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "שלום! אני בוט טרמינל.\\n"
        "שלח /help לעזרה"
    )

def main():
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()
\`\`\`

### הרצת פקודות Shell

\`\`\`python
import subprocess
import shlex

ALLOWED_CMDS = {"ls", "pwd", "echo", "cat", "grep", "find"}

async def sh_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not allowed(update):
        return await update.message.reply_text("אין הרשאה")

    cmdline = update.message.text.partition(" ")[2].strip()
    if not cmdline:
        return await update.message.reply_text("שימוש: /sh <פקודה>")

    parts = shlex.split(cmdline)
    if parts[0] not in ALLOWED_CMDS:
        return await update.message.reply_text(f"פקודה לא מאושרת: {parts[0]}")

    # shell=False + parts — מונע עקיפה דרך metacharacters (;, &&, |)
    try:
        result = subprocess.run(
            parts, shell=False,
            capture_output=True, text=True, timeout=30
        )
        output = result.stdout or result.stderr or "(no output)"
        await update.message.reply_text(f"$ {cmdline}\\n\\n{output}")
    except subprocess.TimeoutExpired:
        await update.message.reply_text("Timeout")
    except Exception as e:
        await update.message.reply_text(f"שגיאה: {e}")
\`\`\`

### הרצת קוד Python עם שמירת מצב

\`\`\`python
import io
import contextlib
import traceback

# הקשר גלובלי — משתנים נשמרים בין הרצות
PY_CONTEXT = {}

async def py_cmd(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not allowed(update):
        return

    code = update.message.text.partition(" ")[2].strip()
    if not code:
        return await update.message.reply_text("שימוש: /py <קוד>")

    chat_id = update.effective_chat.id
    if chat_id not in PY_CONTEXT:
        PY_CONTEXT[chat_id] = {"__builtins__": __builtins__}

    ctx = PY_CONTEXT[chat_id]
    stdout_buffer = io.StringIO()
    stderr_buffer = io.StringIO()

    try:
        with contextlib.redirect_stdout(stdout_buffer), \\
             contextlib.redirect_stderr(stderr_buffer):
            exec(code, ctx, ctx)

        output = stdout_buffer.getvalue() or "(no output)"
        await update.message.reply_text(output)
    except Exception:
        tb = traceback.format_exc()
        await update.message.reply_text(f"שגיאה:\\n{tb}")
\`\`\`

שמירת המצב מאפשרת עבודה טבעית:

\`\`\`python
# הודעה ראשונה
/py x = 42

# הודעה שנייה — x עדיין קיים
/py print(f"x = {x}")
\`\`\`

### ניהול סשנים

\`\`\`python
sessions = {}

def get_session(update: Update):
    chat_id = update.effective_chat.id
    if chat_id not in sessions:
        sessions[chat_id] = {
            "cwd": os.getcwd(),
            "env": dict(os.environ)
        }
    return sessions[chat_id]

def handle_cd(sess, target_dir):
    new_path = os.path.abspath(
        os.path.join(sess["cwd"], target_dir)
    )
    if os.path.isdir(new_path):
        sess["cwd"] = new_path
        return f"cwd: {new_path}"
    return f"תיקייה לא נמצאה: {target_dir}"
\`\`\`

---

## רשימת פקודות

| פקודה | דוגמה | תיאור |
|-------|-------|-------|
| \`/start\` | \`/start\` | הודעת פתיחה |
| \`/sh\` | \`/sh ls -la\` | הרצת פקודת shell |
| \`/py\` | \`/py print("Hello")\` | הרצת קוד Python |
| \`/js\` | \`/js console.log("Hi")\` | הרצת קוד JavaScript |
| \`/java\` | \`/java public class Main {...}\` | הרצת קוד Java |
| \`/py_start\` | \`/py_start\` | התחלת איסוף קוד רב-שורות |
| \`/py_run\` | \`/py_run\` | הרצת הקוד שנאסף |
| \`/call\` | \`/call my_func arg1\` | קריאה לפונקציה מההקשר |
| \`/env\` | \`/env\` | הצגת משתני סביבה |
| \`/reset\` | \`/reset\` | איפוס cwd/env |
| \`/clear\` | \`/clear\` | ניקוי מלא של הסשן |
| \`/list\` | \`/list\` | הצגת פקודות מותרות |
| \`/allow\` | \`/allow curl,wget\` | הוספת פקודות ל-allowlist |
| \`/deny\` | \`/deny rm,rmdir\` | הסרת פקודות |
| \`/health\` | \`/health\` | בדיקת חיבור |
| \`/whoami\` | \`/whoami\` | הצגת מזהה המשתמש |
| \`/restart\` | \`/restart\` | הפעלה מחדש |

---

## אבטחה

### הגבלת הרשאות

\`\`\`python
# תמיכה במספר בעלים
OWNER_IDS = {123456, 789012}

def allowed(update: Update) -> bool:
    return update.effective_user.id in OWNER_IDS
\`\`\`

### Timeout

\`\`\`python
import asyncio

TIMEOUT = 60

async def run_with_timeout(func, *args):
    try:
        return await asyncio.wait_for(func(*args), timeout=TIMEOUT)
    except asyncio.TimeoutError:
        return "Timeout"
\`\`\`

### הגבלת גודל פלט

\`\`\`python
MAX_OUTPUT = 10000

def truncate(text: str) -> str:
    if len(text) <= MAX_OUTPUT:
        return text
    return text[:MAX_OUTPUT] + f"\\n\\n[חתוך {len(text) - MAX_OUTPUT} תווים]"
\`\`\`

### ניקוי קלט (Sanitization)

\`\`\`python
import unicodedata
import re

def normalize_code(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = text.replace("\\u201C", '"').replace("\\u201D", '"')
    text = text.replace("\\u200E", "").replace("\\u200F", "")
    text = re.sub(r"(?m)^\\s*\\\`\\\`\\\`[a-zA-Z0-9_+\\-]*\\s*$", "", text)
    return text
\`\`\`

### הרצה מבודדת ב-Docker

\`\`\`bash
docker run --rm \\
  --cpus="1.0" \\
  --memory="512m" \\
  --network="none" \\
  -e BOT_TOKEN="$BOT_TOKEN" \\
  -e OWNER_ID="$OWNER_ID" \\
  my-telegram-bot
\`\`\`

---

## פריסה

### Dockerfile

\`\`\`dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential gcc git curl nodejs npm default-jdk \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

CMD ["python", "bot.py"]
\`\`\`

### בנייה והרצה

\`\`\`bash
docker build -t my-telegram-bot .

docker run -d \\
  --name telegram-bot \\
  --restart unless-stopped \\
  -e BOT_TOKEN="your-token-here" \\
  -e OWNER_ID="123456789" \\
  my-telegram-bot
\`\`\`

### עדכון אוטומטי עם GitHub Actions

\`\`\`yaml
name: Deploy Bot

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        env:
          RENDER_DEPLOY_HOOK: \${{ secrets.RENDER_DEPLOY_HOOK }}
        run: curl -X POST $RENDER_DEPLOY_HOOK
\`\`\`

---

## פיצ'רים מתקדמים

### מצב Inline

\`\`\`python
from telegram import InlineQueryResultArticle, InputTextMessageContent
from telegram.ext import InlineQueryHandler

async def inline_query(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.inline_query.query
    results = [
        InlineQueryResultArticle(
            id="1",
            title=f"להריץ: {query}",
            input_message_content=InputTextMessageContent(f"/sh {query}"),
            description="הרצת פקודת shell"
        )
    ]
    await update.inline_query.answer(results)

app.add_handler(InlineQueryHandler(inline_query))
\`\`\`

### מקלדות אינטראקטיביות

\`\`\`python
from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import CallbackQueryHandler

async def menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [
            InlineKeyboardButton("Python", callback_data="lang_py"),
            InlineKeyboardButton("JavaScript", callback_data="lang_js")
        ],
        [
            InlineKeyboardButton("Shell", callback_data="lang_sh"),
            InlineKeyboardButton("Java", callback_data="lang_java")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("בחר שפת תכנות:", reply_markup=reply_markup)

async def button_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    if query.data == "lang_py":
        await query.edit_message_text("נבחרה Python! שלח קוד עם /py")

app.add_handler(CommandHandler("menu", menu))
app.add_handler(CallbackQueryHandler(button_handler))
\`\`\`

### דיווח פעילות ל-MongoDB

\`\`\`python
from pymongo import MongoClient
from datetime import datetime, timezone

class SimpleActivityReporter:
    def __init__(self, mongodb_uri, service_id, service_name=None):
        self.client = MongoClient(mongodb_uri)
        self.db = self.client["bot_monitor"]
        self.service_id = service_id
        self.service_name = service_name or service_id

    def report_activity(self, user_id):
        now = datetime.now(timezone.utc)
        self.db.user_interactions.update_one(
            {"service_id": self.service_id, "user_id": user_id},
            {
                "$set": {"last_interaction": now},
                "$inc": {"interaction_count": 1},
                "$setOnInsert": {"created_at": now}
            },
            upsert=True
        )
        self.db.service_activity.update_one(
            {"_id": self.service_id},
            {
                "$set": {
                    "last_user_activity": now,
                    "service_name": self.service_name
                }
            },
            upsert=True
        )
\`\`\`

---

## פתרון בעיות נפוצות

**"Conflict: terminated by other getUpdates request"** — יש instance נוסף שרץ. עצרו את כל ה-instances האחרים.

**"Unauthorized"** — הטוקן לא תקין. ודאו ש-\`BOT_TOKEN\` נכון ולא פג תוקפו.

**"ModuleNotFoundError"** — חסרה ספריה. התקינו עם \`pip install <שם>\`.

**הבוט לא מגיב** — בדקו: האם הבוט רץ, האם יש חיבור לאינטרנט, האם \`OWNER_ID\` נכון (שלחו \`/whoami\`).

---

## סיכום

בוט טרמינל לטלגרם הוא כלי שימושי לניהול שרת מרחוק. הנקודות העיקריות:

1. **הגבלת גישה** — רק \`OWNER_ID\` מורשה, allowlist לפקודות
2. **בידוד** — Docker עם הגבלות CPU/RAM/רשת
3. **שמירת מצב** — context נפרד לכל צ'אט
4. **Timeout וחיתוך פלט** — הגנה מפני הרצות כבדות
5. **ניקוי קלט** — נרמול Unicode, הסרת markdown fences`
  },

  "web-scraper-telegram-alerts": {
    title: "איך לבנות סורק אתרים עם התראות טלגרם — מדריך מהשטח",
    date: "22-03-2026",
    content: `> מדריך מעשי לבניית פרויקט שסורק אתר בקביעות, מזהה נתונים רלוונטיים, ושולח התראות לטלגרם.
> מבוסס על לקחים מפרויקט אמיתי שרץ בפרודקשן על VM עם 512MB RAM.

---

## הפיפליין — מהזול ליקר

כל פרויקט סריקה+התראות עובד באותו פיפליין: **Scrape → Dedup → Filter → Classify → Notify**.

כל שלב מפחית את כמות הפריטים — חוסך זמן, API calls, וספאם למשתמש. כל שכבה בקובץ נפרד — קל להחליף, לטסט, ולבודד באגים.

---

## בחירת טכנולוגיית סריקה

| טכנולוגיה | מתי להשתמש | זיכרון |
|-----------|-----------|--------|
| **requests + BeautifulSoup** | אתר סטטי, API גלוי | ~20MB |
| **Playwright** | אתר דינמי, צריך JS/login | ~150-300MB |
| **API ישיר** | יש API רשמי/לא רשמי | ~10MB |

> **כלל אצבע:** התחל עם requests. עבור ל-Playwright רק אם חייבים JS rendering או login.

### דפוס בסיסי — requests

\`\`\`python
import requests
from bs4 import BeautifulSoup

async def scrape_page(url: str) -> list[dict]:
    response = await asyncio.to_thread(
        requests.get, url, timeout=15, headers=HEADERS
    )
    soup = BeautifulSoup(response.text, 'html.parser')
    items = []
    for element in soup.select('.item-selector'):
        items.append({
            "id": extract_id(element),
            "text": element.get_text(strip=True),
            "url": element.find('a')['href'],
            "has_real_url": True,
        })
    return items
\`\`\`

### דפוס מתקדם — Playwright

\`\`\`python
from playwright.async_api import async_playwright

async def scrape_with_browser(url: str) -> list[dict]:
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 360, "height": 640},  # מובייל = קל יותר
        )
        page = await context.new_page()
        # חסימת משאבים כבדים — חוסך ~60% זיכרון
        await page.route("**/*", lambda route: (
            route.abort() if route.request.resource_type
            in {"image", "media", "font"}
            else route.continue_()
        ))
        await page.goto(url, wait_until="domcontentloaded")
        items = await smart_scroll_and_extract(page)
        await browser.close()
        return items
\`\`\`

---

## גלילה חכמה — מעקב לפי תוכן, לא אינדקס

אתרים רבים משתמשים ב-DOM וירטואלי — אלמנטים נוספים ומוסרים תוך כדי גלילה. מעקב לפי אינדקס (\`elements[5:]\`) ישבר. תמיד לעקוב לפי **set של תוכן שכבר נראה**:

\`\`\`python
async def smart_scroll(page, seen_checker) -> list[dict]:
    seen_texts = set()
    consecutive_known = 0       # רצף של פריטים מוכרים
    all_items = []

    for scroll_num in range(MAX_SCROLLS):
        elements = await page.query_selector_all('.item')
        new_in_scroll = 0

        for el in elements:
            text = await el.inner_text()
            if text in seen_texts:
                continue
            seen_texts.add(text)
            item = extract_item(el, text)

            if item["has_real_url"] and seen_checker(item["id"]):
                consecutive_known += 1
                if consecutive_known >= 3:
                    return all_items  # הגענו לפוסטים ישנים
                continue

            consecutive_known = 0
            new_in_scroll += 1
            all_items.append(item)

        if new_in_scroll == 0:
            break
        await page.evaluate("window.scrollBy(0, 1500)")
        await asyncio.sleep(random.uniform(1, 3))

    return all_items
\`\`\`

**למה רצף של 3 פריטים מוכרים?** פריט מוצמד (pinned) בראש הפיד כבר ב-DB — בדיקת פריט בודד תעצור מיד.

---

## פיפליין סינון — מהזול ליקר

הסדר: **(1)** Dedup — **(2)** Content Dedup — **(3)** Age Filter — **(4)** Block Filter — **(5)** Pre-filter — **(6)** Cross-Group Dedup (כולם חינם) → **(7)** AI Classification ($$$).

כל שלב חינמי מפחית קריאות ל-AI. **סדר קריטי!**

### סינון מילות מפתח — מלכודת ה-\`any([])\`

\`\`\`python
def passes_keyword_filter(text: str, keywords: list[str]) -> bool:
    if not keywords:
        return True  # !! רשימה ריקה = אין סינון = הכל עובר
    text_lower = text.lower()
    return any(kw in text_lower for kw in keywords)
\`\`\`

> **מלכודת:** \`any([])\` מחזיר \`False\` — בלי guard, רשימת מילות מפתח ריקה תחסום *הכל* בשקט.

---

## Dedup רב-שכבתי — הלב של המערכת

### Content Hash יציב

הבעיה: תוכן דינמי (תגובות, לייקים) משנה את ה-hash בין סריקות.

\`\`\`python
import hashlib, re

def stable_text_for_hash(text: str) -> str:
    text = text.lower()
    text = re.sub(r'https?://\\S+', '', text)           # URLs עם tracking
    text = re.sub(r'[\\uE000-\\uF8FF]', '', text)        # Private Use Area
    lines = text.split('\\n')
    stable = []
    for line in lines:
        s = line.strip()
        if not s:
            continue
        if re.match(r'^\\d[\\d,. ]*$', s):                # "5" (ספירת לייקים)
            continue
        if ENGAGEMENT_RE.match(s):                       # "5 תגובות"
            continue
        stable.append(s)
    return ' '.join(stable)

def content_dedup_hash(text: str) -> str:
    normalized = stable_text_for_hash(text)
    words = normalized.split()[:12]    # 12 מילים ראשונות בלבד
    core = ' '.join(words)
    return hashlib.md5(core.encode()).hexdigest()
\`\`\`

**למה 12 מילים ולא 150 תווים?**
- ליבת הפריט (כותרת + תחילת גוף) תמיד בהתחלה
- תוכן דינמי (תגובות) בסוף
- בפריטים קצרים, 150 תווים כולל חלק מתגובות — שמשתנות בין סריקות

---

## סיווג AI — באצ'ים עם Fallback

\`\`\`python
def classify_batch(items: list[dict], batch_size=5) -> list[dict]:
    all_results = []
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        try:
            response = call_api(batch)
            temp = parse_response(response)  # רשימה זמנית!
            if len(temp) != len(batch):
                raise ValueError("אורך תשובה לא תואם")
            all_results.extend(temp)          # רק אחרי הצלחה
        except Exception:
            for item in batch:
                try:
                    result = classify_single(item)
                    all_results.append(result)
                except Exception:
                    all_results.append({"relevant": False})
    return all_results
\`\`\`

**למה רשימה זמנית?** אם exception נופל באמצע ה-loop שמוסיף תוצאות, חלק כבר נוסף. ה-fallback מוסיף הכל שוב → \`zip()\` מתאים תוצאות לפריטים לא נכונים.

---

## התראות טלגרם

\`\`\`python
async def send_lead(item: dict, reason: str):
    text = format_lead(item, reason)
    # חשוב! requests.post חוסם event loop — חייבים to_thread
    success = await asyncio.to_thread(send_message, text)
    if success:
        save_lead(item["id"], item["text"])
\`\`\`

**טיפ:** הפרידו ערוצים — לידים ללקוח, שגיאות טכניות למפתח.

---

## ניהול זיכרון ב-VM קטן

חמישה עקרונות ל-512MB:

1. **גרסת מובייל** — אם יש, חוסך ~60% זיכרון
2. **חסימת resources** — תמונות, פונטים, מדיה
3. **\`about:blank\` בין דפים** — משחרר DOM
4. **\`gc.collect()\`** — אחרי סגירת דפדפן, לפני AI
5. **דפדפן אחד, context חדש** — לא פותחים מספר instances

---

## טעויות נפוצות (ופתרונות)

### 1. קריאות sync חוסמות event loop

\`\`\`python
# שגוי
async def send():
    requests.post(...)      # חוסם!

# נכון
async def send():
    await asyncio.to_thread(requests.post, ...)
\`\`\`

### 2. מעקב לפי אינדקס בגלילה

\`\`\`python
# שגוי — DOM וירטואלי שובר אינדקסים
for i in range(last_index, len(elements)):
    process(elements[i])

# נכון
seen_texts = set()
for el in elements:
    text = el.text
    if text not in seen_texts:
        seen_texts.add(text)
        process(el)
\`\`\`

### 3. Fallback ID שובר dedup

\`\`\`python
# שגוי — כל הפריטים ללא URL מקבלים ID דומה
id = extract_url(el) or page_url

# נכון — flag שמסמן ID אמיתי
id, has_real_id = extract_item_id(el, page_url)
if has_real_id:
    check_dedup(id)
\`\`\`

### 4. Session detection אגרסיבי

\`\`\`python
# שגוי — סימן אחד = "סשן פג" → false positive שובר הכל
if any_login_link_found:
    re_login()

# נכון — סף גבוה + בדיקה כפולה
if login_ratio > 0.75 and no_content and link_count >= 3:
    re_login()
\`\`\`

---

## עקרונות זהב — סיכום

1. **פיפליין מהזול ליקר** — סינון חינמי לפני AI
2. **Dedup רב-שכבתי** — ID + content hash + cross-group
3. **Hash יציב** — נרמול עמוק, 12 מילים ראשונות בלבד
4. **רשימה ריקה = אין סינון** — guard על \`any([])\`
5. **מעקב לפי תוכן, לא אינדקס** — DOM וירטואלי שובר אינדקסים
6. **Async בכל מקום** — \`asyncio.to_thread()\` לקריאות sync
7. **באצ' = רשימה זמנית** — extend רק אחרי הצלחה מלאה
8. **Session detection שמרני** — false positive שובר הכל
9. **גרסת מובייל + חסימת resources** — חוסך 60%+ זיכרון
10. **גיל פוסט = מקסימום** — timestamp ישן ביותר = יצירת הפוסט`
  }
};

// רשימת כל הסלאגים לניווט בין בלוגים
const blogSlugs = Object.keys(blogPosts) as Array<keyof typeof blogPosts>;

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const [, setLocation] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params?.slug]);

  const slug = params?.slug || "";
  const post = blogPosts[slug as keyof typeof blogPosts];

  // בלוגים אחרים להצעה בתחתית
  const otherBlogs = blogSlugs.filter((s) => s !== slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
          <p className="text-foreground/80 mb-8">Blog post not found</p>
          <Button onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
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
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
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
                {otherBlogs.map((otherSlug) => (
                  <button
                    key={otherSlug}
                    onClick={() => {
                      setLocation(`/blog/${otherSlug}`);
                      window.scrollTo(0, 0);
                    }}
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
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => setLocation("/")}
              className="text-primary hover:text-primary/80"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Portfolio
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
