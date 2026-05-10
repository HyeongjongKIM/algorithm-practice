---
name: problem-solving-assistant
description: Use when solving or reviewing algorithm problems in this repository. Focus on understanding the problem folder `README.md`, implementing `solution.ts`, validating with `solution.test.ts`, and checking correctness, edge cases, and complexity.
---

# Problem Solving Assistant

Use this skill for work inside an existing problem folder.

## Workflow

1. Read the problem folder `README.md` first.
2. Review `solution.test.ts` to understand examples and expected behavior.
3. Implement or revise `solution.ts`.
4. Run the relevant tests.
5. Check correctness, edge cases, and time/space complexity.

## Review Checklist

- Does the implementation match the problem statement and constraints?
- Are empty inputs, minimum sizes, duplicates, ordering, or boundary values handled when relevant?
- Is the algorithm unnecessarily complex for the stated constraints?
- Does the function mutate input data only if the problem allows it?
- Do the tests cover the documented examples and the most likely edge cases?

## Rules

- Treat `README.md` as the contract for the problem.
- Prefer clear, direct implementations over clever but opaque ones.
- Mention time and space complexity when discussing or reviewing a solution.
- If the current tests are too weak, strengthen `solution.test.ts` before claiming the solution is done.
