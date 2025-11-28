# Table Designer Feature - Implementation Plan

## Overview

This plan outlines the implementation of a comprehensive Table Designer feature for data-peek, enabling users to create new tables and modify existing tables through a dedicated tab interface with full PostgreSQL feature support.

## Scope

- **Create Table**: Full-featured table creation with columns, constraints, indexes
- **Edit Table (ALTER TABLE)**: Add/drop/rename columns, modify types, manage constraints and indexes
- **PostgreSQL Full Features**: Sequences, partitioning, inheritance, custom types, CHECK constraints, UNIQUE constraints

---

## Phase 1: Shared Types & Data Models

### File: `packages/shared/src/index.ts`

Add new types for DDL operations:

```typescript
// PostgreSQL data types for dropdown
export type PostgresDataType =
  | 'smallint' | 'integer' | 'bigint' | 'serial' | 'bigserial'
  | 'numeric' | 'real' | 'double precision' | 'money'
  | 'char' | 'varchar' | 'text'
  | 'bytea'
  | 'timestamp' | 'timestamptz' | 'date' | 'time' | 'timetz' | 'interval'
  | 'boolean'
  | 'uuid'
  | 'json' | 'jsonb'
  | 'xml'
  | 'point' | 'line' | 'lseg' | 'box' | 'path' | 'polygon' | 'circle'
  | 'cidr' | 'inet' | 'macaddr'
  | 'int4range' | 'int8range' | 'numrange' | 'tsrange' | 'tstzrange' | 'daterange'
  | 'custom' // For custom/enum types

// Column definition for table designer
export interface ColumnDefinition {
  id: string // Client-side tracking
  name: string
  dataType: PostgresDataType | string
  length?: number // For varchar(n), char(n)
  precision?: number // For numeric(p,s)
  scale?: number
  isNullable: boolean
  isPrimaryKey: boolean
  isUnique: boolean
  defaultValue?: string
  defaultType?: 'value' | 'expression' | 'sequence'
  sequenceName?: string // For nextval('sequence')
  checkConstraint?: string
  comment?: string
  collation?: string
  isArray?: boolean // For array types like text[]
}

// Constraint types
export type ConstraintType = 'primary_key' | 'foreign_key' | 'unique' | 'check' | 'exclude'

export interface ConstraintDefinition {
  id: string
  name?: string // Optional, auto-generated if not provided
  type: ConstraintType
  columns: string[]
  // Foreign key specific
  referencedSchema?: string
  referencedTable?: string
  referencedColumns?: string[]
  onUpdate?: 'NO ACTION' | 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'SET DEFAULT'
  onDelete?: 'NO ACTION' | 'RESTRICT' | 'CASCADE' | 'SET NULL' | 'SET DEFAULT'
  // Check constraint specific
  checkExpression?: string
  // Exclude constraint specific (advanced)
  excludeElements?: Array<{ column: string; operator: string }>
  excludeUsing?: 'btree' | 'gist' | 'gin' | 'hash'
}

// Index definition
export interface IndexDefinition {
  id: string
  name?: string
  columns: Array<{
    name: string
    order?: 'ASC' | 'DESC'
    nullsPosition?: 'FIRST' | 'LAST'
  }>
  isUnique: boolean
  method?: 'btree' | 'hash' | 'gist' | 'gin' | 'spgist' | 'brin'
  where?: string // Partial index condition
  include?: string[] // INCLUDE columns (covering index)
  concurrent?: boolean
}

// Table partitioning
export interface PartitionDefinition {
  type: 'RANGE' | 'LIST' | 'HASH'
  columns: string[]
}

// Full table definition
export interface TableDefinition {
  schema: string
  name: string
  columns: ColumnDefinition[]
  constraints: ConstraintDefinition[]
  indexes: IndexDefinition[]
  partition?: PartitionDefinition
  inherits?: string[] // Parent tables
  tablespace?: string
  comment?: string
  withOids?: boolean
  unlogged?: boolean
}

// ALTER TABLE operations
export type AlterColumnOperation =
  | { type: 'add'; column: ColumnDefinition }
  | { type: 'drop'; columnName: string; cascade?: boolean }
  | { type: 'rename'; oldName: string; newName: string }
  | { type: 'set_type'; columnName: string; newType: string; using?: string }
  | { type: 'set_nullable'; columnName: string; nullable: boolean }
  | { type: 'set_default'; columnName: string; defaultValue: string | null }
  | { type: 'set_comment'; columnName: string; comment: string | null }

export type AlterConstraintOperation =
  | { type: 'add_constraint'; constraint: ConstraintDefinition }
  | { type: 'drop_constraint'; name: string; cascade?: boolean }
  | { type: 'rename_constraint'; oldName: string; newName: string }

export type AlterIndexOperation =
  | { type: 'create_index'; index: IndexDefinition }
  | { type: 'drop_index'; name: string; cascade?: boolean; concurrent?: boolean }
  | { type: 'rename_index'; oldName: string; newName: string }
  | { type: 'reindex'; name: string; concurrent?: boolean }

export interface AlterTableBatch {
  schema: string
  table: string
  columnOperations: AlterColumnOperation[]
  constraintOperations: AlterConstraintOperation[]
  indexOperations: AlterIndexOperation[]
  renameTable?: string
  setSchema?: string
  comment?: string | null
}

// Result types
export interface DDLResult {
  success: boolean
  executedSql: string[]
  errors?: string[]
}

// Metadata for UI
export interface SequenceInfo {
  schema: string
  name: string
  dataType: string
  startValue: string
  increment: string
}

export interface CustomTypeInfo {
  schema: string
  name: string
  type: 'enum' | 'composite' | 'range' | 'domain'
  values?: string[] // For enums
}
```

