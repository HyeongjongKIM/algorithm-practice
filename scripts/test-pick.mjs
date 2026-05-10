import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { stdin as input, stdout as output } from 'node:process';
import * as readline from 'node:readline';
import { createInterface } from 'node:readline/promises';

const TEST_FILE_SUFFIX = '.test.ts';
const MODE_OPTIONS = [
  { label: 'Run once', value: 'run' },
  { label: 'Watch mode', value: 'watch' }
];

async function collectTestFiles(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectTestFiles(entryPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(TEST_FILE_SUFFIX)) {
      files.push(entryPath);
    }
  }

  return files;
}

async function promptForIndex(rl, question, maxIndex) {
  while (true) {
    const answer = (await rl.question(question)).trim();

    if (answer === '') {
      console.log('Selection cancelled.');
      process.exit(0);
    }

    const selectedIndex = Number(answer);

    if (
      Number.isInteger(selectedIndex) &&
      selectedIndex >= 1 &&
      selectedIndex <= maxIndex
    ) {
      return selectedIndex - 1;
    }

    console.log('Invalid selection. Please enter a valid number.');
  }
}

function clearMenu(linesToClear) {
  if (!output.isTTY) {
    return;
  }

  for (let index = 0; index < linesToClear; index += 1) {
    readline.moveCursor(output, 0, -1);
    readline.clearLine(output, 0);
  }
}

function renderMenu({ title, items, selectedIndex, typedDigits }) {
  console.log(title);
  items.forEach((item, index) => {
    const prefix = index === selectedIndex ? '>' : ' ';
    console.log(`${prefix} ${index + 1}. ${item}`);
  });
  console.log(
    `Use arrow keys or type a number, then press Enter${typedDigits ? ` [${typedDigits}]` : ''}. Blank or Esc cancels.`
  );
}

async function selectIndex({ title, items }) {
  if (!input.isTTY || !output.isTTY) {
    const rl = createInterface({ input, output });

    try {
      console.log(title);
      items.forEach((item, index) => {
        console.log(`${index + 1}. ${item}`);
      });

      return await promptForIndex(
        rl,
        'Enter a number (blank to cancel): ',
        items.length
      );
    } finally {
      rl.close();
    }
  }

  return await new Promise((resolve) => {
    let selectedIndex = 0;
    let typedDigits = '';
    const linesToClear = items.length + 2;

    const cleanup = () => {
      input.setRawMode(false);
      input.pause();
      input.removeListener('data', handleKeypress);
    };

    const redraw = () => {
      clearMenu(linesToClear);
      renderMenu({ title, items, selectedIndex, typedDigits });
    };

    const handleKeypress = (chunk) => {
      const key = chunk.toString('utf8');

      if (key === '\u0003' || key === '\u001b') {
        cleanup();
        console.log('Selection cancelled.');
        process.exit(0);
      }

      if (key === '\r' || key === '\n') {
        if (typedDigits) {
          const numericIndex = Number(typedDigits) - 1;
          if (numericIndex >= 0 && numericIndex < items.length) {
            selectedIndex = numericIndex;
          } else {
            typedDigits = '';
            redraw();
            return;
          }
        }

        cleanup();
        clearMenu(linesToClear);
        resolve(selectedIndex);
        return;
      }

      if (key === '\u007f') {
        typedDigits = typedDigits.slice(0, -1);
        redraw();
        return;
      }

      if (key === '\u001b[A') {
        typedDigits = '';
        selectedIndex =
          selectedIndex === 0 ? items.length - 1 : selectedIndex - 1;
        redraw();
        return;
      }

      if (key === '\u001b[B') {
        typedDigits = '';
        selectedIndex =
          selectedIndex === items.length - 1 ? 0 : selectedIndex + 1;
        redraw();
        return;
      }

      if (/^\d$/.test(key)) {
        typedDigits += key;
        const numericIndex = Number(typedDigits) - 1;
        if (numericIndex >= 0 && numericIndex < items.length) {
          selectedIndex = numericIndex;
        }
        redraw();
      }
    };

    input.setRawMode(true);
    input.resume();
    input.on('data', handleKeypress);
    renderMenu({ title, items, selectedIndex, typedDigits });
  });
}

function runVitest({ filePath, mode, rootDir }) {
  const relativeFilePath = path.relative(rootDir, filePath);
  const args =
    mode === 'run'
      ? ['vitest', 'run', relativeFilePath]
      : ['vitest', 'watch', relativeFilePath];

  const child = spawn('npx', args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  child.on('exit', (code) => {
    process.exit(code ?? 0);
  });

  child.on('error', (error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

async function main() {
  const rootDir = process.cwd();
  const srcDir = path.join(rootDir, 'src');
  const testFiles = (await collectTestFiles(srcDir)).sort((left, right) =>
    left.localeCompare(right)
  );

  if (testFiles.length === 0) {
    console.log('No test files found under src/.');
    process.exit(1);
  }

  const relativeTestFiles = testFiles.map((filePath) =>
    path.relative(rootDir, filePath)
  );

  if (relativeTestFiles.length === 1) {
    console.log(`Selected test file: ${relativeTestFiles[0]}`);
  }

  const selectedFileIndex =
    relativeTestFiles.length === 1
      ? 0
      : await selectIndex({
          title: 'Select a test file:',
          items: relativeTestFiles
        });

  const selectedModeIndex = await selectIndex({
    title: 'Choose mode:',
    items: MODE_OPTIONS.map((option) => option.label)
  });

  const selectedFile = testFiles[selectedFileIndex];
  const selectedMode = MODE_OPTIONS[selectedModeIndex];

  console.log(
    `Running ${relativeTestFiles[selectedFileIndex]} in ${selectedMode.label.toLowerCase()}`
  );
  runVitest({ filePath: selectedFile, mode: selectedMode.value, rootDir });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
