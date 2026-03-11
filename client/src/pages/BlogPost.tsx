/**
 * Terminal Aesthetic Portfolio - Blog Post Page
 * Design: Retro-futurism with 1980s terminal aesthetic
 */

import "../blog-styles.css";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { Streamdown } from 'streamdown';

// Blog posts data
const blogPosts = {
  "telegram-broadcast-rate-limiting": {
    title: "איך לשלוח הודעה לאלפי משתמשים בלי שטלגרם יחסום אתכם 🛡️",
    date: "2026-02-10",
    content: `**📢 איך לשלוח הודעה לאלפי משתמשים בלי שטלגרם יחסום אתכם 🛡️**

אחת הבעיות הכי נפוצות בבוטים היא ה-Broadcast. אתם רוצים לעדכן את כל המשתמשים על פיצ'ר חדש, מריצים לולאה מהירה, ובווום - טלגרם חוסמת את הבוט שלכם בגלל "Flood Wait".

**🚫 הבעיה:**

טלגרם מגבילה שליחה לקהלים גדולים לערך של כ-**30 הודעות בשנייה**. אם תעברו אותו, הבוט שלכם ייכנס להסגר.

**✅ איך עושים את זה נכון?**

בסניפט הזה מוצג מנגנון שליחה חכם (Bulk Send) שכולל:

✅ **Rate Limiting מובנה**: שימוש ב-\`asyncio.sleep\` כדי לשמור על קצב עבודה יציב ולא "לעצבן" את השרתים.

✅ **טיפול אדפטיבי ב-RetryAfter**: אם בכל זאת קיבלנו חסימה זמנית, הקוד יודע לעצור בדיוק למספר השניות שטלגרם ביקשה ולהמשיך מאותה נקודה.

✅ **ניתוח תוצאות**: הפרדה בין כשלונות טכניים לבין משתמשים שפשוט חסמו את הבוט (Blocked).

**📝 הקוד המלא:**

\`\`\`python
import asyncio
from telegram.error import RetryAfter, TelegramError


async def bulk_send_messages(bot, user_ids, text, delay=0.05):
    """
    Send message to multiple users with rate limiting
    30 messages/second for different users
    """
    results = {'success': 0, 'failed': 0, 'blocked': 0}

    for user_id in user_ids:
        try:
            await bot.send_message(chat_id=user_id, text=text)
            results['success'] += 1
            await asyncio.sleep(delay)  # Rate limit

        except RetryAfter as e:
            print(f"⏸ Rate limited, waiting {e.retry_after}s")
            await asyncio.sleep(e.retry_after)
            # Retry
            await bot.send_message(chat_id=user_id, text=text)

        except TelegramError as e:
            if 'blocked' in str(e).lower():
                results['blocked'] += 1
            else:
                results['failed'] += 1
                print(f"❌ Failed {user_id}: {e}")

    return results


# Usage with progress bar
async def send_broadcast(bot, message):
    users = await db.get_all_user_ids()
    print(f"📢 Sending to {len(users)} users...")

    results = await bulk_send_messages(bot, users, message)

    print(f"✅ Success: {results['success']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"🚫 Blocked: {results['blocked']}")
\`\`\`

**🔑 איך זה עובד?**

1️⃣ **Rate Limiting מובנה** - \`asyncio.sleep(0.05)\` מבטיח שאנחנו לא שולחים יותר מ-20 הודעות בשנייה (בטוח מהגבול של 30)

2️⃣ **טיפול ב-RetryAfter** - אם טלגרם מחזירה \`RetryAfter\`, אנחנו ממתינים בדיוק את הזמן שהיא ביקשה ומנסים שוב

3️⃣ **הפרדת שגיאות** - משתמשים שחסמו את הבוט נספרים בנפרד משגיאות טכניות

**💡 טיפ חשוב:**

אם יש לכם יותר מ-10,000 משתמשים, שקלו לחלק את השליחה לבאצ'ים של 1000-2000 משתמשים עם הפסקות ביניים. זה מפחית את הסיכון לחסימה.

---

**🚀 השתמשתי בזה בבוטים שלי וזה עובד מעולה!**

מוזמנים להשתמש ולשתף 👍`
  },
  "whatsapp-bot-python-guide": {
    title: "בניית בוט WhatsApp עם Python - מדריך מעשי 📱",
    date: "2026-01-20",
    content: `**📱 בניית בוט WhatsApp עם Python - מדריך מעשי**

WhatsApp הוא אחד מאמצעי התקשורת הפופולריים ביותר בעולם, ובניית בוטים עבורו יכולה להיות מאוד שימושית - משירות לקוחות ועד אוטומציות עסקיות.

במדריך הזה נבנה בוט WhatsApp מתקדם עם **PyWa** - ספרייה Python שמקלה על העבודה עם WhatsApp Business API.

**🛠️ הכנה ראשונית**

לפני שמתחילים, צריך:

1️⃣ **חשבון WhatsApp Business** - ניתן להשתמש ב-WhatsApp Business API (משלם) או בפתרונות קוד פתוח כמו WPP

2️⃣ **התקנת PyWa**:

\`\`\`bash
pip install pywa
\`\`\`

3️⃣ **Webhook Server** - בוט WhatsApp עובד עם webhooks, לכן נזדקק לשרת עם HTTPS

**📝 הקוד הבסיסי**

הנה בוט בסיסי שמגיב להודעות:

\`\`\`python
from pywa import WhatsApp
from pywa.types import Message
from flask import Flask

app = Flask(__name__)

# איניציאליזציה של הבוט
wa = WhatsApp(
    phone_id="YOUR_PHONE_ID",
    token="YOUR_ACCESS_TOKEN",
    server=app,
    verify_token="YOUR_VERIFY_TOKEN"
)

@wa.on_message()
def handle_message(client: WhatsApp, msg: Message):
    """
    טיפול בהודעות נכנסות
    """
    print(f"הודעה מ-{msg.from_user.name}: {msg.text}")
    
    # שליחת תשובה
    msg.reply(
        text=f"שלום {msg.from_user.name}! קיבלתי את ההודעה שלך: {msg.text}"
    )

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
\`\`\`

**📸 שליחת תמונות ומדיה**

אחד היתרונות של WhatsApp הוא תמיכה מלאה במדיה:

\`\`\`python
from pywa.types import Button

@wa.on_message()
def handle_message(client: WhatsApp, msg: Message):
    if msg.text == "/image":
        # שליחת תמונה
        client.send_image(
            to=msg.from_user.wa_id,
            image="https://example.com/image.jpg",
            caption="הנה תמונה שביקשת!"
        )
    
    elif msg.text == "/menu":
        # שליחת כפתורים אינטראקטיביים
        client.send_message(
            to=msg.from_user.wa_id,
            text="בחר אפשרות:",
            buttons=[
                Button(title="מידע", callback_data="info"),
                Button(title="תמיכה", callback_data="support"),
                Button(title="מחירים", callback_data="pricing")
            ]
        )
\`\`\`

**⚙️ טיפול בכפתורים**

כשמשתמש לוחץ על כפתור, נטפל בזה כך:

\`\`\`python
from pywa.types import CallbackButton

@wa.on_callback_button()
def handle_button(client: WhatsApp, btn: CallbackButton):
    """
    טיפול בלחיצות על כפתורים
    """
    if btn.data == "info":
        btn.reply(text="כאן מידע על השירות שלנו...")
    
    elif btn.data == "support":
        btn.reply(text="צור קשר ב-support@example.com")
    
    elif btn.data == "pricing":
        btn.reply(text="המחירים שלנו: 99₪ לחודש")
\`\`\`

**📊 אוטומציה מתקדמת - שליחת הודעות מתוזמנות**

אפשר לשלוח הודעות מתוזמנות עם templates:

\`\`\`python
import schedule
import time

def send_daily_reminder():
    """
    שליחת תזכורת יומית
    """
    users = get_all_users()  # קבלת רשימת משתמשים מה-DB
    
    for user in users:
        wa.send_message(
            to=user.phone,
            text=f"בוקר טוב {user.name}! הנה התזכורת היומית שלך."
        )
        time.sleep(1)  # Rate limiting

# תזמון ל-9:00 בבוקר
schedule.every().day.at("09:00").do(send_daily_reminder)

while True:
    schedule.run_pending()
    time.sleep(60)
\`\`\`

**⚠️ טיפים חשובים**

✅ **Rate Limiting** - WhatsApp מגבילה כמות הודעות. הוסיפו \`time.sleep()\` בין הודעות

✅ **אבטחת מידע** - השתמשו ב-HTTPS ואל תשמרו tokens בקוד

✅ **טיפול בשגיאות** - תמיד עטפו קוד ב-try/except כדי לטפל בבעיות רשת

✅ **בדיקות** - בדקו את הבוט בקפדנות לפני פרסום

**🚀 סיכום**

PyWa מקלה מאוד על בניית בוטי WhatsApp מתקדמים. עם הספרייה הזו אפשר לבנות:

- מערכות שירות לקוחות אוטומטיות
- בוטים לניהול הזמנות
- מערכות תזכורות והתראות
- אוטומציות עסקיות

מוזמנים להשתמש ולשתף! 👍`
  },
  "distributed-lock-mongo": {
    title: "Distributed Lock במונגו – פתרון ל-telegram.error.Conflict",
    date: "2026-02-15",
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

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const [, setLocation] = useLocation();
  
  const slug = params?.slug || "";
  const post = blogPosts[slug as keyof typeof blogPosts];

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
              <div className="mb-8">
                <div className="text-xs text-accent mb-2 font-mono">
                  {post.date}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-primary neon-glow mb-4">
                  {post.title}
                </h1>
              </div>

              {/* Content with Markdown rendering */}
              <div className="prose prose-invert max-w-none">
                <Streamdown>{post.content}</Streamdown>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
