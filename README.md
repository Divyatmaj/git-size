# gsize

[![npm](https://img.shields.io/npm/v/cli-git-size)](https://www.npmjs.com/package/cli-git-size)
[![CI](https://github.com/Divyatmaj/git-size/actions/workflows/ci.yml/badge.svg)](https://github.com/Divyatmaj/git-size/actions/workflows/ci.yml)

A small Node.js CLI that shows which files are taking up space in your
project. Inside a git repository it respects `.gitignore`, so you see the
size of what you actually built, not your build output or dependencies.

## Installation

```bash
npm install -g cli-git-size
```

Requires Node.js 22.12 or newer. The command is `gsize`.

## Usage

```bash
gsize [options] [path]
```

With no options, `gsize` lists every file in the current folder, largest
first. Pass a path to scan a different folder:

```bash
gsize                 # current folder, largest first
gsize ./src           # a different folder
gsize -f 10           # the 10 largest files
gsize -l 5            # the 5 smallest files
gsize -s -f 10        # the 10 largest files, listed smallest first
gsize -t              # total size
gsize -t -f 10        # total size of the 10 largest files
gsize -j -f 5 | jq    # JSON output
gsize --max-depth 1   # only files at the top level
```

## Options

| Option              | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `-f, --first [n]`   | Show the N largest files                                 |
| `-l, --last [n]`    | Show the N smallest files                                |
| `-s, --sortAsc`     | Order the output smallest first                          |
| `-d, --sortDesc`    | Order the output largest first (default)                 |
| `-t, --totSize`     | Show the total size of the selected files                |
| `-j, --json`        | Print the output as JSON                                 |
| `--max-depth <n>`   | Only look N folder levels deep (`1` = top level only)    |
| `--no-gitignore`    | Scan every file, ignoring `.gitignore` rules             |
| `-v, --version`     | Print the version                                        |
| `-h, --help`        | Show help                                                |

Options can be combined: `-f`/`-l` choose which files, `-s`/`-d` choose
the order, and `-t` and `-j` apply to that selection. `-f` and `-l` cannot
be used together, nor can `-s` and `-d`.

Warnings (for example, asking for more files than exist) go to stderr, so
`--json` output is always valid JSON.

### What gets scanned

- Inside a git repository, files are listed with
  `git ls-files --cached --others --exclude-standard`: tracked files plus
  untracked files that `.gitignore` does not exclude.
- Outside a git repository, or with `--no-gitignore`, the folder is
  walked directly.
- `.git`, `.gitignore` and `node_modules` are always skipped, as are
  symbolic links.

## Example

```text
$ gsize -f 5
┌──────┬────────────────────────────────────┬──────────────┐
│ No.  │ File                               │ Size         │
├──────┼────────────────────────────────────┼──────────────┤
│ 1    │ package-lock.json                  │ 5.82 KB      │
├──────┼────────────────────────────────────┼──────────────┤
│ 2    │ README.md                          │ 4.1 KB       │
├──────┼────────────────────────────────────┼──────────────┤
│ 3    │ cli.js                             │ 3.56 KB      │
├──────┼────────────────────────────────────┼──────────────┤
│ 4    │ Scanner.js                         │ 3.13 KB      │
├──────┼────────────────────────────────────┼──────────────┤
│ 5    │ Formatter.js                       │ 1.77 KB      │
└──────┴────────────────────────────────────┴──────────────┘
```

Sizes are green under 1 MB, yellow under 10 MB, and red above that.

## Using it as a library

```js
const { scanDirectory, getTopN, calculateTotalSize, formatBytes } = require("cli-git-size");

const files = scanDirectory("./my-project", { maxDepth: 3 });
console.log(getTopN(files, 5));
console.log(formatBytes(calculateTotalSize(files)));
```

| Export                                  | Description                                                       |
| --------------------------------------- | ----------------------------------------------------------------- |
| `scanDirectory(dir, options?)`          | Returns `[{ path, size }]`. Options: `gitignore` (default `true`), `maxDepth` |
| `sortBySizeA(files)` / `sortBySizeD(files)` | Sorted copy, smallest / largest first                         |
| `getTopN(files, n)` / `getBottomN(files, n)` | The N largest / smallest files                               |
| `calculateTotalSize(files)`             | Sum of all sizes in bytes                                         |
| `formatBytes(bytes)`                    | Human-readable size, such as `2.4 MB`                             |
| `mkTable(files, { width? })`            | The terminal table as a string                                    |
| `formatJSON(value)`                     | Pretty-printed JSON                                               |

None of these functions modify the array you pass in. `Scanner`,
`Analyzer` and `Formatter` can also be required individually, for example
`require("cli-git-size/Scanner")`.

## Project structure

```text
cli.js        the gsize command (argument parsing and output)
lib.js        library entry point
Scanner.js    finds files and their sizes
Analyzer.js   sorting, top/bottom N, totals
Formatter.js  table, colours, JSON, byte formatting
test/         tests (node:test)
```

## Development

```bash
npm install
npm test
npm link      # makes your local copy available as `gsize`
```

## Releasing

CI runs the tests on every push and pull request. To publish a new
version to npm:

```bash
npm version patch   # or minor / major; creates a commit and a vX.Y.Z tag
git push --follow-tags
```

Pushing the tag runs the tests and then publishes to npm. This needs an
`NPM_TOKEN` secret in the GitHub repository settings.

## License

ISC. See [LICENSE](LICENSE).
