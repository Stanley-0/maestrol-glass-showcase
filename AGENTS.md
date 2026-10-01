<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Tests: unit/a11y tests use Vitest + Testing Library (`bun run test`, files `src/**/*.test.tsx`, route-dir tests prefixed `-`); browser tests use Playwright in `e2e/` (`bun run test:e2e`) against the dev server — keeps fast DOM checks separate from real-browser checks.
