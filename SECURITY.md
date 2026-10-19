# Reporting a security issue

For a suspected vulnerability, use **Report a vulnerability** in this repository's Security tab when available. Avoid opening a public issue containing exploit details or sensitive spreadsheet contents.

Include the affected commit, browser, operating system, reproduction steps and the expected impact. Use a minimal synthetic workbook or CSV, with no customer data, credentials or personal information.

The current default branch is the maintained version. Older snapshots do not receive separate security backports. This is an independent project; no response-time guarantee is offered.

## Application boundaries

Sheet Diff processes spreadsheets in the browser. It has no server-side spreadsheet storage or upload API. Local processing does not make a malicious or exceptionally large input harmless: file parsers and the browser still have resource limits. Review file origins and keep the browser current.

Bundled ExcelJS and fonts retain their upstream licenses. Dependency changes should preserve the committed lockfile, notices and local-processing behavior.
