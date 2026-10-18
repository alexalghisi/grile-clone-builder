export const articlesPerDay = (date: Date) => 2 + date.getUTCDate() % 3;

export type DailyQuestion = { intrebare: string; variante: string[]; raspuns_corect: string; explicatie: string; referinta_programa: string };

export function validateQuestions(rows: DailyQuestion[], optionCount: number, count: number): DailyQuestion[] {
  if (!Array.isArray(rows) || rows.length !== count) throw new Error("Număr incorect de întrebări");
  const seen = new Set<string>();
  for (const q of rows) {
    const index = "ABCDEF".indexOf(q.raspuns_corect);
    const key = q.intrebare?.trim().toLocaleLowerCase("ro");
    if (!key || key.length < 20 || seen.has(key) || q.variante?.length !== optionCount ||
      q.variante.some(v => typeof v !== "string" || !v.trim()) ||
      new Set(q.variante.map(v => v.trim().toLocaleLowerCase("ro"))).size !== optionCount ||
      index < 0 || index >= optionCount || q.raspuns_corect.length !== 1 ||
      !q.explicatie || q.explicatie.length < 80 || !q.referinta_programa?.trim()) {
      throw new Error("Întrebare invalidă, duplicată sau explicație incompletă");
    }
    seen.add(key);
  }
  return rows;
}