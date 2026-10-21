import { describe, expect, it } from "vitest";
import { materieDinRotatie, slugSubiect, validateIntrebari } from "./subiect-rezolvat";
import { SUBIECTE_REZOLVATE } from "./tutoriale/subiecte";

const q = { enunt: "Enunț", variante: ["1", "2", "3", "4"], corect: 1, rezolvare: "x".repeat(70), de_ce: "y".repeat(70) };

describe("subiecte rezolvate", () => {
  it("rotates to a different subject each day", () => {
    expect([0, 1, 2, 3, 8].map(i => materieDinRotatie(i).materie)).toEqual(["Informatică", "Matematică", "Fizică", "Chimie", "Informatică"]);
  });
  it("builds descriptive slugs", () => {
    expect(slugSubiect("Informatică", 1)).toBe("subiect-admitere-informatica-varianta-1-rezolvat");
  });
  it("rejects a question whose correct answer is outside the options", () => {
    expect(() => validateIntrebari(Array(8).fill({ ...q, corect: 4 }))).toThrow();
    expect(validateIntrebari(Array(8).fill(q))).toHaveLength(8);
  });
  it("publishes three complete variants: informatics, maths, physics", () => {
    expect(SUBIECTE_REZOLVATE.map(s => s.materie)).toEqual(["Informatică", "Matematică", "Fizică"]);
    for (const s of SUBIECTE_REZOLVATE) expect(validateIntrebari(s.intrebari, 10)).toHaveLength(10);
  });
});
