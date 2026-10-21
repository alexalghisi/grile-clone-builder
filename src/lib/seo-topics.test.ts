import { describe, expect, it } from "vitest";
import { SEO_TOPICS, pickTopics, slugifyKeyword } from "./seo-topics";

describe("seo topics", () => {
  it("has unique keyword slugs", () => {
    const slugs = SEO_TOPICS.map((t) => slugifyKeyword(t.keyword));
    expect(new Set(slugs).size).toBe(slugs.length);
  });
  it("prefers seasonal topics and skips already published slugs", () => {
    const used = new Set([slugifyKeyword("când să începi pregătirea pentru medicină")]);
    const picked = pickTopics(new Date("2026-10-21T04:00:00Z"), 3, used);
    expect(picked).toHaveLength(3);
    expect(picked.every((t) => !used.has(slugifyKeyword(t.keyword)))).toBe(true);
    expect(picked[0].months).toContain(10);
  });
  it("rotates topics between days", () => {
    const a = pickTopics(new Date("2026-10-21T04:00:00Z"), 3, new Set()).map((t) => t.keyword);
    const b = pickTopics(new Date("2026-10-22T04:00:00Z"), 3, new Set()).map((t) => t.keyword);
    expect(a).not.toEqual(b);
  });
});