---

## Phase 2: DDL SQL Builder

### New File: `apps/desktop/src/main/ddl-builder.ts`

Create a dedicated builder for DDL statements:

```typescript
// Key functions to implement:
export function buildCreateTable(definition: TableDefinition): ParameterizedQuery
export function buildAlterTable(batch: AlterTableBatch): ParameterizedQuery[]
export function buildDropTable(schema: string, table: string, cascade?: boolean): ParameterizedQuery
export function buildCreateIndex(schema: string, table: string, index: IndexDefinition): ParameterizedQuery
export function buildPreviewDDL(definition: TableDefinition): string // For UI preview
export function buildAlterPreviewDDL(batch: AlterTableBatch): string[]
```

Key considerations:
- Quote all identifiers properly
- Handle reserved words
- Escape string values in defaults
- Support all PostgreSQL constraint syntax
- Handle partial indexes with WHERE
- Support expression indexes

---

## Phase 3: IPC Handlers

### File: `apps/desktop/src/main/index.ts`

Add new IPC handlers:

```typescript
// Create table
ipcMain.handle('db:create-table', async (_, { config, definition }) => {
  // Execute CREATE TABLE statement
  // Return DDLResult
})

// Alter table
ipcMain.handle('db:alter-table', async (_, { config, batch }) => {
  // Execute ALTER TABLE statements in transaction
  // Return DDLResult
})

// Drop table
ipcMain.handle('db:drop-table', async (_, { config, schema, table, cascade }) => {
  // Execute DROP TABLE
  // Return DDLResult
})

// Get table DDL (reverse engineer)
ipcMain.handle('db:get-table-ddl', async (_, { config, schema, table }) => {
  // Query pg_catalog to reconstruct CREATE TABLE
  // Return TableDefinition
})

// Get available sequences
ipcMain.handle('db:get-sequences', async (_, config) => {
  // Query pg_sequences
  // Return SequenceInfo[]
})

// Get custom types
ipcMain.handle('db:get-types', async (_, config) => {
  // Query pg_type for enums, composites, etc.
  // Return CustomTypeInfo[]
})

// Preview DDL without executing
ipcMain.handle('db:preview-ddl', async (_, { definition }) => {
  // Return generated SQL string
})
```

### File: `apps/desktop/src/preload/index.ts`

Update API exposure:

```typescript
const api = {
  // ... existing
  ddl: {
    createTable: (config, definition) => ipcRenderer.invoke('db:create-table', { config, definition }),
    alterTable: (config, batch) => ipcRenderer.invoke('db:alter-table', { config, batch }),
    dropTable: (config, schema, table, cascade) =>
      ipcRenderer.invoke('db:drop-table', { config, schema, table, cascade }),
    getTableDDL: (config, schema, table) =>
      ipcRenderer.invoke('db:get-table-ddl', { config, schema, table }),
    getSequences: (config) => ipcRenderer.invoke('db:get-sequences', config),
    getTypes: (config) => ipcRenderer.invoke('db:get-types', config),
    previewDDL: (definition) => ipcRenderer.invoke('db:preview-ddl', { definition })
  }
}
```

---

## Phase 4: Tab Store Extension

### File: `apps/desktop/src/renderer/src/stores/tab-store.ts`

Add new tab type:

