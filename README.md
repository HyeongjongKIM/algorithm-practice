# Algorithm Practice

Simple study repo for algorithm practice.

Agent guidance: [AGENTS.md](./AGENTS.md)

## Install

```bash
npm install
```

## Scripts

```bash
npm test
npm run test:watch
npm run test:pick
npm run typecheck
npm run format
npm run format:check
npm run problem:new
```

## Structure

```txt
src/<any-path>/<problem-name>/
  README.md
  solution.ts
  solution.test.ts
```

Examples:

- `src/programmers/level-1/sum-of-divisors`
- `src/leetcode/easy/two-sum`
- `src/custom/dp/coin-change-variants`

## Add A Problem

Interactive:

```bash
npm run problem:new
```

Direct:

```bash
npm run problem:new -- <path-under-src> <problem-name>
```

Example:

```bash
npm run problem:new -- programmers/level-1 mock-problem
```

Run one test file:

```bash
npx vitest run src/programmers/level-1/sum-of-divisors/solution.test.ts
```

Pick one test file interactively:

```bash
npm run test:pick
```

`test:pick` supports both arrow keys and number input.

Each problem directory should also include a `README.md` with the problem statement, constraints, examples, and notes.
