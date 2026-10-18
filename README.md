# Sheet Diff

Browser-local Excel and CSV comparison by Vitor Rodi. Static HTML, CSS, JavaScript modules and ExcelJS (MIT).

Run `npm install`, copy `node_modules/exceljs/dist/exceljs.min.js` to `dist/vendor/exceljs.min.js`, and serve `dist` with any static HTTP server. Run `npm test` for comparison tests.

Matches by a shared unique identifier, independently of row/column order. Detects added/removed columns. Duplicate and blank identifiers stop comparison. Exact stringified values are compared (case and whitespace sensitive); identifier whitespace is trimmed. Excel dates use ISO strings; formulas require cached results. Formatting, comments, macros and formulas themselves are not compared. CSV is UTF-8 and accepts comma, semicolon and tab delimiters. XLSX/CSV only, 5 MB/file, 10,000 rows and 100 columns per worksheet. Comparison export contains all changed records regardless of the active view. Data is never sent to a server.
