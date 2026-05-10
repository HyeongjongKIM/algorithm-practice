import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

function printUsage() {
  console.log('Usage: npm run problem:new -- <path-under-src> <problem-name>');
  console.log('Interactive mode: npm run problem:new');
}

function normalizeProblemName(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeRelativePath(value) {
  const normalized = value
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '');

  if (!normalized) {
    return '';
  }

  const segments = normalized
    .split('/')
    .map((segment) =>
      segment
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    )
    .filter(Boolean);

  return segments.join('/');
}

function isSafeRelativePath(value) {
  if (!value) {
    return false;
  }

  if (path.isAbsolute(value)) {
    return false;
  }

  return !value.split('/').some((segment) => segment === '..');
}

function buildSources(problemName) {
  const readmeSource = [
    `# ${problemName}`,
    '',
    '## Source',
    '',
    '- Platform: ',
    '- Link: ',
    '',
    '## Problem',
    '',
    '> Fill in the problem statement here.',
    '',
    '## Constraints',
    '',
    '- ',
    '',
    '## Examples',
    '',
    '### Example 1',
    '',
    '- Input: ',
    '- Output: ',
    '- Explanation: ',
    '',
    '## Notes',
    '',
    '- ',
    ''
  ].join('\n');

  const solutionSource = [
    'export function solution(): void {',
    "  throw new Error('Not implemented');",
    '}',
    ''
  ].join('\n');

  const testSource = [
    "import { describe, expect, it } from 'vitest';",
    '',
    "import { solution } from './solution';",
    '',
    `describe('${problemName}', () => {`,
    "  it('adds example-based assertions after the README is filled in', () => {",
    '    expect(solution).toBeTypeOf(\'function\');',
    '  });',
    '});',
    ''
  ].join('\n');

  return { readmeSource, solutionSource, testSource };
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function promptUntilValid(
  rl,
  question,
  validate,
  transform = (value) => value
) {
  while (true) {
    const answer = transform(await rl.question(question));

    if (validate(answer)) {
      return answer;
    }

    console.log('Invalid input. Please try again.');
  }
}

async function getInteractiveAnswers() {
  const rl = createInterface({ input, output });

  try {
    console.log('Create a new algorithm problem');

    const relativePath = await promptUntilValid(
      rl,
      'Path under src (examples: programmers/level-1, leetcode/easy, custom/dp): ',
      (value) =>
        isSafeRelativePath(value) && normalizeRelativePath(value).length > 0,
      (value) => value.trim()
    );

    const rawName = await promptUntilValid(
      rl,
      'Problem name (slug or plain English title): ',
      (value) => normalizeProblemName(value).length > 0,
      (value) => value.trim()
    );

    return {
      relativePath: normalizeRelativePath(relativePath),
      problemName: normalizeProblemName(rawName)
    };
  } finally {
    rl.close();
  }
}

function getCliArgs() {
  const [, , relativePathArg, ...nameParts] = process.argv;
  const problemNameArg = nameParts.join(' ').trim();

  if (!relativePathArg && !problemNameArg) {
    return null;
  }

  const relativePath = normalizeRelativePath(relativePathArg ?? '');
  const problemName = normalizeProblemName(problemNameArg);

  if (!relativePathArg || !problemName) {
    printUsage();
    process.exit(1);
  }

  if (!isSafeRelativePath(relativePathArg) || !relativePath) {
    console.error(`Invalid path under src: ${relativePathArg}`);
    process.exit(1);
  }

  return { relativePath, problemName };
}

async function main() {
  const answers = getCliArgs() ?? (await getInteractiveAnswers());
  const { relativePath, problemName } = answers;

  if (!problemName) {
    console.error('Problem name cannot be empty after normalization.');
    process.exit(1);
  }

  const rootDir = process.cwd();
  const problemDir = path.join(rootDir, 'src', relativePath, problemName);

  if (await pathExists(problemDir)) {
    console.error(
      `Problem directory already exists: ${path.relative(rootDir, problemDir)}`
    );
    process.exit(1);
  }

  const { readmeSource, solutionSource, testSource } = buildSources(problemName);

  await mkdir(problemDir, { recursive: true });
  await writeFile(path.join(problemDir, 'README.md'), readmeSource, 'utf8');
  await writeFile(path.join(problemDir, 'solution.ts'), solutionSource, 'utf8');
  await writeFile(
    path.join(problemDir, 'solution.test.ts'),
    testSource,
    'utf8'
  );

  console.log(`Created ${path.relative(rootDir, problemDir)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
