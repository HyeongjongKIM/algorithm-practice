---
name: problem-generator
description: Use when creating a new algorithm practice problem in this repository. Run the existing `npm run problem:new -- <path-under-src> <problem-name>` script first, then complete the generated problem folder by writing the problem statement into `README.md` and turning `solution.test.ts` into real example and edge-case tests.
---

# Problem Generator

Use this skill only for new problem setup in this repository.

## Workflow

1. Run `npm run problem:new -- <path-under-src> <problem-name>`.
2. Confirm the problem folder now contains `README.md`, `solution.ts`, and `solution.test.ts`.
3. Fill `README.md` with the actual problem title, source, link, statement, constraints, examples, and notes.
4. Replace the placeholder test with concrete tests from the examples in `README.md`.
5. Add a small number of meaningful edge cases when the problem definition makes them clear.

## Rules

- Prefer the existing script over manually creating folders or files.
- Keep `solution.ts` as starter code only. Do not implement the algorithm during problem generation.
- Use `README.md` as the source of truth for examples and constraints before writing tests.
- Do not invent problem requirements that are not stated by the user or source.
- If the user gives only a link or title, summarize the problem in `README.md` before writing tests.

## Test Guidance

- Start with official example inputs and outputs.
- Add edge cases only when expected behavior is clear.
- Keep test names short and problem-focused.
- Avoid overfitting tests to one implementation approach.
