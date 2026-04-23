# realmorphism

A TypeScript UI library for mechanical, high-contrast controls.

## GitHub Pages (demo)

The Vite demo is built with `GITHUB_PAGES=true` so asset URLs use `/<repository-name>/`.

1. Push this workflow (`.github/workflows/deploy-github-pages.yml`) to GitHub on the default branch (`main` or `master`).
2. **Repository → Settings → Pages → Build and deployment → Source:** choose **GitHub Actions**.
3. Open **Actions**, run **Deploy GitHub Pages**, or push to `main` / `master`.
4. After deploy, the site is at `https://<username>.github.io/<repository-name>/` (the workflow sets `VITE_BASE_PATH` from the repo name).

If the path segment must differ from the repository name, edit `VITE_BASE_PATH` in `.github/workflows/deploy-github-pages.yml` (slashes are normalized in `vite.config.ts`).

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
