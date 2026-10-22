/**
 * Terminal Aesthetic Portfolio - Blog Post Page
 * Design: Retro-futurism with 1980s terminal aesthetic
 */

import "../blog-styles.css";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { Streamdown } from 'streamdown';

// Blog posts data
const blogPosts = {
  "chatbot-ai-antipatterns": {
    title: "12 מלכודות בבניית צ'אטבוט AI לפרודקשן",
    date: "05-05-2026",
    content: `בניתי צ'אטבוט AI לעסקים, עם RAG וזיהוי כוונות, שעובד בוואטסאפ או בטלגרם, לפי מה שמתאים ללקוחות של כל עסק, ועם פאנל ניהול לבעל העסק.
תוך כדי הבנייה נכתב לו מדריך פיתוח, ורוב מה שיש בו הוא לא "איך לבנות", אלא "מה לא לעשות". הפוסט הזה אוסף את 12 הכללים החשובים שבו, ולכל אחד את הסיבה.

צ'אטבוט שעובד בדמו וצ'אטבוט שעובד בפרודקשן הם לא אותו דבר. בדמו אתם שולטים בשאלות, בפרומפטים ובמקרי הקצה. בפרודקשן יש משתמשים ששואלים מה שלא חשבתם עליו, ספקי LLM שנופלים, ובאגים שלא מפילים כלום, אלא פשוט גורמים לדברים לא לקרות.

---

## 1. \`except Exception: pass\` — כשל שלא משאיר עקבות

\`\`\`python
# שגוי — הכשל נעלם
try:
    db.save_unanswered_question(user_id, question)
except Exception:
    pass
\`\`\`

הפונקציה הזו אמורה לתעד שאלות שהבוט לא ידע לענות עליהן, כדי לשפר את בסיס הידע. אם ה-INSERT נשבר, למשל אחרי שינוי בסכימה, הטבלה פשוט נשארת ריקה. וטבלה ריקה נראית בדיוק כמו בוט שיודע לענות על הכול.

\`\`\`python
# נכון — הכשל נרשם, עם ה-traceback
try:
    db.save_unanswered_question(user_id, question)
except Exception:
    logger.exception("failed to save unanswered question for %s", user_id)
\`\`\`

\`logger.exception\` שומר גם את סוג השגיאה וגם את השורה שבה היא קרתה. \`logger.error\` עם הודעת השגיאה בלבד מאבד את רוב המידע שתצטרכו.

**הכלל:** אין \`except: pass\`. כל כשל נרשם בלוג, עם ההקשר.

---

## 2. נתיב ל-LLM שעוקף את מגבלת השימוש

מגבלת שימוש שבודקת כל הודעה נכנסת נשמעת סגורה. אבל הודעה היא לא הדרך היחידה להגיע ל-LLM. כפתור "שאלת המשך" בטלגרם, למשל, מגיע כ-callback ולא כהודעה, ולכן לא עובר בבדיקה בכלל.

\`\`\`python
# שגוי — כל לחיצה היא קריאה ל-LLM, בלי מגבלה
async def follow_up_callback(update, context):
    question = update.callback_query.data
    answer = generate_answer(question)
    await update.callback_query.message.reply_text(answer)
\`\`\`

משתמש שלוחץ שוב ושוב צורך קריאות בתשלום בלי שום תקרה.

**הכלל:** כל נתיב שמגיע ל-LLM עובר בבדיקת המגבלה: callbacks, קישורי עומק, משימות מתוזמנות ושאלות המשך. והדרך הבטוחה לוודא את זה היא לשים את הבדיקה בתוך הפונקציה שקוראת ל-LLM, ולא בכל נתיב בנפרד. ראו מלכודת 4.

---

## 3. שמירת מידע אישי לפני מסך ההסכמה

אם הבוט מציג מסך הסכמה, הסדר חשוב:

\`\`\`python
# שגוי — המידע נשמר עוד לפני שהמשתמש החליט
async def start_command(update, context):
    user = update.effective_user
    db.upsert_user(user.id, user.first_name, user.username)
    if not db.has_consent(user.id):
        return await show_consent_screen(update)
\`\`\`

מי שלוחץ "לא מסכים" כבר נמצא במסד, עם השם ושם המשתמש שלו. המסך נשאר, אבל הוא כבר לא אומר כלום.

\`\`\`python
# נכון — הסכמה קודם, שמירה אחר כך
async def start_command(update, context):
    user = update.effective_user
    if not db.has_consent(user.id):
        return await show_consent_screen(update)
    db.upsert_user(user.id, user.first_name, user.username)
\`\`\`

**הכלל:** אם בחרתם בהסכמה כבסיס לשמירת המידע, שום פונקציה שכותבת מידע אישי לא רצה לפניה. גם לא רישום של שאלות, אם הוא כולל פרטים על המשתמש.

---

## 4. אותה לוגיקת RAG בשני מקומות

\`\`\`python
# שגוי — שני נתיבים שעושים כמעט אותו דבר
async def message_handler(update, context):
    return await process_rag_query(...)   # כאן יש תיעוד של שאלות בלי תשובה

async def callback_handler(update, context):
    answer = generate_answer(...)          # כאן אין
    await reply(answer)
\`\`\`

כל שיפור שנכנס לאחד מהם, תיעוד, מגבלת שימוש, טיפול בשגיאות, חסר בשני. ואף אחד לא שם לב, כי שני הנתיבים עדיין עונים.

**הכלל:** נקודת כניסה אחת ל-RAG. כל handler שצריך חיפוש סמנטי ו-LLM קורא לאותה פונקציה, גם כש"זה רק callback קטן".

---

## 5. העברה לנציג לפי ניחוש של טקסט

רעיון שנראה הגיוני: אם ה-LLM כתב משהו כמו "אעביר את הפנייה לבירור", להעביר את השיחה לבעל העסק. הבעיה היא שה-LLM כותב משפטים כאלה גם כשהוא בכלל לא מתכוון, למשל "אם תרצה, אעביר את הפנייה לבירור נוסף". כל משפט כזה הופך להתראה מיותרת אצל בעל העסק.

הפתרון: סימן קבוע שה-LLM מוסיף בדיוק כשהוא מתכוון.

\`\`\`python
HANDOFF_MARKER = "[HANDOFF]"

def should_handoff_to_human(text: str) -> bool:
    return text.strip().startswith(HANDOFF_MARKER)

def strip_handoff_marker(text: str) -> str:
    stripped = text.lstrip()
    if stripped.startswith(HANDOFF_MARKER):
        return stripped[len(HANDOFF_MARKER):].lstrip()
    return text
\`\`\`

הפרומפט אומר ל-LLM: אם אתה לא יודע, התחל את התשובה בדיוק ב-\`[HANDOFF]\`. הקוד בודק את הסימן, מסיר אותו לפני שהמשתמש רואה את התשובה, ומעביר.

**הכלל:** אות שעובר מה-LLM לקוד צריך להיות חד-משמעי: כן או לא, ושאפשר לבדוק אותו בטסט. ניחוש על טקסט חופשי הוא באג שמחכה לקרות.

---

## 6. לולאת שליחה בלי הגנה על כל פריט

\`\`\`python
# שגוי — משתמש אחד עם בעיה עוצר את כולם
for user in users:
    bot.send_message(user.id, text)
\`\`\`

משתמש שחסם את הבוט גורם ל-\`send_message\` לזרוק שגיאה. הלולאה נעצרת, וכל מי שאחריו ברשימה לא מקבל את ההודעה.

\`\`\`python
# נכון — כל משתמש מוגן בנפרד
for user in users:
    try:
        bot.send_message(user.id, text)
    except Exception:
        logger.exception("broadcast failed for %s", user.id)
        db.mark_send_failed(user.id)
\`\`\`

**הכלל:** לולאה שעושה I/O על רשימה עוטפת כל איטרציה בנפרד, ולא את הלולאה כולה. כשל של פריט אחד הוא רגיל. כשל של כולם בגללו הוא לא.

---

## 7. JSON מה-LLM בלי שמות שדות מפורשים

\`response_format={"type": "json_object"}\` של OpenAI מבטיח JSON תקין. הוא לא מבטיח אילו שדות יהיו בו.

\`\`\`python
# שגוי — הפרומפט לא אומר איך קוראים לשדות
prompt = "החלט אם לשלוח follow-up למשתמש. החזר JSON."
data = json.loads(response.choices[0].message.content)
should_send = data.get("should_send", False)
\`\`\`

אם המודל מחליט לקרוא לשדה \`send_followup\`, הקוד לא מוצא את \`should_send\`, ה-\`get\` מחזיר False, ושום follow-up לא נשלח. בלי שגיאה אחת בלוג.

שתי דרכים לסגור את זה. הפשוטה: לכתוב בפרומפט את שמות השדות ולתת דוגמה.

\`\`\`python
prompt = """
החלט אם לשלוח follow-up. החזר JSON עם השדות:
- should_send (boolean)
- reason (string)
- delay_hours (integer)

דוגמה:
{"should_send": true, "reason": "שאלה פתוחה", "delay_hours": 24}
"""
\`\`\`

והחזקה יותר: Structured Outputs, שבו מעבירים למודל סכימה (\`json_schema\` עם \`strict\`), והמודל לא יכול להחזיר שדות אחרים. בכל מקרה, כדאי לא להסתיר שדה חסר מאחורי ערך ברירת מחדל: שדה חסר הוא שגיאה, וצריך שייראה כמו שגיאה.

---

## 8. \`run_coroutine_threadsafe\` בלי לבדוק את התוצאה

בקוד שמערבב Flask, שרץ סינכרוני, עם בוט אסינכרוני, קוראים ל-coroutine מתוך thread של Flask:

\`\`\`python
# שגוי — שגיאה ב-coroutine נעלמת
asyncio.run_coroutine_threadsafe(send_to_user(uid, msg), loop)
\`\`\`

הפונקציה מחזירה Future, והוא נזרק. אם ה-coroutine נכשל, אף אחד לא יודע.

\`\`\`python
# נכון — callback שרושם כל כשל
def _on_done(future):
    if future.cancelled():   # לבדוק לפני exception(), שזורק על Future שבוטל
        return
    if exc := future.exception():
        logger.error("coroutine failed", exc_info=exc)

future = asyncio.run_coroutine_threadsafe(send_to_user(uid, msg), loop)
future.add_done_callback(_on_done)
\`\`\`

**הכלל:** ה-Future הוא הדרך היחידה לדעת מה קרה. מי שזורק אותו, זורק את השגיאה איתו.

---

## 9. טיפול בשגיאה שמוחק את ההתקדמות

שירות שליחה המונית שומר את ההתקדמות שלו: כמה נשלחו, כמה נכשלו, כמה בסך הכול. כששגיאה עוצרת אותו באמצע, ה-handler מסמן אותו כנכשל:

\`\`\`python
# שגוי — מאפס מונים שכבר נכתבו
def fail_broadcast(broadcast_id, error):
    db.update_broadcast(broadcast_id, status="failed", sent=0, failed=0, error=error)

# נכון — משנה רק את מה שבאמת השתנה
def fail_broadcast(broadcast_id, error):
    db.update_broadcast(broadcast_id, status="failed", error=error)
\`\`\`

בגרסה השגויה, ניסיון חוזר לא יודע מי כבר קיבל את ההודעה, מתחיל מההתחלה, ושולח שוב לכל מי שכבר קיבל.

**הכלל:** UPDATE בתוך טיפול בשגיאה כותב רק את השדות שהשגיאה שינתה. כל שדה נוסף דורס עבודה שכבר נעשתה.

---

## 10. אותו תנאי, פעמיים: ב-get וב-count

\`get_pending_messages\` מחזיר רשימת הודעות, ו-\`count_pending_messages\` מחזיר את המספר שלהן. אם לכל אחת מהן WHERE משלה, מספיק שתנאי חדש, למשל "לא בארכיון", ייכנס רק לאחת, וה-UI יציג "יש לך 5 הודעות חדשות" כשבפנים יש 2.

\`\`\`python
# נכון — התנאים מוגדרים פעם אחת
def _pending_conditions(user_id):
    return (
        Message.user_id == user_id,
        Message.is_pending.is_(True),
        Message.is_archived.is_(False),
    )

def get_pending_messages(user_id):
    return db.scalars(select(Message).where(*_pending_conditions(user_id))).all()

def count_pending_messages(user_id):
    return db.scalar(
        select(func.count()).select_from(Message).where(*_pending_conditions(user_id))
    )
\`\`\`

**הכלל:** שתי פונקציות שצריכות את אותו תנאי חולקות אותו. שני עותקים יתפצלו ביום שמישהו ישנה אחד מהם.

---

## 11. מגבלות של כל ערוץ

לכל ערוץ יש תקרת אורך להודעה: טלגרם 4,096 תווים, וואטסאפ דרך Twilio 1,600, ו-SMS 160 לכל מקטע. תשובת LLM מפורטת עוברת 1,600 תווים בקלות, ותשובה ארוכה מהתקרה לא תגיע למשתמש כמו שהיא.

\`\`\`python
# בודקים לפני השליחה, ותשובה ארוכה עוברת לעמוד משלה
def send_whatsapp_response(user_id, text, rag_context):
    if len(text) > 1500:  # מרווח ביטחון
        page_id = create_public_page(text, rag_context)
        text = f"התשובה ארוכה, אפשר לקרוא אותה כאן:\\n{ADMIN_URL}/p/{page_id}"
    twilio.send(user_id, text)
\`\`\`

**הכלל:** מכירים את המגבלות של כל ערוץ לפני העלייה לאוויר, ובודקים אורך לפני כל שליחה.

---

## 12. נתיבים שאף אחד לא קורא להם

נתיב בפאנל הניהול שנוסף כי "אצטרך אותו אחר כך" נשאר בקוד גם כשאף מסך לא משתמש בו. וכל שינוי רוחבי, בהרשאות, בלוגים, בטיפול בשגיאות, צריך לעבור גם עליו.

**הכלל:** נתיב חדש נכנס יחד עם הממשק שקורא לו, באותו commit. קוד מת לא נעלם לבד, הוא רק מצטבר.

---

## מה משותף לכולן

אף אחת מהמלכודות האלה לא מפילה את הבוט. הן גורמות לדברים לא לקרות: שאלות שלא נרשמות, התראות שלא נשלחות, מונים שמתאפסים. ולכן גם התיקונים דומים:

1. כל כשל נרשם בלוג.
2. לכל לוגיקה משותפת יש נקודת כניסה אחת: RAG, מגבלת שימוש, הסכמה.
3. אותות בין ה-LLM לקוד הם חד-משמעיים, לא ניחוש על טקסט.
4. דברים שחייבים להישאר מסונכרנים חולקים קוד אחד, או נבדקים בטסט: סכימה מול פרומפט, get מול count.
5. מכירים את המגבלות של כל ערוץ וספק לפני שמגיעים אליהן.`
  },
  "whatsapp-bot-python-guide": {
    title: "איך לבנות בוט WhatsApp שעובד כמו מוצר אמיתי",
    date: "14-03-2026",
    content: `> הלקחים, הדפוסים והמלכודות מבניית בוט WhatsApp שרץ בפרודקשן, עם דוגמאות קוד ב-Python וב-FastAPI.

המבנה הכללי פשוט: ה-webhook מקבל הודעה, מכונת המצבים מחליטה באיזה שלב של השיחה המשתמש נמצא, השירותים מבצעים את הלוגיקה, וההודעות החוזרות נשלחות ברקע. הקושי הוא בפרטים: הודעות כפולות, ספק שנופל, שתי בקשות שמגיעות באותו רגע, ומשתמשים ששולחים דברים שלא חשבתם עליהם.

---

## 1. קבלת הודעות

### מחזירים 200 מיד

אם ה-webhook לא עונה מהר, Meta מניחה שההודעה לא הגיעה ושולחת אותה שוב. לכן הכלל הראשון: מאשרים קבלה מיד, ומעבדים ברקע.

\`\`\`python
@router.post("/webhook")
async def whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    body = await request.body()
    if not verify_signature(request, body):
        raise HTTPException(status_code=403)

    message = parse_payload(json.loads(body))
    background_tasks.add_task(process_message, db, message)
    return {"status": "ok"}
\`\`\`

למה \`BackgroundTasks\` של FastAPI ולא \`asyncio.create_task\`? משימה שנוצרה ב-\`create_task\` בלי שמישהו שומר אליה הפניה עלולה להימחק באמצע הריצה, ושגיאה בתוכה מופיעה, אם בכלל, רק כאזהרה מאוחרת. \`BackgroundTasks\` רץ אחרי שהתשובה נשלחה, ושגיאה בו מגיעה ללוג של השרת.

וחשוב לזכור: \`BackgroundTasks\` הוא לא תור עמיד. המשימה רצה בזיכרון של אותו תהליך, אחרי שה-200 כבר נשלח, ואם השרת קורס לפני שהיא מסתיימת, למשל בגלל חוסר זיכרון, היא פשוט נעלמת. Meta לא תשלח את ההודעה שוב, כי מבחינתה היא התקבלה, וה-outbox שבהמשך מגן רק על הודעות יוצאות. לכן, כשאסור לאבד הודעה נכנסת, שומרים אותה במסד עוד בתוך ה-webhook, לפני ה-200, ו-\`process_message\` מעבד ברקע את מה שנשמר. תהליך נפרד עובר מדי פעם על הודעות שנשארו ממתינות או תקועות אחרי קריסה, ומעבד אותן.

### מניעת כפילויות

Meta שולחת שוב הודעות שלא אושרו בזמן. בלי הגנה, המשתמש יקבל תשובה כפולה. הפתרון הוא טבלת \`webhook_events\` במסד, עם מזהה ההודעה כמפתח ייחודי:

\`\`\`python
async def try_acquire_message(db: AsyncSession, message_id: str) -> bool:
    """True אם ההודעה עכשיו שלנו לעיבוד, False אם היא כבר טופלה או בטיפול."""
    try:
        async with db.begin_nested():
            db.add(WebhookEvent(
                message_id=message_id,
                status="processing",
                claimed_at=now(),
            ))
        await db.commit()
        return True
    except IntegrityError:
        pass  # ההודעה כבר קיימת

    # אולי היא תקועה ב-processing, כי השרת נפל באמצע הטיפול?
    stale_before = now() - timedelta(minutes=2)
    result = await db.execute(
        update(WebhookEvent)
        .where(
            WebhookEvent.message_id == message_id,
            WebhookEvent.status == "processing",
            WebhookEvent.claimed_at < stale_before,
        )
        .values(claimed_at=now())
    )
    await db.commit()
    return result.rowcount == 1
\`\`\`

החלק השני הוא עדכון אחד, עם תנאי. אם שני workers מגיעים יחד להודעה תקועה, רק אחד מהם יעדכן שורה, ורק הוא יקבל \`True\`. בדיקה של "כמה זמן היא תקועה" בקוד, ואחריה החלטה, הייתה מאפשרת לשניהם לעבד את אותה הודעה. ובסוף העיבוד, מעדכנים את הסטטוס ל-\`completed\`.

שתי הדקות הן הנחה: הן צריכות להיות ארוכות בבירור מהעיבוד הארוך ביותר. אם \`process_message\` עלול לרוץ יותר מזה, מרעננים את \`claimed_at\` במהלך העיבוד, אחרת worker אחר ייקח את ההודעה בזמן שהראשון עוד מטפל בה, והיא תעובד פעמיים.

למה מסד ולא מטמון? מטמון נעלם בריסטארט ולא משותף בין workers, וזה בדיוק הרגע שבו הכפילויות מגיעות.

### אימות חתימה

\`\`\`python
def verify_signature(request: Request, body: bytes) -> bool:
    """HMAC-SHA256: מוודא שהבקשה באמת הגיעה מ-Meta."""
    signature = request.headers.get("X-Hub-Signature-256", "")
    expected = hmac.new(
        settings.APP_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)
\`\`\`

החתימה מחושבת על הבתים הגולמיים של הבקשה, לכן קוראים אותם לפני שמפענחים את ה-JSON, כמו בקוד של ה-webhook למעלה. בלי אימות, כל אחד יכול לשלוח בקשות ל-webhook ולגרום לבוט לבצע פעולות.

---

## 2. מכונת המצבים

כל משתמש נמצא ב**מצב**, והמצב קובע מה קורה עם ההודעה הבאה שלו.

\`\`\`python
class UserState(str, Enum):
    INITIAL = "INITIAL"
    NEW = "USER.NEW"
    REGISTER_NAME = "USER.REGISTER.NAME"
    REGISTER_PHONE = "USER.REGISTER.PHONE"
    MENU = "USER.MENU"
    FORM_STEP_1 = "USER.FORM.STEP_1"
    FORM_STEP_2 = "USER.FORM.STEP_2"
    FORM_STEP_3 = "USER.FORM.STEP_3"
    FORM_CONFIRM = "USER.FORM.CONFIRM"
\`\`\`

המצב נשמר במסד כמחרוזת, ו-\`str, Enum\` מאפשר גם השוואה ישירה למחרוזת וגם בדיקת טיפוסים. השמות בנויים מתפקיד ואז זרימה (\`USER.FORM.\`), ולכן קל לבדוק אם משתמש נמצא באמצע טופס: \`state.startswith("USER.FORM.")\`.

### אילו מעברים מותרים

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

כל מעבר מוגדר מראש. handler שמנסה לעבור למצב שלא ברשימה נדחה, וכך משתמש לא יכול להגיע למצב בלתי אפשרי בגלל באג.

### שמירת המצב וההקשר

\`\`\`python
class StateManager:
    async def transition_to(self, user_id, platform, new_state, context_update=None):
        session = await self.get_or_create_session(user_id, platform)
        if not self._is_valid_transition(session.current_state, new_state):
            logger.warning("מעבר לא חוקי", extra_data={
                "from": session.current_state, "to": new_state,
            })
            return False
        session.current_state = new_state
        if context_update:
            context = copy.deepcopy(session.context_data or {})
            context.update(context_update)
            session.context_data = context
        await self.db.commit()
        return True
\`\`\`

לכל שיחה יש גם הקשר: מילון שבו כל שלב בטופס שומר את מה שהמשתמש מילא. רק בשלב האישור הכול נכתב לטבלאות עצמן, וכך ביטול באמצע לא משאיר נתונים חלקיים במסד.

ושני פרטים בקוד: מעבר שנדחה נרשם בלוג, ולא רק מחזיר \`False\`, אחרת זה באג שקט. ו-SQLAlchemy לא מזהה שינוי בתוך עמודת JSON שעודכנה במקום, לכן מעתיקים את המילון, מעדכנים את העותק, ומציבים אותו מחדש.

### ניקוי ההקשר ביציאה מזרימה

כל handler מחזיר שלושה דברים: מה לשלוח למשתמש, לאיזה מצב לעבור, ומה לעדכן בהקשר. כשמשתמש חוזר לתפריט מתוך טופס, מנקים את שדות הטופס מההקשר. אחרת, בפעם הבאה שהוא ייכנס לטופס, הבוט עלול להשתמש בנתונים ישנים מהפעם הקודמת. הניקוי עצמו הוא עדכון שמציב \`None\` בשדות האלה: \`transition_to\` רק ממזג את העדכון לתוך ההקשר, אז שדה שלא מופיע בעדכון נשאר כמו שהיה, ועדכון ריק לא משנה כלום.

### הגנה על טפסים רב-שלביים

נניח שהבוט מציג הוראות כשמשתמש כותב "עזרה". אבל משתמש באמצע טופס, שצריך להקליד שם של מקום, כותב "מרכז עזרה". בלי הגנה, המילה מפעילה את ההוראות במקום להתקבל כתשובה לשאלה בטופס.

\`\`\`python
def is_in_multi_step_flow(state: str) -> bool:
    return state.startswith(("USER.FORM.", "USER.REGISTER."))

if not is_in_multi_step_flow(current_state):
    if "עזרה" in text:
        return help_response()
\`\`\`

בזמן זרימה רב-שלבית, רק ה-handler של אותה זרימה מטפל בהודעה.

---

## 3. שליחת הודעות

### ממשק אחיד לספקים

היום Cloud API של Meta, ומחר אולי ספק אחר. אם הקוד העסקי קורא ישירות לספק מסוים, כל החלפה נוגעת בכל הקוד.

\`\`\`python
class BaseWhatsAppProvider(ABC):
    @abstractmethod
    async def send_text(self, to: str, text: str, keyboard=None) -> None: ...

    @abstractmethod
    async def send_media(self, to: str, media_url: str, media_type: str = "image") -> None: ...

    @abstractmethod
    def format_text(self, html_text: str) -> str: ...

    @abstractmethod
    def normalize_phone(self, phone: str) -> str: ...
\`\`\`

השירותים תלויים רק בממשק. ספק חדש הוא מימוש חדש של הממשק, בלי לגעת בלוגיקה.

### ניסיון חוזר, שנכשל בקול

\`\`\`python
TEMPORARY_STATUSES = {429, 502, 503, 504}

async def send_with_retry(self, endpoint: str, payload: dict) -> None:
    last_error = None
    for attempt in range(self._max_retries):
        try:
            response = await self._client.post(
                f"{self._gateway_url}/{endpoint}", json=payload,
            )
        except httpx.TransportError as exc:  # ניתוק, timeout
            last_error = exc
        else:
            if response.status_code == 200:
                return
            if response.status_code not in TEMPORARY_STATUSES:
                raise PermanentSendError(response.status_code)
            last_error = TemporarySendError(response.status_code)

        if attempt < self._max_retries - 1:
            await asyncio.sleep(2 ** attempt)  # 1, 2, 4 שניות

    raise TemporarySendError("all attempts failed") from last_error
\`\`\`

שלושה דברים שקל לפספס כאן:
- **כשכל הניסיונות נכשלים, הפונקציה זורקת שגיאה.** לולאה שפשוט נגמרת מחזירה בשקט, כאילו השליחה הצליחה.
- **ניתוק ו-timeout הם גם תקלה זמנית**, ולא רק קודי סטטוס.
- **timeout לא אומר שההודעה לא נשלחה.** ייתכן שהשרת קיבל אותה, ורק התשובה לא חזרה. ניסיון חוזר עלול לשלוח את ההודעה פעמיים, אז בהודעות שכפילות בהן מזיקה, שווה לשקול את זה.

### מפסק זרם

כשה-API של WhatsApp למטה, אלפי הודעות ממתינות. בלי הגנה כולן ינסו, ייכשלו וינסו שוב, ויעמיסו על השרת.

\`\`\`python
class CircuitBreaker:
    """
    CLOSED: עובד רגיל, סופר כשלונות
    OPEN: הספק למטה, חוסם שליחות
    HALF_OPEN: בקשה אחת בודקת אם הספק חזר, והשאר נחסמות עד שהיא מסתיימת
    """
    async def execute(self, func, *args, **kwargs):
        if self._state == CircuitState.HALF_OPEN:
            raise CircuitBreakerOpenError(self._name)  # בקשת הבדיקה עוד בדרך
        if self._state == CircuitState.OPEN:
            if not self._should_try_half_open():
                raise CircuitBreakerOpenError(self._name)
            self._state = CircuitState.HALF_OPEN
        try:
            result = await func(*args, **kwargs)
        except TemporarySendError:
            self._record_failure()
            raise
        except PermanentSendError:
            self._record_success()  # הספק ענה, רק ההודעה עצמה לא תקינה
            raise
        except BaseException:
            if self._state == CircuitState.HALF_OPEN:
                self._record_failure()  # בדיקה שנקטעה לא משאירה את המפסק תקוע
            raise
        self._record_success()
        return result
\`\`\`

רק תקלה זמנית נספרת. שגיאה קבועה, כמו מספר טלפון שגוי, היא בעיה של הודעה אחת ולא של הספק. אם גם היא נספרת, כמה מספרים שגויים ברצף "יסגרו" את השליחה לכל המשתמשים.

ובמצב HALF_OPEN יוצאת לדרך בקשת בדיקה אחת בלבד, וכל תוצאה שלה מכריעה: הצלחה, או שגיאה קבועה שמראה שהספק ענה, סוגרות את המפסק, ותקלה זמנית או בדיקה שנקטעה מחזירות אותו ל-OPEN. בלי החסימה, כל ההודעות הממתינות היו יוצאות יחד ברגע שהספק מתחיל לחזור, ובלי הכרעה בכל מקרה, המפסק היה עלול להיתקע ב-HALF_OPEN.

---

## 4. Outbox: הודעות שלא הולכות לאיבוד

מה קורה כשפעולה עסקית נשמרה במסד, אבל השליחה ל-WhatsApp נכשלה? המשתמש לא יודע שהפעולה בוצעה.

הפתרון: ההודעה נשמרת בטבלת outbox **באותה טרנזקציה** עם הפעולה העסקית, ותהליך נפרד שולח אותה.

\`\`\`python
class OutboxService:
    async def queue_message(self, recipient_id, content, platform="whatsapp"):
        self.db.add(OutboxMessage(
            platform=platform,
            recipient_id=recipient_id,
            content=content,
            status=MessageStatus.PENDING,
        ))
        # בלי commit כאן: הוא קורה יחד עם הפעולה העסקית
\`\`\`

ותהליך השליחה מנסה שוב הודעות שנכשלו, עם המתנה שגדלה בכל ניסיון, עד תקרה:

\`\`\`python
def calculate_backoff(retry_count: int, base: int = 2, max_seconds: int = 3600) -> int:
    return min(base * (2 ** retry_count), max_seconds)
\`\`\`

אם הפעולה נשמרה, ההודעה תישלח, גם אם זה ייקח כמה ניסיונות. ואם הפעולה לא נשמרה, גם ההודעה לא קיימת.

---

## 5. פעולות מקבילות: נעילת שורה

כשכמה משתמשים מנסים לבצע את אותה פעולה באותו רגע, למשל לתפוס את אותו פריט, צריך נעילה:

\`\`\`python
async def claim_item(self, user_id: int, item_id: int):
    result = await self.db.execute(
        select(Item).where(Item.id == item_id).with_for_update()
    )
    item = result.scalar_one()

    if item.status != "available":
        raise AlreadyClaimedError(item_id)

    item.status = "claimed"
    item.claimed_by = user_id
    await self.outbox.queue_message(
        recipient_id=user_id,
        content={"text": "הפריט שלך!"},
    )
    await self.db.commit()  # הכול ביחד, או כלום
\`\`\`

\`with_for_update\` נועל את השורה עד סוף הטרנזקציה, כך שבקשה שנייה מחכה, ואז רואה שהפריט כבר נתפס.

ומלכודת של PostgreSQL: אי אפשר לשלב \`joinedload\` עם \`with_for_update\`, כי PostgreSQL לא נועל את הצד שיכול להיות ריק ב-\`LEFT OUTER JOIN\`. הפתרון: שאילתה אחת עם הנעילה, ושאילתה שנייה לטעינת הקשרים.

---

## 6. אבטחה

### קלט מהמשתמש

על קלט מהמשתמש עושים שלושה דברים: מגבילים אורך, מסירים תווי null, ומבצעים escape בזמן ההצגה, למשל \`html.escape\` לפני שליחה בפורמט HTML. מפני SQL injection מגינות שאילתות עם פרמטרים, ו-SQLAlchemy עושה את זה כבר מעצמו.

מה **לא** לעשות: לסרוק את הטקסט ולחסום הודעות שמכילות מחרוזות "חשודות" כמו \`OR 1=1\` או \`<script>\`. סריקה כזו לא מוסיפה הגנה על מה שכבר מוגן, וחוסמת הודעות לגיטימיות. בדיוק זה קרה לי עם חומת האש של Render, שחסמה שמירה של קבצי קוד רק כי הופיעו בהם פקודות.

### מספרי טלפון בלוגים

מספר טלפון הוא מידע אישי, ואסור שיופיע בלוגים:

\`\`\`python
class PhoneNumberValidator:
    @staticmethod
    def mask(phone: str) -> str:
        """'+972501234567' → '+97250123****'"""

# לא
logger.info(f"הודעה נשלחה ל-{phone}")

# כן
logger.info("הודעה נשלחה", extra_data={
    "phone": PhoneNumberValidator.mask(phone),
})
\`\`\`

### הגבלת קצב על ה-webhook

הגבלת קצב לפי כתובת IP מגינה מפני הצפה. אבל שימו לב: ההודעות האמיתיות מגיעות כולן משרתים של Meta, כלומר מקבוצה קטנה של כתובות. מגבלה נוקשה מדי לפי IP עלולה לחסום דווקא אותן, בדיוק כשיש עומס אמיתי, ואז Meta שולחת אותן שוב ומגדילה את העומס. אימות החתימה, שקורה לפני כל עיבוד, הוא ההגנה העיקרית מפני בקשות מזויפות.

---

## 7. מעקב אחרי בקשה

\`\`\`python
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(CorrelationIdMiddleware)
app.add_middleware(RequestLoggingMiddleware)  # עם מיסוך מספרים
app.add_middleware(WebhookRateLimitMiddleware)
\`\`\`

כל בקשה מקבלת מזהה ייחודי, שעובר דרך כל השכבות ונכתב בכל שורת לוג. כשמשתמש מדווח "ההודעה לא הגיעה", מחפשים את המזהה ורואים את כל הדרך: מה-webhook, דרך מכונת המצבים, ועד ניסיון השליחה.

\`\`\`json
{
  "timestamp": "2026-03-14T10:30:00Z",
  "level": "ERROR",
  "correlation_id": "a1b2c3d4",
  "message": "שליחה נכשלה",
  "extra": {"phone": "+97250123****", "retry": 3}
}
\`\`\`

---

## 8. כפתורים ותצוגה

### כפתורים הם טקסט רגיל

כפתורים ב-WhatsApp ובטלגרם מוצגים כטקסט רגיל. אם עושים \`html.escape\` על טקסט של כפתור, הסימן & הופך לקידוד ה-HTML שלו, והמשתמש רואה את הקידוד במקום את הסימן עצמו. ה-escape נדרש רק בגוף ההודעה.

\`\`\`python
# לא: ה-& מוצג כקידוד HTML ולא כסימן, למשל ב-Ben & Jerry's
keyboard.append([f"📦 {html.escape(item_name)}"])

# כן: מציג Ben & Jerry's
keyboard.append([f"📦 {item_name}"])
\`\`\`

### חילוץ הבחירה מכפתור

כשמשתמש לוחץ על כפתור, הטקסט שלו חוזר כהודעה רגילה. ביטוי שמחפש "מספר כלשהו" יתפוס גם מספרים מטקסט חופשי:

\`\`\`python
# לא: תופס כל מספר, גם מהודעה רגילה
match = re.search(r"(\\d+)", text)

# כן: מעוגן לפורמט של הכפתור
match = re.match(r"📦\\s*(\\d+)\\.", text)
\`\`\`

### המרת פורמט בין פלטפורמות

אם הבוט עובד גם בטלגרם, הפורמט שונה: טלגרם משתמש ב-HTML, ו-WhatsApp בסימנים משלו.

\`\`\`python
def convert_html_to_whatsapp(text: str) -> str:
    # <b>bold</b>    → *bold*
    # <i>italic</i>  → _italic_
    # <s>strike</s>  → ~strike~
    ...
\`\`\`

---

## 9. ניתוב לפי תפקיד

כשיש כמה סוגי משתמשים, הניתוב צריך להיות מפורש:

\`\`\`python
# לא: מה קורה עם תפקיד חדש?
if user.role == "admin":
    handler = AdminHandler(db)
else:
    handler = UserHandler(db)

# כן: כל תפקיד מטופל, ותפקיד לא מוכר נרשם
HANDLERS = {
    "admin": AdminHandler,
    "user": UserHandler,
    "manager": ManagerHandler,
}
handler_cls = HANDLERS.get(user.role)
if handler_cls is None:
    logger.warning("תפקיד לא מוכר", extra_data={"role": user.role})
    return unknown_role_response()
handler = handler_cls(db)
\`\`\`

בגרסה הראשונה, תפקיד חדש שנשכח מקבל בשקט את ה-handler של משתמש רגיל, והבאג מתגלה רק כשמישהו מדווח שמשהו לא עובד.

---

## 10. אפס הוא לא "אין ערך"

\`\`\`python
# לא: אפס נחשב "אין ערך"
if user.latitude:
    save_location(user.latitude)  # קו רוחב 0 לא נשמר
if price:
    apply_discount(price)  # מחיר 0 לא מטופל

# כן
if user.latitude is not None:
    save_location(user.latitude)
if price is not None:
    apply_discount(price)
\`\`\`

בכל ערך מספרי שאפס הוא ערך תקין: \`is not None\`, לא \`if value\`.

---

## בשורה התחתונה

רוב מה שכאן מסתכם בשלושה כללים:
1. **להניח שכל דבר יגיע פעמיים, ויישבר באמצע.** מסד במקום מטמון, outbox באותה טרנזקציה, ועדכון אטומי במקום "בדיקה ואז פעולה".
2. **כל כשל צריך להיראות כמו כשל.** ניסיון חוזר שנגמר זורק שגיאה, מעבר לא חוקי נרשם, ותפקיד לא מוכר לא נופל בשקט ל-else.
3. **להגן במקום הנכון.** שאילתות עם פרמטרים ולא סריקת טקסט, חתימה לפני עיבוד, ומפסק זרם שסופר רק תקלות של הספק.

הדפוסים האלה לא ייחודיים ל-WhatsApp, אבל שם, בגלל השליחות החוזרות והמגבלות של ה-API, הם הופכים מהמלצה לחובה.

*מבוסס על לקחים ממערכת פרודקשן אמיתית. הקוד מפושט לצורך הדגמה.*`
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
    content: `בניתי לבעל עסק בוט שסורק קבוצות פייסבוק, מזהה פוסטים שנראים כמו לידים ושולח לו אותם לטלגרם. הוא רץ בפרודקשן על שרת קטן, עם 512MB זיכרון. רוב מה שלמדתי בדרך לא קשור לסריקה עצמה, אלא לשתי שאלות: איך לא לשלוח למשתמש את אותו פוסט פעמיים, ואיך לא לשלם על AI שלא היה צריך לרוץ בכלל.

המדריך מסכם את הלקחים לפי הסדר שבו כל פריט עובר במערכת.

---

## המסלול של כל פריט

כל פריט עובר את אותם שלבים, מהזול ליקר:

1. סריקה — הורדת הפריטים מהאתר.
2. סינון כפילויות — לפי מזהה, לפי תוכן, ובין קבוצות שונות.
3. סינונים חינמיים — גיל הפוסט, רשימת חסימות, מילות מפתח.
4. סיווג AI — רק למה ששרד עד כאן.
5. התראה בטלגרם.

הסדר הוא כל העניין. כל שלב חינמי שמסנן פריט לפני ה-AI חוסך קריאה בתשלום, וכל כפילות שנתפסת מוקדם חוסכת למשתמש הודעה מיותרת. כדאי שכל שלב יישב בקובץ משלו: קל להחליף אותו, לבדוק אותו לבד, וכשפריט לא מגיע, למצוא בדיוק באיזה שלב הוא נעצר.

---

## סריקה: להתחיל מהכלי הקל

| כלי | מתי | זיכרון, בערך |
|---|---|---|
| requests + BeautifulSoup | התוכן מגיע מוכן ב-HTML | ~20MB |
| Playwright | התוכן נבנה ב-JavaScript, או שצריך להתחבר | 150–300MB |
| API ישיר | יש API, רשמי או לא | ~10MB |

תתחילו עם requests. Playwright הוא דפדפן שלם, ועל שרת של 512MB ההבדל מורגש מיד. עוברים אליו רק כשאין ברירה.

\`\`\`python
import asyncio
import requests
from bs4 import BeautifulSoup

async def scrape_page(url: str) -> list[dict]:
    # requests חוסם, ולכן רץ ב-thread נפרד
    response = await asyncio.to_thread(
        requests.get, url, timeout=15, headers=HEADERS
    )
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")

    items = []
    for element in soup.select(".item-selector"):
        link = element.find("a", href=True)
        items.append({
            "id": link["href"] if link else None,
            "text": element.get_text(strip=True),
            "has_real_url": link is not None,
        })
    return items
\`\`\`

פריט בלי קישור לא מקבל מזהה מומצא. הוא מסומן ככזה, והסעיף על כפילויות מסביר למה זה חשוב.

כשבכל זאת צריך דפדפן, פותחים אחד לכל ריצת הסריקה, ולכל דף מקבלים context חדש:

\`\`\`python
async def block_heavy(route):
    if route.request.resource_type in {"image", "media", "font"}:
        await route.abort()
    else:
        await route.continue_()

async def scrape_with_browser(browser, url: str) -> list[dict]:
    context = await browser.new_context(
        viewport={"width": 360, "height": 640},  # גרסת מובייל, קלה יותר
    )
    try:
        page = await context.new_page()
        await page.route("**/*", block_heavy)
        await page.goto(url, wait_until="domcontentloaded")
        return await smart_scroll(page, seen_checker)
    finally:
        await context.close()
\`\`\`

ה-finally הוא לא קישוט. בלעדיו, כל שגיאה באמצע הדף משאירה context פתוח, ועל 512MB מספיקים כמה כאלה כדי שהשרת ייפול.

---

## גלילה: לעקוב אחרי תוכן, לא אחרי מיקום

אתרים כמו פייסבוק מחזיקים בדף רק את מה שנראה כרגע. כשגוללים, פריטים חדשים נוספים וישנים נמחקים. אם עוקבים לפי מיקום, "המשך מהפריט החמישי", המספרים זזים בין גלילה לגלילה, ופריטים מדולגים או נקראים פעמיים.

הפתרון: לזכור מה כבר נקרא, לפי התוכן.

\`\`\`python
async def smart_scroll(page, seen_checker) -> list[dict]:
    seen_texts = set()
    consecutive_known = 0
    all_items = []

    for _ in range(MAX_SCROLLS):
        new_in_scroll = 0
        for el in await page.query_selector_all(".item"):
            text = await el.inner_text()
            if text in seen_texts:
                continue
            seen_texts.add(text)
            item = extract_item(el, text)

            if item["has_real_url"] and seen_checker(item["id"]):
                consecutive_known += 1
                if consecutive_known >= 3:
                    return all_items  # הגענו לפוסטים שכבר עובדו
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

למה לעצור רק אחרי שלושה פריטים מוכרים ברצף, ולא אחרי הראשון? כי בראש הקבוצה יש לפעמים פוסט נעוץ שכבר עובד מזמן. אם עוצרים על הפריט המוכר הראשון, הסריקה נגמרת לפני שראתה פוסט חדש אחד.

---

## כפילויות: הלב של המערכת

משתמש שמקבל את אותו ליד פעמיים מפסיק לסמוך על הבוט. לכן יש שלוש שכבות: לפי מזהה, לפי תוכן, ובין קבוצות שונות, כי אותו פוסט מתפרסם לא פעם בכמה קבוצות.

### מזהה מומצא שובר הכול

הטעות: לתת לפריט בלי קישור את כתובת הדף כמזהה.

\`\`\`python
# שגוי — כל הפריטים בלי קישור מקבלים את אותו מזהה
item_id = extract_url(el) or page_url
\`\`\`

הסימפטום: אחרי שפריט אחד כזה נשמר, כל פריט בלי קישור שבא אחריו נראה "כבר מוכר" ונעלם. הפתרון הוא מה שראיתם בקוד הסריקה: דגל שאומר אם המזהה אמיתי, ובדיקת כפילות לפי מזהה רק כשהוא אמיתי. לשאר יש את בדיקת התוכן.

### טביעת אצבע יציבה לתוכן

הבעיה: אותו פוסט נראה אחרת בכל סריקה. נוספו לו לייקים, נוספו תגובות, והקישורים בו נושאים פרמטרי מעקב משתנים. Hash על הטקסט כמו שהוא משתנה כל פעם, והפוסט נשלח שוב ושוב.

\`\`\`python
import hashlib, re

def stable_text_for_hash(text: str) -> str:
    text = text.lower()
    text = re.sub(r"https?://\\S+", "", text)       # קישורים עם פרמטרי מעקב
    text = re.sub(r"[\\uE000-\\uF8FF]", "", text)    # תווי אייקונים
    stable = []
    for line in text.split("\\n"):
        s = line.strip()
        if not s:
            continue
        if re.match(r"^\\d[\\d,. ]*$", s):            # מונה לייקים
            continue
        if ENGAGEMENT_RE.match(s):                   # "5 תגובות"
            continue
        stable.append(s)
    return " ".join(stable)

def content_dedup_hash(text: str) -> str:
    words = stable_text_for_hash(text).split()[:12]
    return hashlib.md5(" ".join(words).encode()).hexdigest()
\`\`\`

למה 12 המילים הראשונות, ולא 150 התווים הראשונים? בפוסט קצר, 150 תווים כבר נכנסים לתגובות, והתגובות משתנות בין סריקות. עיקר הפוסט, הכותרת ותחילת הגוף, תמיד בהתחלה. 12 מילים תופסות אותו ועוצרות לפני התגובות.

---

## מילות מפתח: המלכודת של רשימה ריקה

\`\`\`python
def passes_keyword_filter(text: str, keywords: list[str]) -> bool:
    if not keywords:
        return True  # אין מילות מפתח = אין סינון
    text_lower = text.lower()
    return any(kw in text_lower for kw in keywords)
\`\`\`

> **אזהרה:** בלי השורה הראשונה, רשימה ריקה חוסמת הכול: \`any([])\` מחזיר False. משתמש שמחק את כל מילות המפתח שלו מצפה לקבל הכול, ומקבל שקט מוחלט, בלי שום שגיאה.

---

## סיווג AI: באצ'ים, בלי לערבב ובלי להעלים

שולחים לסיווג חמישה פריטים בקריאה אחת, כדי לחסוך. אבל צריך לשמור על שני דברים.

\`\`\`python
def classify_batch(items: list[dict], batch_size: int = 5) -> list[dict]:
    results = []
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        try:
            parsed = parse_response(call_api(batch))
            if len(parsed) != len(batch):
                raise ValueError(f"expected {len(batch)}, got {len(parsed)}")
            results.extend(parsed)  # רק אחרי שהבאץ' כולו הצליח
        except Exception:
            logger.exception("batch failed, classifying one by one")
            for item in batch:
                try:
                    results.append(classify_single(item))
                except Exception:
                    logger.exception("classification failed: %s", item["id"])
                    results.append({"relevant": None, "failed": True})
    return results
\`\`\`

הראשון: תוצאות נכנסות לרשימה רק אחרי שהבאץ' כולו הצליח. אם מוסיפים אותן תוך כדי ונופלים באמצע, חלק מהבאץ' כבר בפנים, הגיבוי מוסיף את כולו שוב, והתוצאות כבר לא מתאימות לפריטים שלהן. פוסט אחד מקבל את הסיווג של פוסט אחר.

השני: כשהסיווג נכשל, לא מסמנים "לא רלוונטי". תקלה ב-API שנראית כמו "לא היו לידים היום" היא הדבר הכי קשה לגלות. פריט שנכשל מסומן ככזה, נרשם בלוג, ולא נשמר כ"כבר נראה", כך שהסריקה הבאה תנסה אותו שוב.

---

## התראה: לשמור רק אחרי ששלחתם

\`\`\`python
async def send_lead(item: dict, reason: str):
    text = format_lead(item, reason)
    success = await asyncio.to_thread(send_message, text)  # גם שליחה חוסמת
    if success:
        save_lead(item["id"], item["text"])
\`\`\`

אם שומרים לפני השליחה והשליחה נכשלת, הליד מסומן כמטופל ולא יישלח לעולם. ועוד טיפ קטן: ערוץ אחד ללידים, וערוץ נפרד לשגיאות טכניות. המשתמש לא צריך לראות את השגיאות שלכם, ואתם לא רוצים לפספס אותן בין הלידים.

---

## זיכרון על שרת של 512MB

- גרסת מובייל של האתר, כשיש כזו. זה הצעד שחוסך הכי הרבה.
- חסימה של תמונות, וידאו ופונטים, כמו בקוד למעלה.
- דפדפן אחד לכל הריצה, ו-context חדש לכל דף, שנסגר תמיד.
- מעבר ל-about:blank בין דפים, כדי לשחרר את הדף הקודם.
- \`gc.collect()\` אחרי סגירת הדפדפן ולפני שלב ה-AI.

---

## התחברות שפגה: לא לפחד מכל קישור התחברות

\`\`\`python
# שגוי — סימן אחד ומתחברים מחדש
if any_login_link_found:
    re_login()

# נכון — רק כשהדף באמת נראה כמו דף התחברות
if login_ratio > 0.75 and no_content and link_count >= 3:
    re_login()
\`\`\`

קישור "התחברות" מופיע לפעמים גם בדף תקין, בפינה. אם כל הופעה שלו נחשבת לסשן שפג, הבוט מתחבר מחדש בלי סוף, ובאתרים כמו פייסבוק התחברויות חוזרות הן בדיוק מה שגורם לחסימת החשבון.

---

## בשורה התחתונה

אם זוכרים רק שלושה דברים: לסנן בחינם לפני שמשלמים על AI, לזהות כפילויות לפי תוכן יציב ולא לפי מה שנראה על המסך, ולוודא שכל כשל נראה כמו כשל, ולא כמו "לא היה כלום".`
  }
};

// רשימת כל הסלאגים לניווט בין בלוגים
const blogSlugs = Object.keys(blogPosts) as Array<keyof typeof blogPosts>;

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
  const [, setLocation] = useLocation();

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
