'use client'

import {
  Play,
  Download,
  FileJson,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  Database,
  Wand2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useTabStore, useConnectionStore, useQueryStore } from '@/stores'
import type { Tab } from '@/stores/tab-store'
import { DataTable } from '@/components/data-table'
import { SQLEditor } from '@/components/sql-editor'
import { formatSQL } from '@/lib/sql-formatter'
import type { QueryResult as IpcQueryResult } from '@data-peek/shared'

// PostgreSQL data type OID to name mapping (common types)
function getDataTypeName(dataTypeID: number): string {
  const typeMap: Record<number, string> = {
    16: 'boolean',
    17: 'bytea',
    18: 'char',
    19: 'name',
    20: 'bigint',
    21: 'smallint',
    23: 'integer',
    24: 'regproc',
    25: 'text',
    26: 'oid',
    114: 'json',
    142: 'xml',
    700: 'real',
    701: 'double precision',
    790: 'money',
    1042: 'char',
    1043: 'varchar',
    1082: 'date',
    1083: 'time',
    1114: 'timestamp',
    1184: 'timestamptz',
    1186: 'interval',
    1560: 'bit',
    1562: 'varbit',
    1700: 'numeric',
    2950: 'uuid',
    3802: 'jsonb',
    3904: 'int4range',
    3906: 'numrange',
    3908: 'tsrange',
    3910: 'tstzrange',
    3912: 'daterange',
    3926: 'int8range'
  }
  return typeMap[dataTypeID] ?? `unknown(${dataTypeID})`
}

interface TabQueryEditorProps {
  tabId: string
}

export function TabQueryEditor({ tabId }: TabQueryEditorProps) {
  const tab = useTabStore((s) => s.getTab(tabId)) as Tab | undefined
  const updateTabQuery = useTabStore((s) => s.updateTabQuery)
  const updateTabResult = useTabStore((s) => s.updateTabResult)
  const updateTabExecuting = useTabStore((s) => s.updateTabExecuting)
  const markTabSaved = useTabStore((s) => s.markTabSaved)
  const getTabPaginatedRows = useTabStore((s) => s.getTabPaginatedRows)

  const connections = useConnectionStore((s) => s.connections)
  const schemas = useConnectionStore((s) => s.schemas)
  const addToHistory = useQueryStore((s) => s.addToHistory)

  // Get the connection for this tab
  const tabConnection = tab?.connectionId
    ? connections.find((c) => c.id === tab.connectionId)
    : null

  const handleRunQuery = async () => {
    if (!tab || !tabConnection || tab.isExecuting || !tab.query.trim()) {
      return
    }

    updateTabExecuting(tabId, true)

    try {
      const response = await window.api.db.query(tabConnection, tab.query)

      if (response.success && response.data) {
        const data = response.data as IpcQueryResult

        const result = {
          columns: data.fields.map((f) => ({
            name: f.name,
            dataType: getDataTypeName(f.dataTypeID)
          })),
          rows: data.rows,
          rowCount: data.rowCount ?? data.rows.length,
          durationMs: data.durationMs
        }

        updateTabResult(tabId, result, null)
        markTabSaved(tabId)

        // Add to global history
        addToHistory({
          query: tab.query,
          durationMs: data.durationMs,
          rowCount: result.rowCount,
          status: 'success',
          connectionId: tabConnection.id
        })
      } else {
        const errorMessage = response.error ?? 'Query execution failed'
        updateTabResult(tabId, null, errorMessage)

        addToHistory({
          query: tab.query,
          durationMs: 0,
          rowCount: 0,
          status: 'error',
          connectionId: tabConnection.id,
          errorMessage
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      updateTabResult(tabId, null, errorMessage)
    } finally {
      updateTabExecuting(tabId, false)
    }
  }

  const handleFormatQuery = () => {
    if (!tab || !tab.query.trim()) return
    const formatted = formatSQL(tab.query)
    updateTabQuery(tabId, formatted)
  }

  const handleQueryChange = (value: string) => {
    updateTabQuery(tabId, value)
  }

  if (!tab) {
    return null
  }

  if (!tabConnection) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center space-y-4">
          <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
            <Database className="size-8 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-medium">No Connection</h2>
            <p className="text-sm text-muted-foreground mt-1">
              This tab's connection is no longer available.
              <br />
              Select a different connection from the sidebar.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const paginatedRows = getTabPaginatedRows(tabId)

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Query Editor Section */}
      <div className="flex flex-col border-b border-border/40 shrink-0">
        {/* Monaco SQL Editor */}
        <div className="p-3 pb-0">
          <SQLEditor
            value={tab.query}
            onChange={handleQueryChange}
            onRun={handleRunQuery}
            onFormat={handleFormatQuery}
            height={160}
            placeholder="SELECT * FROM your_table LIMIT 100;"
            schemas={schemas}
          />
        </div>

        {/* Editor Toolbar */}
        <div className="flex items-center justify-between bg-muted/20 px-3 py-2">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="gap-1.5 h-7"
              disabled={tab.isExecuting || !tab.query.trim()}
              onClick={handleRunQuery}
            >
              {tab.isExecuting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Play className="size-3.5" />
              )}
              Run
              <kbd className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                ⌘↵
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-7"
              disabled={!tab.query.trim()}
              onClick={handleFormatQuery}
            >
              <Wand2 className="size-3.5" />
              Format
              <kbd className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
                ⌘⇧F
              </kbd>
            </Button>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span
                className={`size-1.5 rounded-full ${tabConnection.isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}
              />
              {tabConnection.name}
            </span>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {tab.error ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="max-w-md text-center space-y-2">
              <AlertCircle className="size-8 text-red-400 mx-auto" />
              <h3 className="font-medium text-red-400">Query Error</h3>
              <p className="text-sm text-muted-foreground">{tab.error}</p>
            </div>
          </div>
        ) : tab.result ? (
          <>
            {/* Results Table */}
            <div className="flex-1 overflow-hidden p-3">
              <DataTable
                columns={tab.result.columns}
                data={paginatedRows as Record<string, unknown>[]}
                pageSize={tab.pageSize}
              />
            </div>

            {/* Results Footer */}
            <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-3 py-1.5 shrink-0">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-green-500" />
                  {tab.result.rowCount} rows returned
                </span>
                <span>{tab.result.durationMs}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5 h-7">
                      <Download className="size-3.5" />
                      Export
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <FileSpreadsheet className="size-4 text-muted-foreground" />
                      Export as CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileJson className="size-4 text-muted-foreground" />
                      Export as JSON
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">Run a query to see results</p>
              <p className="text-xs text-muted-foreground/70">
                Press ⌘+Enter to execute
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
