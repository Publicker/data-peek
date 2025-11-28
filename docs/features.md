# data-peek Feature Overview

> A minimal, fast, beautiful PostgreSQL client for developers who want to quickly peek at their data.

---

## Product Summary

**data-peek** is a lightweight desktop database client designed for developers who need quick, frictionless access to their PostgreSQL databases. Unlike bloated alternatives like pgAdmin or DBeaver, data-peek focuses on speed, simplicity, and a keyboard-first experience.

**Target Audience:** Developers, data engineers, backend engineers, and anyone who needs to quickly query and explore PostgreSQL databases without the overhead of enterprise tools.

**Platforms:** macOS (Apple Silicon + Intel), Windows, Linux

---

## Key Value Propositions

| Benefit | Description |
|---------|-------------|
| **Lightning Fast** | Opens in under 2 seconds. No splash screens, no waiting. |
| **Zero Configuration** | Connect and query immediately. No complex setup required. |
| **Keyboard-First** | Power users can do everything without touching the mouse. |
| **Beautiful & Modern** | Dark and light themes with a clean, distraction-free UI. |
| **Privacy-First** | No telemetry, no tracking. Your data stays on your machine. |
| **Secure** | Connection credentials are encrypted locally. |
| **Pay Once, Own Forever** | No subscriptions. One-time purchase with 1 year of updates. |

---

## Pricing

### Free Tier
Get started at no cost:
- 2 database connections
- 50 query history items
- 3 editor tabs
- 1 schema for ER diagrams
- CSV/JSON export

### Pro License — ~~$99~~ $29 (Early Bird)
Unlock everything:
- **Unlimited** connections
- **Unlimited** query history
- **Unlimited** tabs
- **Unlimited** ER diagrams
- Inline data editing (INSERT/UPDATE/DELETE)
- Query execution plans (EXPLAIN/ANALYZE)
- 3 device activations
- 1 year of updates
- **Pay once, use forever**

### Cloud (Coming Soon)
For power users and teams:
- Everything in Pro
- Sync connections across devices
- Cloud-saved queries
- Team sharing
- ~$5-8/month

---

## Feature List

### Connection Management

| Feature | Description |
|---------|-------------|
| **Quick Connection Setup** | Add connections with host, port, database, user, and password — or paste a connection string |
| **Connection String Parsing** | Paste any PostgreSQL connection URL and auto-fill all fields |
| **Test Before Save** | Verify connections work before adding them |
| **Encrypted Storage** | Credentials stored securely with encryption |
| **SSL Support** | Connect to SSL-enabled databases |
| **Connection Switcher** | Quickly switch between multiple database connections |
| **Edit & Delete** | Manage saved connections with ease |

### Query Editor

| Feature | Description |
|---------|-------------|
| **Monaco Editor** | Same editor engine that powers VS Code |
| **SQL Syntax Highlighting** | Full SQL syntax highlighting with PostgreSQL support |
| **Smart Autocomplete** | Schema-aware suggestions for tables, columns, and SQL keywords |
| **Multi-Tab Support** | Work on multiple queries simultaneously with independent tabs |
| **Query Formatting** | Auto-format SQL with `Cmd/Ctrl + Shift + F` |
| **Run Query** | Execute with `Cmd/Ctrl + Enter` |
| **Collapsible Editor** | Minimize the editor to focus on results |

### Results Viewer

| Feature | Description |
|---------|-------------|
| **Data Table View** | View results in a clean, sortable table |
| **Data Type Indicators** | Color-coded badges showing column types |
| **Query Metrics** | See row count and query execution time |
| **Pagination** | Navigate large result sets with customizable page sizes |
| **Copy Cell** | Click any cell to copy its value |
| **Copy Row as JSON** | Export individual rows as JSON objects |
| **Export to CSV** | Download results as CSV files |
| **Export to JSON** | Download results as JSON files |
| **NULL Styling** | Clear visual distinction for NULL values |
| **Foreign Key Navigation** | Click FK cells to view related records |
| **JSON/JSONB Viewer** | Expand and inspect JSON columns inline |

### Schema Explorer

| Feature | Description |
|---------|-------------|
| **Tree View Navigation** | Browse schemas, tables, and views hierarchically |
| **Column Details** | See column names, data types, and constraints |
| **Primary Key Indicators** | Visual markers for primary key columns |
| **Nullable Indicators** | See which columns allow NULL values |
| **Foreign Key Display** | View foreign key relationships |
| **Table Search** | Filter tables by name with instant search |
| **Click to Query** | Click any table to generate a SELECT query |
| **Schema Refresh** | Reload schema after database changes |

### Query History

| Feature | Description |
|---------|-------------|
| **Auto-Save** | Every executed query is automatically saved |
| **Persistent Storage** | History survives app restarts |
| **Query Metadata** | See execution time, row count, and status for each query |
| **Quick Load** | Click any history item to load it into the editor |
| **Copy to Clipboard** | Copy previous queries without loading |
| **Clear History** | Remove all or individual history items |
| **Query Type Badges** | Visual indicators for SELECT, INSERT, UPDATE, DELETE |
| **Relative Timestamps** | "5 minutes ago", "yesterday", etc. |