```typescript
export type TabType = 'query' | 'table-preview' | 'erd' | 'table-designer'

export interface TableDesignerTab extends BaseTab {
  type: 'table-designer'
  schemaName: string
  tableName?: string // undefined for new table
  mode: 'create' | 'edit'
  isDirty: boolean
}

// New actions
createTableDesignerTab: (connectionId: string, schemaName: string, tableName?: string) => string
```

---

## Phase 5: DDL Store

### New File: `apps/desktop/src/renderer/src/stores/ddl-store.ts`

Create Zustand store for table designer state:

```typescript
interface DDLState {
  // Per-tab state (keyed by tabId)
  tabState: Map<string, TableDesignerState>

  // Actions
  initializeTab: (tabId: string, mode: 'create' | 'edit', definition?: TableDefinition) => void

  // Column operations
  addColumn: (tabId: string, column?: Partial<ColumnDefinition>) => void
  updateColumn: (tabId: string, columnId: string, updates: Partial<ColumnDefinition>) => void
  removeColumn: (tabId: string, columnId: string) => void
  reorderColumns: (tabId: string, startIndex: number, endIndex: number) => void

  // Constraint operations
  addConstraint: (tabId: string, constraint: ConstraintDefinition) => void
  updateConstraint: (tabId: string, constraintId: string, updates: Partial<ConstraintDefinition>) => void
  removeConstraint: (tabId: string, constraintId: string) => void

  // Index operations
  addIndex: (tabId: string, index: IndexDefinition) => void
  updateIndex: (tabId: string, indexId: string, updates: Partial<IndexDefinition>) => void
  removeIndex: (tabId: string, indexId: string) => void

  // Table properties
  updateTableProperties: (tabId: string, updates: Partial<TableDefinition>) => void

  // Diff tracking for edit mode
  getAlterTableBatch: (tabId: string) => AlterTableBatch | null

  // Validation
  validateDefinition: (tabId: string) => { valid: boolean; errors: string[] }

  // Cleanup
  clearTabState: (tabId: string) => void
}

interface TableDesignerState {
  original?: TableDefinition // For edit mode - track original state
  current: TableDefinition
  isDirty: boolean
  validationErrors: string[]
}
```

---

## Phase 6: UI Components

### New Components Structure:

```
src/renderer/src/components/
├── table-designer/
│   ├── table-designer.tsx           # Main container
│   ├── column-list.tsx              # Column grid with drag-drop
│   ├── column-editor-row.tsx        # Inline column editing
│   ├── column-editor-dialog.tsx     # Full column editor modal
│   ├── constraint-list.tsx          # Constraint management
│   ├── constraint-editor-dialog.tsx # Add/edit constraint
│   ├── index-list.tsx               # Index management
│   ├── index-editor-dialog.tsx      # Add/edit index
│   ├── table-properties.tsx         # Table-level settings
│   ├── ddl-preview-panel.tsx        # Live SQL preview
│   ├── data-type-select.tsx         # Type picker with search
│   └── sequence-select.tsx          # Sequence picker
```

### Main Component: `table-designer.tsx`

Layout:
```
┌─────────────────────────────────────────────────────────────────┐
│ Toolbar: [Save] [Preview SQL] [Cancel] | Table: schema.name    │
├─────────────────────────────────────────────────────────────────┤
│ Tabs: [Columns] [Constraints] [Indexes] [Properties]           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Column Grid (primary view)                                │  │
│  │ ┌─────┬──────────┬──────────┬────┬────┬────┬─────────┐   │  │
│  │ │ ⋮⋮ │ Name     │ Type     │ PK │ NN │ UQ │ Default │   │  │
│  │ ├─────┼──────────┼──────────┼────┼────┼────┼─────────┤   │  │
│  │ │ ⋮⋮ │ id       │ uuid     │ ✓  │ ✓  │    │ gen_... │   │  │
│  │ │ ⋮⋮ │ name     │ varchar  │    │ ✓  │    │         │   │  │
│  │ │ ⋮⋮ │ email    │ varchar  │    │ ✓  │ ✓  │         │   │  │
│  │ │ ⋮⋮ │ created  │ timestamp│    │ ✓  │    │ now()   │   │  │
│  │ └─────┴──────────┴──────────┴────┴────┴────┴─────────┘   │  │
│  │ [+ Add Column]                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ DDL Preview (collapsible)                                 │  │
│  │ CREATE TABLE schema.table (                               │  │
│  │   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),          │  │
│  │   ...                                                     │  │
│  │ );                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Features by Tab:

**Columns Tab:**
- Drag-drop reordering
- Inline editing for quick changes
- Click to expand for advanced options
- Visual indicators: PK (key icon), NOT NULL (*), UNIQUE (U)
- Type suggestions as you type
- Array type toggle
- Collation selector for text types

**Constraints Tab:**
- List view with constraint type badges
- Add constraint button with type selector
- Foreign key builder with table/column pickers
- Check constraint with SQL editor
- Unique constraint with column multi-select

**Indexes Tab:**
- List of indexes with method badges
- Column selector with order (ASC/DESC)
- Partial index condition editor
- INCLUDE column selector
- CONCURRENT option toggle

**Properties Tab:**
- Table comment
- Schema selector (for changing schema)
- Tablespace selector
- Partition configuration
- Inheritance configuration
- UNLOGGED toggle

---

## Phase 7: Integration Points

### Schema Explorer Updates

Add to `schema-explorer.tsx`:

1. "Create Table" button in schema header:
```tsx
<Button onClick={() => createTableDesignerTab(connectionId, schema.name)}>
  <Plus className="size-3.5" />
