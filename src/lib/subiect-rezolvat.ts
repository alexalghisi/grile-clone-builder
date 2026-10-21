export type IntrebareRezolvata = {
  enunt: string;
  variante: string[];
  corect: number;
  rezolvare: string;
  de_ce: string;
};

export type SubiectRezolvat = {
  slug: string;
  title: string;
  description: string;
  materie: string;
  keywords: string;
  intro: string;
  subject_slug: string | null;
  published_at: string | null;
  intrebari: IntrebareRezolvata[];
};

export const MATERII_ROTATIE = [
  { materie: "Informatică", pattern: "info" },
  { materie: "Matematică", pattern: "mate" },
  { materie: "Fizică", pattern: "fizica" },
  { materie: "Chimie", pattern: "chimie" },
  { materie: "Biologie", pattern: "bio" },
  { materie: "Istorie", pattern: "istorie" },
  { materie: "Limba română", pattern: "romana" },
  { materie: "Geografie", pattern: "geografie" },
] as const;

export const materieDinRotatie = (index: number) => MATERII_ROTATIE[((index % MATERII_ROTATIE.length) + MATERII_ROTATIE.length) % MATERII_ROTATIE.length];

export function slugSubiect(materie: string, varianta: number) {
  const m = materie.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `subiect-admitere-${m}-varianta-${varianta}-rezolvat`;
}

export const letter = (i: number) => String.fromCharCode(65 + i);

export function validateIntrebari(rows: IntrebareRezolvata[], min = 8): IntrebareRezolvata[] {
  if (!Array.isArray(rows) || rows.length < min) throw new Error("Subiect incomplet");
  for (const q of rows) {
    if (!q.enunt?.trim() || !Array.isArray(q.variante) || q.variante.length < 4 ||
      new Set(q.variante.map(v => v.trim())).size !== q.variante.length ||
      !Number.isInteger(q.corect) || q.corect < 0 || q.corect >= q.variante.length ||
      (q.rezolvare?.length ?? 0) < 60 || (q.de_ce?.length ?? 0) < 60) {
      throw new Error("Întrebare fără rezolvare completă");
    }
  }
  return rows;
}