### Inline Data Editing

| Feature | Description |
|---------|-------------|
| **Edit Cells** | Double-click to modify cell values directly |
| **Add Rows** | Insert new records with a visual form |
| **Delete Rows** | Remove records with confirmation |
| **SQL Preview** | Review generated SQL before executing changes |
| **Batch Operations** | Queue multiple changes before committing |
| **Discard Changes** | Undo pending edits before saving |
| **Type-Safe Editing** | Input validation based on column data types |

### ER Diagram Visualization

| Feature | Description |
|---------|-------------|
| **Visual Schema Map** | See your database structure as an interactive diagram |
| **Table Nodes** | Each table displays all columns with types |
| **Relationship Lines** | Foreign key connections visualized as links |
| **Primary Key Highlights** | Yellow indicators for PK columns |
| **Foreign Key Highlights** | Blue indicators for FK columns |
| **Pan & Zoom** | Navigate large schemas with ease |
| **Mini Map** | Overview navigation for complex databases |

### Query Execution Plans

| Feature | Description |
|---------|-------------|
| **EXPLAIN Visualization** | See query execution plans in a visual tree |
| **Node Type Coloring** | Color-coded operations (scans, joins, sorts) |
| **Cost Analysis** | View estimated vs actual costs |
| **Performance Metrics** | Execution time breakdown by operation |
| **Buffer Statistics** | I/O and memory usage details |
| **Expandable Nodes** | Drill into plan details |

### User Interface

| Feature | Description |
|---------|-------------|
| **Dark Mode** | Easy on the eyes for long coding sessions |
| **Light Mode** | Clean, bright interface when you prefer it |
| **System Preference** | Automatically match your OS theme |
| **Resizable Panels** | Drag to resize sidebar and editor |
| **Collapsible Sidebar** | Maximize workspace when needed |
| **Loading States** | Clear feedback during operations |
| **Error Handling** | Helpful error messages with details |
| **Empty States** | Guided prompts when there's no data |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Execute query |
| `Cmd/Ctrl + Shift + F` | Format SQL |
| `Cmd/Ctrl + P` | Open connection picker |
| `Cmd/Ctrl + S` | Save query to file |
| `Cmd/Ctrl + O` | Open query from file |
| `Cmd/Ctrl + Shift + 1-9` | Switch between connections |

---

## Technical Highlights

| Aspect | Details |
|--------|---------|
| **Framework** | Electron with React 19 |
| **Editor** | Monaco (VS Code engine) |
| **Database Driver** | Native PostgreSQL (pg) |
| **Local Storage** | SQLite for history and settings |
| **Security** | Encrypted credential storage |
| **Build Targets** | macOS DMG, Windows exe/msi, Linux AppImage |

---

## What data-peek is NOT

To set clear expectations:

- **Not a database admin tool** — Focus is on querying and exploring, not server management
- **Not a data migration tool** — No import/export of entire databases
- **Not multi-database** — PostgreSQL only (MySQL/SQLite coming in future versions)
- **Not enterprise software** — Built for individual developers (team features coming with Cloud tier)

---

## Comparison with Alternatives

| Feature | data-peek | pgAdmin | DBeaver | TablePlus |
|---------|-----------|---------|---------|-----------|
| Startup Time | < 2s | 5-10s | 10-15s | 2-3s |
| Memory Usage | Low | High | Very High | Low |
| Learning Curve | Minimal | Steep | Steep | Minimal |
| Price | Free + $29 Pro | Free | Free/Paid | $69 |
| PostgreSQL Focus | Yes | Yes | No | No |
| ER Diagrams | Yes | Yes | Yes | Yes |
| Inline Editing | Yes | Yes | Yes | Yes |
| Query Plans | Yes | Yes | Yes | Limited |
| Modern UI | Yes | No | No | Yes |

---

## Coming Soon

Features planned for future releases:

- MySQL and SQLite support
- SSH tunnel connections
- Saved queries / snippets library
- Query cancellation
- CSV data import
- Connection groups/folders
- **Cloud Sync** — Sync connections and saved queries across devices
- **Team Features** — Share queries and connections with your team

---

## Screenshots

*[Add screenshots here]*

- Connection dialog
- Query editor with results
- Schema explorer tree
- ER diagram view
- Query execution plan
- Inline data editing
- Dark/Light theme comparison

---

## One-Liner Descriptions

For various marketing contexts:

**Tagline:**
> Peek at your data. Fast.

**Short (10 words):**
> A fast, beautiful PostgreSQL client for developers who value simplicity.

**Medium (25 words):**
> data-peek is a lightweight PostgreSQL desktop client with a modern UI, keyboard shortcuts, and features like ER diagrams and query plans — without the bloat.

**Long (50 words):**
> data-peek is the PostgreSQL client developers actually want to use. Lightning-fast startup, Monaco-powered SQL editor, visual ER diagrams, query execution plans, inline data editing, and a beautiful dark/light UI. No telemetry, no subscriptions, no bloat. Pay once, own forever. Available for macOS, Windows, and Linux.

---

*Document generated: November 2025*
