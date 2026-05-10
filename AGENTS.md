# AGENTS

This repository is a TypeScript-based algorithm practice workspace.

## Goal

- Create, document, test, and solve individual coding problems.
- Keep one problem per directory under `src/`.

## Project Structure

```txt
src/<path>/<problem-name>/
  README.md
  solution.ts
  solution.test.ts
```

## Workflow

- For new problem setup, use `.agents/skills/problem-generator`.
- For solving or reviewing an existing problem, use `.agents/skills/problem-solving-assistant`.

## Rules

- Prefer the existing `problem:new` script over manually creating problem folders.
- Treat each problem folder `README.md` as the source of truth.
- Keep `solution.ts` focused on the solution function only.
- Use `solution.test.ts` for official examples and clear edge cases.
- Mention time and space complexity when reviewing or explaining a solution.
- Do not assume behavior that is not supported by the problem statement.

## Commands

- `npm run problem:new`
- `npm test`
- `npm run test:watch`
- `npm run test:pick`
- `npm run typecheck`
- `npm run format`
- `npm run format:check`
