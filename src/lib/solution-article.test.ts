import { describe, expect, it } from "vitest";
import {
  buildSolutionSlug,
  isCompleteSolutionArticle,
  pickSolutionCandidate,
  solutionPrompt,
  subjectLabel,
  toCandidate,
  type QuestionRow,
} from "./solution-article";

const candidate = (id: string, subjectSlug: string) => ({ id, subjectSlug });

const article = (quizPath: string, words = 800) =>
  [
    "Intro.",
    "## Enunțul grilei",
    "## Rezolvare pas cu pas",
    `Exersează și [alte grile](${quizPath}).`,
    "## Întrebări frecvente",
    "cuvânt ".repeat(words),
  ].join("\n\n");

describe("subjectLabel", () => {
  it("drops the faculty code in parentheses", () => {
    expect(subjectLabel("Informatică (INFO)")).toBe("Informatică");
    expect(subjectLabel("Matematică")).toBe("Matematică");
  });
});

describe("buildSolutionSlug", () => {
  const parts = { materie: "Matematică (INFO)", universitate: "UBB", topic: "Limite de funcții" };

  it("builds a keyword slug without diacritics", () => {
    expect(buildSolutionSlug(parts, new Set(), "3f9a2c71-0000")).toBe(
      "rezolvare-grila-matematica-ubb-limite-de-functii",
    );
  });

  it("appends a short question id when the slug is taken", () => {
    const taken = new Set(["rezolvare-grila-matematica-ubb-limite-de-functii"]);
    expect(buildSolutionSlug(parts, taken, "3f9a2c71-0000")).toBe(
      "rezolvare-grila-matematica-ubb-limite-de-functii-3f9a2c",
    );
  });
});

describe("pickSolutionCandidate", () => {
  const candidates = [
    candidate("a", "ubb-mate"),
    candidate("b", "ubb-mate"),
    candidate("c", "upb-info"),
    candidate("d", "umf-bio"),
  ];

  it("rotates between subjects by offset", () => {
    expect(pickSolutionCandidate(candidates, new Set(), 0)?.id).toBe("a");
    expect(pickSolutionCandidate(candidates, new Set(), 1)?.id).toBe("c");
    expect(pickSolutionCandidate(candidates, new Set(), 2)?.id).toBe("d");
    expect(pickSolutionCandidate(candidates, new Set(), 3)?.id).toBe("a");
  });

  it("skips questions that already have an article", () => {
    expect(pickSolutionCandidate(candidates, new Set(["a"]), 0)?.id).toBe("b");
  });

  it("returns null when every question is used", () => {
    expect(pickSolutionCandidate(candidates, new Set(["a", "b", "c", "d"]), 0)).toBeNull();
  });
});

describe("isCompleteSolutionArticle", () => {
  const quizPath = "/quiz/ubb-mate";

  it("accepts a complete article", () => {
    expect(isCompleteSolutionArticle(article(quizPath), quizPath)).toBe(true);
  });

  it("rejects an article without a link to the quiz", () => {
    expect(isCompleteSolutionArticle(article("/grile"), quizPath)).toBe(false);
  });

  it("rejects an article without the step by step solution", () => {
    const content = article(quizPath).replace("## Rezolvare pas cu pas", "## Rezolvare");
    expect(isCompleteSolutionArticle(content, quizPath)).toBe(false);
  });

  it("rejects a short article", () => {
    expect(isCompleteSolutionArticle(article(quizPath, 100), quizPath)).toBe(false);
  });
});

describe("toCandidate", () => {
  const row: QuestionRow = {
    id: "q1",
    question_text: "Cât este $\\lim_{x \\to 0} \\frac{\\sin x}{x}$?",
    options: ["0", "1", "2", "-1", "nu există"],
    correct_index: 1,
    explanation: "Limită fundamentală.",
    solution_md: null,
    subjects: {
      name: "Matematică (INFO)",
      slug: "ubb-mate",
      universities: { short_name: null, name: "UBB", slug: "ubb" },
    },
  };

  it("flattens a question with its subject and university", () => {
    expect(toCandidate(row)).toEqual([
      {
        id: "q1",
        subjectSlug: "ubb-mate",
        subjectName: "Matematică (INFO)",
        universitate: "UBB",
        uniSlug: "ubb",
        question: row.question_text,
        options: row.options,
        correctIndex: 1,
        solution: "Limită fundamentală.",
      },
    ]);
  });

  it("skips questions without a university", () => {
    expect(toCandidate({ ...row, subjects: { ...row.subjects!, universities: null } })).toEqual([]);
  });

  it("builds a prompt with the lettered options, the answer and the internal links", () => {
    const prompt = solutionPrompt(toCandidate(row)[0]);
    expect(prompt).toContain("B) 1");
    expect(prompt).toContain("Răspuns marcat corect: B.");
    expect(prompt).toContain("Rezolvare grilă Matematică UBB:");
    expect(prompt).toContain("/quiz/ubb-mate");
    expect(prompt).toContain("/grile/ubb");
  });
});
