import { expect, test } from "vite-plus/test";
import { fn, realmorphismButtonMarkup } from "../src/index.ts";

test("fn", () => {
  expect(fn()).toBe("Hello, tsdown!");
});

test("realmorphism button markup", () => {
  const markup = realmorphismButtonMarkup({
    label: "Push me",
    active: true,
    angle: -7,
  });

  expect(markup).toContain("realmorphism-button");
  expect(markup).toContain("Push me");
  expect(markup).toContain("active");
  expect(markup).toContain("--realmorphism-angle: -7deg");
});
