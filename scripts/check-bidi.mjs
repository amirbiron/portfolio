// בדיקה שאין תווי בקרת כיוון (BiDi) בלתי נראים בקבצי הקוד.
// תווים כאלה נכנסים בהעתקה של טקסט עברי מצ'אט או מעורך, לא נראים בשום עורך,
// ומשנים בשקט את התצוגה של הטקסט. כשצריך סימן כיוון בטקסט מוצג, כותבים אותו
// כ-escape גלוי (למשל "\u200e" בתוך מחרוזת), ולא כתו עצמו.
// מקור: amir-bug-patterns, BY-STACK/hebrew-source.md, סעיף H1.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

// ה-escapes מכוונים: התווים עצמם בקובץ הזה היו מפילים את הבדיקה על עצמה
const BIDI = {
  "\u200e": "LRM",
  "\u200f": "RLM",
  "\u202a": "LRE",
  "\u202b": "RLE",
  "\u202c": "PDF",
  "\u202d": "LRO",
  "\u202e": "RLO",
  "\u2066": "LRI",
  "\u2067": "RLI",
  "\u2068": "FSI",
  "\u2069": "PDI",
};

// תיקיות הקוד בלבד. מסמכי הידע ב-docs/ הם טקסט עברי שמועבר כמו שהוא לסוכני ה-AI,
// ושם סימני כיוון הם חלק מהתוכן.
const ROOTS = ["client/src", "server", "shared", "scripts"];
const EXTENSIONS = /\.(ts|tsx|js|mjs|css|html)$/;

const root = process.cwd();
const findings = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      walk(path);
    } else if (EXTENSIONS.test(name)) {
      readFileSync(path, "utf8")
        .split("\n")
        .forEach((line, i) => {
          for (const [char, label] of Object.entries(BIDI)) {
            if (line.includes(char)) {
              const code = char
                .codePointAt(0)
                .toString(16)
                .toUpperCase()
                .padStart(4, "0");
              findings.push(
                `${relative(root, path)}:${i + 1} — ${label} (U+${code})`
              );
            }
          }
        });
    }
  }
}

for (const dir of ROOTS) {
  try {
    walk(join(root, dir));
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }
}

if (findings.length > 0) {
  console.error(
    "נמצאו תווי BiDi בלתי נראים בקוד. להסיר אותם, או לכתוב כ-escape גלוי:"
  );
  for (const f of findings) console.error(`  ${f}`);
  process.exit(1);
}
