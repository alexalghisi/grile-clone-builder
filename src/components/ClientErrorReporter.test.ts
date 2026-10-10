import { expect, test } from "vitest";
import { isInjectedThirdParty } from "./ClientErrorReporter";
test("x", () => {
  expect(isInjectedThirdParty("@https://grileadmitere.ro/quiz/umfst-med-bio:189:70\n@https://grileadmitere.ro/quiz/umfst-med-bio:196:363")).toBe(true);
  expect(isInjectedThirdParty("at f (https://grileadmitere.ro/assets/index-6C.js:1:2)")).toBe(false);
});
