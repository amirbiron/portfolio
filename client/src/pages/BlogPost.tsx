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
  "telegram-bot-webapp-sync": {
    title: "סנכרון בזמן אמת בין Telegram Bot ל-Web App — ואיך מאמתים משתמשים בצורה מאובטחת",
    date: "10-02-2026",
    content: `> איך דואגים שמה שמשתמש עושה ב-Web App יופיע מיד בבוט, ולהיפך?
> ואיך מוודאים שרק מי שמחובר בטלגרם יוכל להיכנס ל-Web App?
---
## חלק 1: סנכרון — "מקור אמת אחד"
### הבעיה
נניח שיש לכם בוט טלגרם שמאפשר למשתמשים לשמור קבצים, ולצדו Web App שנותן ממשק גרפי לאותם קבצים בדיוק. המשתמש עורך קובץ ב-Web App — ורוצה לראות את השינוי מיד כשהוא חוזר לבוט. והפוך: שמר משהו דרך הבוט? צריך שזה יופיע מיד ב-Web App.
הפתרון הנאיבי — לסנכרן בין שני מסדי נתונים נפרדים — הוא מתכון לצרות: race conditions, קונפליקטים, ונתונים שלא מסתנכרנים.
### הפתרון: Single Source of Truth
הרעיון פשוט: **שני הצדדים (בוט ו-Web App) קוראים וכותבים לאותו מסד נתונים בדיוק**.

אין שום "סנכרון" — כי אין מה לסנכרן. יש מסד נתונים אחד, ושכבת Repository אחת שמבצעת את כל הפעולות.
### איך זה נראה בפועל
שכבת ה-Repository חושפת פונקציה אחת לשמירה — \`save_code_snippet\`. גם הבוט וגם ה-Web App משתמשים בה:
\`\`\`python
def save_code_snippet(self, snippet: CodeSnippet) -> bool:
    # בדיקה אם יש גרסה קודמת
    existing = self.get_latest_version(snippet.user_id, snippet.file_name)
    if existing:
        snippet.version = existing['version'] + 1
    # חישוב מטא-דאטה
    doc = asdict(snippet)
    doc["file_size"] = len(snippet.code.encode("utf-8"))
    doc["lines_count"] = len(snippet.code.split('\\n'))
    # שמירה ל-DB
    result = self.collection.insert_one(doc)
    # ניקוי cache
    if result.inserted_id:
        cache.invalidate_user_cache(snippet.user_id)
    return bool(result.inserted_id)
\`\`\`
שימו לב למספר דברים חשובים:
1. **Versioning אוטומטי** — כל שמירה בודקת את הגרסה הקודמת ומעלה מונה. לא משנה מאיפה הגיעה הפעולה.
2. **מטא-דאטה מחושבת בזמן שמירה** — \`file_size\` ו-\`lines_count\` מחושבים פעם אחת ב-write, במקום בכל read. זה חוסך עבודה כשמציגים רשימות.
3. **Cache invalidation** — אחרי כל שמירה, ה-cache של המשתמש מתנקה. זה מבטיח שקריאה הבאה (מהבוט או מה-Web App) תביא את הנתון העדכני.
### למה זה עובד טוב
- **אפס שכפול** — אין שני עותקים של אותו נתון שצריכים להישאר מסונכרנים.
- **עקביות מובנית** — שני הצדדים עוברים דרך אותה שכבת לוגיקה, אז כללים כמו versioning ומועדפים תמיד חלים.
- **פשטות** — אין צורך ב-message queue, webhooks פנימיים, או כל מנגנון סנכרון. פחות קוד = פחות באגים.
### ומה עם Cache?
כשעובדים עם cache (וצריך, בשביל ביצועים), הכלל הוא:
> **כל פעולת כתיבה מנקה את ה-cache הרלוונטי.**
\`\`\`python
# אחרי שמירה
cache.invalidate_user_cache(snippet.user_id)
# אחרי מחיקה
cache.invalidate_user_cache(user_id)
cache.invalidate_file_related(file_id=str(file_name), user_id=user_id)
\`\`\`

ככה, גם אם הבוט שמר קובץ חדש ו-Web App שולף רשימת קבצים שנייה אחר כך — הרשימה תהיה עדכנית, כי ה-cache כבר התנקה.
---
## חלק 2: אימות — "בוא נוודא שזה באמת אתה"
### האתגר
ל-Web App אין מערכת משתמשים משלו — אין רישום, אין סיסמאות. כל ה-identity של המשתמש נמצא בטלגרם. אז איך מאמתים?
טלגרם מציע שתי דרכים, ואפשר (וכדאי) לתמוך בשתיהן.
### דרך 1: Telegram Login Widget
זה ה-widget הרשמי של טלגרם — כפתור שמופיע ב-Web App ומאפשר למשתמש להתחבר עם חשבון הטלגרם שלו.
\`\`\`html
<script async src="https://telegram.org/js/telegram-widget.js?22"
        data-telegram-login="your_bot_username"
        data-size="large"
        data-auth-url="/auth/telegram"
        data-request-access="write">
</script>
\`\`\`
כשהמשתמש לוחץ, טלגרם שולח לשרת שלכם פרטים חתומים: \`id\`, \`first_name\`, \`username\`, \`hash\` ועוד.
#### אימות ה-hash בצד השרת
זה החלק הקריטי — לוודא שהנתונים באמת הגיעו מטלגרם ולא זויפו:
\`\`\`python
import hashlib
import hmac
def verify_telegram_auth(auth_data: dict) -> bool:
    check_hash = auth_data.get("hash")
    if not check_hash:
        return False
    # בניית מחרוזת בדיקה — כל השדות (חוץ מ-hash) ממוינים
    data_check_string = "\\n".join(
        f"{key}={value}"
        for key, value in sorted(auth_data.items())
        if key != "hash"
    )
    # המפתח הסודי = SHA256 של ה-bot token
    bot_token = os.getenv("BOT_TOKEN")
    secret_key = hashlib.sha256(bot_token.encode()).digest()
    # HMAC-SHA256
    calculated_hash = hmac.new(
        secret_key,
        data_check_string.encode(),
        hashlib.sha256
    ).hexdigest()
    # השוואה + בדיקת תוקף זמן (עד שעה)
    if calculated_hash != check_hash:
        return False
    auth_date = int(auth_data.get("auth_date", 0))
    if (time.time() - auth_date) > 3600:
        return False
    return True
\`\`\`
**איך זה עובד:**
1. טלגרם חותם את הנתונים עם HMAC-SHA256, כשה-secret key הוא SHA256 של ה-bot token שלכם.
2. בצד השרת, אתם מחשבים את אותו hash ומשווים.
3. בנוסף, בודקים שה-\`auth_date\` לא ישן מדי (עד שעה) — כדי למנוע replay attacks.
**למה SHA256 של ה-token ולא ה-token עצמו?** כי טלגרם רוצים שה-secret יהיה באורך קבוע (32 bytes) ולא תלוי באורך ה-token.
### דרך 2: Token חד-פעמי מהבוט
לפעמים ה-Login Widget לא מתאים — למשל, כשהמשתמש כבר נמצא בשיחה עם הבוט ורוצה לעבור ל-Web App בלחיצה. בשביל זה יש מסלול שני — הבוט יוצר טוקן חד-פעמי (תקף 5 דקות), שולח קישור אישי, וה-Web App מוודא תוקף ומוחק אחרי שימוש.

קוד יצירת ה-token בבוט:
\`\`\`python
import hashlib
import time
def build_login_payload(user_id: int, username: str) -> dict:
    # יצירת token מ-hash של user_id + timestamp + secret
    secret = os.getenv("WEBAPP_LOGIN_SECRET")
    token_data = f"{user_id}:{int(time.time())}:{secret}"
    auth_token = hashlib.sha256(token_data.encode()).hexdigest()[:32]
    # שמירה ב-DB עם תאריך תפוגה
    token_doc = {
        "token": auth_token,
        "user_id": user_id,
        "username": username,
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5),
    }
    db.webapp_tokens.insert_one(token_doc)
    login_url = f"https://your-app.com/auth/token?token={auth_token}&user_id={user_id}"
    return {"login_url": login_url}
\`\`\`
ובצד ה-Web App, כשהמשתמש לוחץ על הקישור:
\`\`\`python
@app.route("/auth/token")
def token_auth():
    token = request.args.get("token")
    user_id = request.args.get("user_id")
    # חיפוש ה-token ב-DB
    token_doc = db.webapp_tokens.find_one({
        "token": token,
        "user_id": int(user_id)
    })
    if not token_doc:
        return "קישור לא תקף", 401
    # בדיקת תוקף
    if token_doc["expires_at"] < datetime.now(timezone.utc):
        db.webapp_tokens.delete_one({"_id": token_doc["_id"]})
        return "קישור פג תוקף", 401
    # מחיקה אחרי שימוש — חד פעמי!
    db.webapp_tokens.delete_one({"_id": token_doc["_id"]})
    # יצירת session
    session["user_id"] = int(user_id)
    session.permanent = True  # 30 יום
    return redirect("/dashboard")
\`\`\`
**עקרונות אבטחה:**
- **חד-פעמי** — ה-token נמחק מיד אחרי שימוש. אם מישהו יתפוס את הקישור, הוא כבר לא יעבוד.
- **תוקף קצר** — 5 דקות. אפילו אם ה-token דלף, יש חלון קטן מאוד לניצול.
- **Hash ולא random** — ה-token נגזר מ-\`user_id + timestamp + secret\`, מה שמקשה על ניחוש.
---
## שילוב של הכל ביחד
1. **אימות** — המשתמש מזדהה דרך טלגרם (widget או token מהבוט).
2. **Session** — ה-Web App שומר session ל-30 יום, אז לא צריך להתחבר כל פעם.
3. **סנכרון** — אין. שני הצדדים עובדים על אותו DB, דרך אותה שכבת Repository, עם cache invalidation אחרי כל כתיבה.
---
## טיפים למימוש
1. **השתמשו בשכבת Repository משותפת** — אל תכתבו שאילתות DB ישירות בבוט או ב-Web App. שכבת ביניים אחת = לוגיקה אחידה.
2. **Cache invalidation חייב להיות אטומי עם הכתיבה** — אם שכחתם לנקות cache במסלול אחד, תקבלו נתונים ישנים במסלול אחר.
3. **אל תשמרו את ה-bot token בקוד** — הוא משמש כמפתח קריפטוגרפי לאימות. שמרו אותו רק ב-environment variables.
4. **וודאו שאותו token בדיוק** משמש את הבוט ואת ה-Web App — אחרת אימות ה-HMAC ייכשל.
5. **בדקו סנכרון שעונים** — אם השרת של ה-Web App והשרת של טלגרם לא מסונכרנים, \`auth_date\` ייראה ישן מדי והאימות ייכשל.
---
## סיכום
| נושא | הפתרון | למה |
|-------|---------|-----|
| סנכרון בוט ↔ Web App | DB משותף + Repository אחיד | פשוט, אמין, אפס קונפליקטים |
| אימות Web App | Telegram Login Widget + Token חד-פעמי | שתי דרכי כניסה, אבטחה מובנית |
| Cache | Invalidation אחרי כל כתיבה | עדכניות מובטחת |
| Session | Flask session, 30 יום | חוויית משתמש חלקה |

הגישה הזאת עובדת מצוין כשיש לכם שירות אחד (בוט) ו-Web App שעובדים על אותם נתונים. זה יותר פשוט ממה שנדמה — ובדיוק בגלל הפשטות, זה עובד אמין.`
  },
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
