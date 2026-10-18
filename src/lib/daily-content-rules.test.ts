import { describe, expect, it } from "vitest";
import { articlesPerDay, validateQuestions, type DailyQuestion } from "./daily-content-rules";

const question = (): DailyQuestion => ({ intrebare: "Care este rezultatul acestui calcul avansat?", variante: ["1", "2", "3", "4", "5"], raspuns_corect: "E", explicatie: "Rezolvarea detaliată pornește de la definiție și verifică toate condițiile problemei. ".repeat(2), referinta_programa: "Algebră" });

describe("daily content rules", () => {
  it("generates between two and four articles each day", () => {
    expect([1, 2, 3].map(day => articlesPerDay(new Date(`2026-10-0${day}T04:00:00Z`)))).toEqual([3, 4, 2]);
  });
  it("requires the full batch of ten new questions", () => {
    expect(() => validateQuestions([question()], 5, 10)).toThrow();
  });
  it("rejects a sixth answer when only five options exist", () => {
    expect(() => validateQuestions([{ ...question(), raspuns_corect: "F" }], 5, 1)).toThrow();
    expect(validateQuestions([question()], 5, 1)).toHaveLength(1);
  });
  it("preserves six options for UPB computer science", () => {
    expect(validateQuestions([{ ...question(), variante: ["1", "2", "3", "4", "5", "6"], raspuns_corect: "F" }], 6, 1)).toHaveLength(1);
  });
  it("rejects duplicate questions and duplicate answer options", () => {
    expect(() => validateQuestions([question(), question()], 5, 2)).toThrow();
    expect(() => validateQuestions([{ ...question(), variante: ["1", "1", "3", "4", "5"] }], 5, 1)).toThrow();
  });
});