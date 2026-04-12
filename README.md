# realmorphism

A TypeScript UI library for mechanical, high-contrast controls.

## Development

- Install dependencies:

```bash
vp install
```

- Run the shadcn demo:

```bash
vp run demo
```

- Run the unit tests:

```bash
vp test
```

- Build the library:

```bash
vp pack
```

The demo uses shadcn/ui source components under `src/components/ui/` and shared Tailwind tokens in `src/styles.css`.

## Design References

- [Documentation index](/F:/dev/realmorphism/docs/INDEX.md)
- [Control briefing](/F:/dev/realmorphism/docs/CONTROL_BRIEFING.md)
- [Design notes](/F:/dev/realmorphism/docs/DESIGN.md)
- [Saved control references](/F:/dev/realmorphism/assets/controls)

## Library API

Import the shared components directly from `realmorphism`:

```ts
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  InfoPane,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toggle,
  defineRealmorphismButton,
} from "realmorphism";
```

The package also exports the `realmorphism-button` custom element helpers for web component usage.
