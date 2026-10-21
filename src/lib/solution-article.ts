const REQUIRED_SECTIONS = [
  "## Enunțul grilei",
  "## Rezolvare pas cu pas",
  "## Întrebări frecvente",
];
const MIN_WORDS = 700;

export type SolutionSlugParts = { materie: string; universitate: string; topic: string };

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function subjectLabel(name: string) {
  return name.replace(/\s*\([^)]*\)/g, "").trim();
}

export function buildSolutionSlug(
  parts: SolutionSlugParts,
  taken: Set<string>,
  questionId: string,
) {
  const slug = slugify(
    `rezolvare grila ${subjectLabel(parts.materie)} ${parts.universitate} ${parts.topic}`,
  )
    .slice(0, 90)
    .replace(/-$/, "");
  return taken.has(slug) ? `${slug}-${questionId.slice(0, 6)}` : slug;
}

export function pickSolutionCandidate<T extends { id: string; subjectSlug: string }>(
  candidates: T[],
  usedIds: Set<string>,
  offset: number,
): T | null {
  const bySubject = new Map<string, T[]>();
  for (const candidate of candidates) {
    if (usedIds.has(candidate.id)) continue;
    bySubject.set(candidate.subjectSlug, [
      ...(bySubject.get(candidate.subjectSlug) ?? []),
      candidate,
    ]);
  }
  const groups = [...bySubject.values()];
  return groups.length ? groups[offset % groups.length][0] : null;
}

export function isCompleteSolutionArticle(contentMd: string, quizPath: string) {
  return (
    REQUIRED_SECTIONS.every((section) => contentMd.includes(section)) &&
    contentMd.includes(`](${quizPath})`) &&
    contentMd.split(/\s+/).length >= MIN_WORDS
  );
}

export type QuestionRow = {
  id: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  solution_md: string | null;
  subjects: {
    name: string;
    slug: string;
    universities: { short_name: string | null; name: string; slug: string } | null;
  } | null;
};

export type SolutionCandidate = {
  id: string;
  subjectSlug: string;
  subjectName: string;
  universitate: string;
  uniSlug: string;
  question: string;
  options: string[];
  correctIndex: number;
  solution: string;
};

export function toCandidate(row: QuestionRow): SolutionCandidate[] {
  const uni = row.subjects?.universities;
  if (!row.subjects || !uni || !Array.isArray(row.options)) return [];
  return [
    {
      id: row.id,
      subjectSlug: row.subjects.slug,
      subjectName: row.subjects.name,
      universitate: uni.short_name ?? uni.name,
      uniSlug: uni.slug,
      question: row.question_text,
      options: row.options,
      correctIndex: row.correct_index,
      solution: row.solution_md ?? row.explanation ?? "",
    },
  ];
}

export const quizPathOf = (q: SolutionCandidate) => `/quiz/${q.subjectSlug}`;

export function solutionPrompt(q: SolutionCandidate) {
  const materie = subjectLabel(q.subjectName);
  const letter = (i: number) => String.fromCharCode(65 + i);
  const answer = letter(q.correctIndex);
  return `Ești profesor român cu experiență la pregătirea pentru admitere și scrii pe grileadmitere.ro articolul zilei: rezolvarea explicată în detaliu a unei grile de admitere la ${materie}, ${q.universitate}.
Grila:
${q.question}
${q.options.map((o, i) => `${letter(i)}) ${o}`).join("\n")}
Răspuns marcat corect: ${answer}.
Rezolvarea existentă: ${q.solution}

Rezolvă grila independent. answer_confirmed = true doar dacă ajungi tot la răspunsul ${answer}; altfel false, iar restul câmpurilor pot fi scurte.
Cerințe SEO:
- topic: conceptul testat, 2-5 cuvinte, cum l-ar căuta un elev (ex. „limite de funcții”).
- title: 55-70 de caractere, începe cu „Rezolvare grilă ${materie} ${q.universitate}:” urmat de topic.
- description: 140-158 de caractere, conține „rezolvare grilă ${materie}” și topicul, se termină cu un îndemn.
- keywords: 6-10 variante de căutare separate prin virgulă.
- content_md: 900-1400 de cuvinte în Markdown, fără H1, în limba română cu diacritice, LaTeX între $...$ și cod în blocuri Markdown unde e cazul. Primul paragraf (max 60 de cuvinte) spune ce rezolvăm și conține „rezolvare grilă ${materie} ${q.universitate}”. Secțiuni, în ordine: „## Enunțul grilei” (enunțul și variantele exact ca mai sus), „## Răspunsul corect”, „## Rezolvare pas cu pas” (pași numerotați, fiecare calcul justificat), „## De ce sunt greșite celelalte variante” (fiecare variantă pe rând), „## Teoria de care ai nevoie”, „## Greșeli frecvente”, „## Exersează grile similare” cu legături Markdown către ${quizPathOf(q)}, /grile/${q.uniSlug} și /simulare, „## Întrebări frecvente” cu 3 întrebări (### întrebare + răspuns scurt).
- Grila este de antrenament, nu subiect oficial: nu pretinde altceva și nu inventa date despre examen, universitate sau programă.`;
}