</Button>
```

2. Context menu on tables:
```tsx
<ContextMenu>
  <ContextMenuItem onClick={() => createTableDesignerTab(connectionId, schema.name, table.name)}>
    Edit Table Structure
  </ContextMenuItem>
  <ContextMenuItem onClick={() => handleDropTable(schema.name, table.name)}>
    Drop Table...
  </ContextMenuItem>
</ContextMenu>
```

### Tab Container Updates

Add to `tab-container.tsx`:

```tsx
case 'table-designer':
  return <TableDesigner tabId={tab.id} />
```

---

## Phase 8: Implementation Order

### Step 1: Foundation (Day 1-2)
1. Add all shared types to `packages/shared/src/index.ts`
2. Create `ddl-builder.ts` with CREATE TABLE generation
3. Add basic IPC handlers for create-table and preview-ddl

### Step 2: Basic UI (Day 2-3)
1. Create DDL store
2. Add new tab type to tab-store
3. Create basic TableDesigner component with column list
4. Add column editing (inline + dialog)
5. Add DDL preview panel

### Step 3: Column Features (Day 3-4)
1. Implement all column properties
2. Add data type selector with all PostgreSQL types
3. Add sequence picker for defaults
4. Implement column validation

### Step 4: Constraints (Day 4-5)
1. Add constraint list UI
2. Implement PRIMARY KEY constraint
3. Implement FOREIGN KEY with table/column picker
4. Implement UNIQUE and CHECK constraints

### Step 5: Indexes (Day 5)
1. Add index list UI
2. Implement index creation with all options
3. Add partial index support

### Step 6: ALTER TABLE (Day 6-7)
1. Implement `db:get-table-ddl` handler (reverse engineer table)
2. Implement diff tracking in DDL store
3. Generate ALTER TABLE statements
4. Handle column type changes with USING

### Step 7: Advanced Features (Day 7-8)
1. Add partitioning support
2. Add inheritance support
3. Add custom type support
4. Add schema explorer integration (create button, context menu)

### Step 8: Polish (Day 8)
1. Validation and error handling
2. Keyboard shortcuts
3. Undo/redo support
4. Test with various edge cases

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+S` | Save/Execute DDL |
| `Cmd+Enter` | Preview SQL |
| `Cmd+N` | Add new column |
| `Delete` | Remove selected column |
| `Cmd+Z` | Undo last change |
| `Cmd+Shift+Z` | Redo |
| `Tab` | Move to next column field |
| `Shift+Tab` | Move to previous field |

---

## Validation Rules

1. **Table name**: Required, valid identifier, not reserved word
2. **Column names**: Required, unique within table, valid identifier
3. **Primary key**: At most one (can be composite)
4. **Foreign keys**: Referenced table must exist, column types must match
5. **Check constraints**: Valid SQL expression
6. **Default values**: Type-compatible with column

---

## Error Handling

1. **Pre-execution validation**: Show errors inline before attempting execution
2. **Execution errors**: Display PostgreSQL error message clearly
3. **Partial success**: If ALTER TABLE fails mid-batch, show which operations succeeded
4. **Recovery**: Provide option to rollback or continue

---

## Testing Scenarios

1. Create simple table with various column types
2. Create table with composite primary key
3. Create table with foreign keys to multiple tables
4. Create table with CHECK constraints
5. Create table with partial indexes
6. Edit existing table - add column
7. Edit existing table - change column type
8. Edit existing table - add/remove constraints
9. Drop table with cascade
10. Create table with partitioning
