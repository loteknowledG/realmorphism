import { expect, test } from "vite-plus/test";
import {
  Button,
  Card,
  InfoPane,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toggle,
  fn,
  realmorphismButtonMarkup,
  tabsTriggerVariants,
  toggleVariants,
} from "../src/index.ts";

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

test("realmorphism component exports", () => {
  expect(typeof Button).toBe("function");
  expect(typeof Card).toBe("function");
  expect(typeof InfoPane).toBe("function");
  expect(typeof Tabs).toBe("function");
  expect(typeof TabsList).toBe("function");
  expect(typeof TabsTrigger).toBe("function");
  expect(typeof TabsContent).toBe("function");
  expect(typeof Toggle).toBe("function");

  const pane = InfoPane({ children: "Details" });
  expect(pane.props.className).toContain("info-pane");
  expect(pane.props.className).toContain("bg-background/60");

  expect(tabsTriggerVariants({ variant: "rail" })).toContain("data-[state=active]");
  expect(toggleVariants()).toContain("data-[state=on]");
});
