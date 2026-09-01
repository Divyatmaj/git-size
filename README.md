# gsize

A simple Node.js CLI tool that scans a project directory and helps you
understand which files are taking up space.

## Features

-   Scan project files recursively
-   Ignore `.git` and `.gitignore`
-   Sort files by size
-   Find the smallest N files
-   Find the largest N files
-   Calculate total project size
-   Display results in a terminal table
-   Format file sizes as Bytes, KB, MB, GB, etc.
-   Output data as JSON
-   Colored terminal output using Chalk

## Installation

Install the package globally with npm:

``` bash
npm install -g cli-git-size
```

After installation, the CLI command is:

``` bash
gsize
```

## Usage

Run the command from the directory/project you want to analyze:

``` bash
gsize
```

### Show help

``` bash
gsize --help
```

### Sort by size --- ascending

``` bash
gsize -s
```

or:

``` bash
gsize --sortAsc
```

### Sort by size --- descending

``` bash
gsize -d
```

or:

``` bash
gsize --sortDesc
```

### Show the smallest N files

``` bash
gsize -l 5
```

or:

``` bash
gsize --last 5
```

If no number is provided, the command uses all scanned files.

### Show the largest N files

``` bash
gsize -f 5
```

or:

``` bash
gsize --first 5
```

If no number is provided, the command uses all scanned files.

### Show total project size

``` bash
gsize -t
```

The result is displayed using a human-readable size such as `10.94 KB`,
`2.4 MB`, etc.

### Output as JSON

``` bash
gsize -j
```

or:

``` bash
gsize --json
```

## Options

  Option              Description
  ------------------- -------------------------------------------
  `-s, --sortAsc`     Sort files by size in ascending order
  `-d, --sortDesc`    Sort files by size in descending order
  `-l, --last [n]`    Show the smallest N files
  `-f, --first [n]`   Show the largest N files
  `-t, --totSize`     Show the total size of the scanned folder
  `-j, --json`        Show the file data in JSON format
  `-h, --help`        Show help information

## Example

Running:

``` bash
gsize -f 5
```

can produce a table similar to:

``` text
┌─────┬────────────────────┬─────────┐
│ No. │ File               │ Size    │
├─────┼────────────────────┼─────────┤
│ 1   │ package-lock.json  │ 5.82 KB │
│ 2   │ index.js           │ 1.71 KB │
│ 3   │ Formatter.js       │ 1.44 KB │
│ 4   │ Analyzer.js        │ 1.01 KB │
│ 5   │ Scanner.js         │ 735 B   │
└─────┴────────────────────┴─────────┘
```

## Project Structure

``` text
cli-git-size/
├── index.js
├── Scanner.js
├── Analyzer.js
├── Formatter.js
├── package.json
├── package-lock.json
└── README.md
```

### `index.js`

The CLI entry point.

Responsible for:

-   Defining Commander options
-   Reading user input
-   Calling the scanner
-   Calling analyzer functions
-   Passing results to the formatter
-   Printing the final output

### `Scanner.js`

Responsible for recursively scanning directories and collecting:

``` js
{
    path: "path/to/file",
    size: 1234
}
```

It currently ignores:

``` text
.git
.gitignore
```

### `Analyzer.js`

Contains the analysis functions:

-   `sortBySizeA(arr)` --- sorts files by size in ascending order
-   `sortBySizeD(arr)` --- sorts files by size in descending order
-   `getBottomN(arr, n)` --- returns the smallest N files
-   `getBiglN(arr, n)` --- returns the largest N files
-   `calculateTotalSize(arr)` --- calculates the total size of all
    scanned files

### `Formatter.js`

Responsible for converting analyzed data into user-friendly terminal
output.

Current formatter functionality includes:

-   `formatBytes(bytes)` --- converts bytes into readable units
-   `formatSize(arr)` --- formats file-size values
-   `formatJSON(arr)` --- prepares JSON output
-   `mkTable(arr)` --- creates the terminal table
-   `colourSize(...)` --- adds color to size output

## Architecture

The project follows a simple pipeline:

``` text
User
  │
  ▼
index.js
  │
  ▼
Scanner.js
  │
  │  [{ path, size }, ...]
  ▼
Analyzer.js
  │
  │  sorted / filtered / calculated data
  ▼
Formatter.js
  │
  ▼
Terminal Output
```

This separation keeps scanning, analysis, and presentation logic
independent.

## Dependencies

The project currently uses:

-   [Commander](https://www.npmjs.com/package/commander) --- CLI
    argument parsing
-   [cli-table3](https://www.npmjs.com/package/cli-table3) --- terminal
    tables
-   [Chalk](https://www.npmjs.com/package/chalk) --- terminal colors

## Development

Clone the repository and install dependencies:

``` bash
npm install
```

For local CLI testing, link the package:

``` bash
npm link
```

Then run:

``` bash
gsize --help
```

After making changes, you can test the local linked version without
publishing a new npm version.

## Publishing

To create a new patch version:

``` bash
npm version patch
```

Then publish:

``` bash
npm publish
```

## Future Improvements

Possible future additions:

-   Folder-size analysis
-   Combining multiple options
-   Better error handling
-   Progress indicators for large projects
-   Configurable ignored files/directories
-   More output formats
-   Performance improvements for very large projects

## License

ISC

## Author

DJ
# git-size
