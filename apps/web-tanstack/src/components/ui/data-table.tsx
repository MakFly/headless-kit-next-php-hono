'use client'

import * as React from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

export interface DataTableSearchConfig {
  enabled?: boolean
  keys?: string[]
  placeholder?: string
}

export interface DataTablePaginationConfig {
  enabled?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  serverSide?: boolean
}

export interface DataTableColumnVisibilityConfig {
  enabled?: boolean
}

export interface DataTableRowSelectionConfig {
  enabled?: boolean
}

export interface DataTableColumnSortConfig {
  enabled?: boolean
}

export interface DataTableActionsConfig<TData> {
  enabled?: boolean
  label?: string
  items?: {
    label: string
    icon?: React.ReactNode
    onClick: (row: TData) => void
    variant?: 'default' | 'destructive'
  }[]
}

export interface DataTableEmptyStateConfig {
  message?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export interface DataTableLoadingConfig {
  enabled?: boolean
  rowCount?: number
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  search?: DataTableSearchConfig
  pagination?: DataTablePaginationConfig
  columnVisibilityConfig?: DataTableColumnVisibilityConfig
  rowSelectionConfig?: DataTableRowSelectionConfig
  sort?: DataTableColumnSortConfig
  actions?: DataTableActionsConfig<TData>
  emptyState?: DataTableEmptyStateConfig
  loading?: DataTableLoadingConfig
  onPaginationChange?: (pagination: PaginationState) => void
  onSortingChange?: (sorting: SortingState) => void
  onRowSelectionChange?: (selection: Record<string, boolean>) => void
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  search = {},
  pagination = {},
  columnVisibilityConfig = {},
  rowSelectionConfig = {},
  sort = {},
  actions = {},
  emptyState = {},
  loading = {},
  onPaginationChange,
  onSortingChange,
  onRowSelectionChange,
  className,
}: DataTableProps<TData, TValue>) {
  const searchEnabled = search.enabled ?? true
  const paginationEnabled = pagination.enabled ?? true
  const columnVisibilityEnabled = columnVisibilityConfig.enabled ?? false
  const rowSelectionEnabled = rowSelectionConfig.enabled ?? false
  const sortEnabled = sort.enabled ?? true
  const loadingEnabled = loading.enabled ?? false

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  const pageSize = pagination.pageSize ?? 10
  const pageSizeOptions = pagination.pageSizeOptions ?? [10, 25, 50, 100]

  const [paginationState, setPaginationState] = React.useState<PaginationState>(
    {
      pageIndex: 0,
      pageSize,
    },
  )

  const handlePaginationChange = (
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) => {
    const newPagination =
      typeof updater === 'function' ? updater(paginationState) : updater
    setPaginationState(newPagination)
    onPaginationChange?.(newPagination)
  }

  const handleSortingChange = (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => {
    const newSorting =
      typeof updater === 'function' ? updater(sorting) : updater
    setSorting(newSorting)
    onSortingChange?.(newSorting)
  }

  const handleRowSelectionChange = (
    updater:
      | Record<string, boolean>
      | ((old: Record<string, boolean>) => Record<string, boolean>),
  ) => {
    const newSelection =
      typeof updater === 'function' ? updater(rowSelection) : updater
    setRowSelection(newSelection)
    onRowSelectionChange?.(newSelection)
  }

  const table = useReactTable({
    data,
    columns,
    onSortingChange: handleSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: handlePaginationChange,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: handleRowSelectionChange,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: paginationEnabled
      ? getPaginationRowModel()
      : undefined,
    getSortedRowModel: sortEnabled ? getSortedRowModel() : undefined,
    getFilteredRowModel: searchEnabled ? getFilteredRowModel() : undefined,
    globalFilterFn: 'includesString',
    autoResetPageIndex: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: paginationState,
      globalFilter,
    },
  })

  const renderSortIcon = (header: any) => {
    if (!sortEnabled || !header.column.getCanSort()) return null
    const sorted = header.column.getIsSorted()
    if (sorted === 'asc') return <ArrowUpIcon className="ml-2 size-4" />
    if (sorted === 'desc') return <ArrowDownIcon className="ml-2 size-4" />
    return <ArrowUpDownIcon className="ml-2 size-4 opacity-50" />
  }

  const renderLoadingRows = () => {
    const rowCount = loading.rowCount ?? pageSize
    return Array.from({ length: rowCount }).map((_, i) => (
      <TableRow key={i}>
        {columns.map((_, colIndex) => (
          <TableCell key={colIndex}>
            <Skeleton className="h-4 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))
  }

  const renderEmptyState = () => {
    const message = emptyState.message ?? 'No results found'
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-24 text-center">
          {loadingEnabled ? (
            <div className="flex flex-col items-center gap-2">
              {renderLoadingRows()}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {emptyState.icon && (
                <div className="text-muted-foreground">{emptyState.icon}</div>
              )}
              <p className="text-muted-foreground">{message}</p>
              {emptyState.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={emptyState.action.onClick}
                >
                  {emptyState.action.label}
                </Button>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {searchEnabled && (
          <div className="flex items-center gap-2">
            <Input
              placeholder={search.placeholder ?? 'Search...'}
              value={globalFilter ?? ''}
              onChange={(event) => {
                const value = event.target.value
                setGlobalFilter(value)
                if (value) table.setPageIndex(0)
              }}
              className={
                columnVisibilityEnabled || actions.enabled
                  ? 'max-w-sm'
                  : 'max-w-xs'
              }
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          {columnVisibilityEnabled && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="ml-auto">
                  <EyeIcon className="mr-2 size-4" />
                  Columns
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {actions.enabled && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {actions.label ?? 'Actions'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.items?.map((item, index) => (
                  <DropdownMenuCheckboxItem
                    key={index}
                    onCheckedChange={() => {}}
                    className={
                      item.variant === 'destructive' ? 'text-destructive' : ''
                    }
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : sortEnabled &&
                      header.column.getCanSort() ? (
                      <button
                        className="flex items-center"
                        onClick={() => header.column.toggleSorting()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {renderSortIcon(header)}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loadingEnabled
              ? renderLoadingRows()
              : table.getRowModel().rows?.length
                ? table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : renderEmptyState()}
          </TableBody>
        </Table>
      </div>

      {paginationEnabled && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {rowSelectionEnabled && (
              <div className="text-sm text-muted-foreground">
                {table.getFilteredSelectedRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} row(s) selected
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length} row(s)
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm">Rows per page</span>
              <select
                className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
                value={paginationState.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value))
                }}
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium">
                {paginationState.pageIndex + 1} / {table.getPageCount()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRightIcon className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export type {
  ColumnDef,
  SortingState,
  PaginationState,
  ColumnFiltersState,
  VisibilityState,
}
export {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
}
