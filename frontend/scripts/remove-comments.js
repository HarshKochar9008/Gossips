const fs = require('fs');
const path = require('path');
const glob = require('glob');
const strip = require('strip-comments');

const patterns = [
  'src/**/*.{ts,tsx,js,jsx}',
  '../backend/src/**/*.{ts,tsx,js,jsx}',
];

const ignore = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
];

function getLanguageFromExtension(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  if (['js', 'jsx', 'ts', 'tsx'].includes(ext)) {
    return ext;
  }
  return undefined;
}

function stripCommentsInFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const language = getLanguageFromExtension(filePath);

  const options = {};
  if (language) {
    options.language = language;
  }

  const stripped = strip(original, options);

  if (stripped !== original) {
    fs.writeFileSync(filePath, stripped, 'utf8');
    process.stdout.write(`Stripped comments from ${filePath}\n`);
  }
}

function run() {
  const files = [];

  for (const pattern of patterns) {
    const matched = glob.sync(pattern, {
      nodir: true,
      ignore,
    });
    files.push(...matched);
  }

  const uniqueFiles = Array.from(new Set(files));

  uniqueFiles.forEach((file) => {
    try {
      stripCommentsInFile(file);
    } catch (err) {
      process.stderr.write(`Failed to strip comments from ${file}: ${err.message}\n`);
    }
  });
}

run();

