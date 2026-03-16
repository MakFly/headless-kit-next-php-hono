'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAdminCustomersAction,
  deleteCustomerAction,
  getSegmentsAction,
} from '@/lib/actions/shop/admin';
import type { Segment } from '@/lib/actions/shop/admin';
import type { Customer, PaginatedResponse } from '@/types/shop';
import { formatPrice, formatDate } from '@/components/shop/admin/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Search, Filter, X } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-rose-500',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(firstName?: string, lastName?: string) {
  const f = firstName?.[0] ?? '?';
  const l = lastName?.[0] ?? '?';
  return `${f}${l}`.toUpperCase();
}

type OrderHistoryFilter = 'any' | 'has_ordered' | 'never_ordered';
type SpentFilter = 'any' | 'gt100' | 'gt500' | 'gt1000';

function FilterPanel({
  segments,
  selectedSegments,
  onToggleSegment,
  orderHistory,
  onOrderHistoryChange,
  spentFilter,
  onSpentFilterChange,
}: {
  segments: Segment[];
  selectedSegments: Set<string>;
  onToggleSegment: (slug: string) => void;
  orderHistory: OrderHistoryFilter;
  onOrderHistoryChange: (v: OrderHistoryFilter) => void;
  spentFilter: SpentFilter;
  onSpentFilterChange: (v: SpentFilter) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold mb-3">Segments</h4>
        <div className="space-y-2">
          {segments.map((seg) => (
            <label key={seg.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox
                checked={selectedSegments.has(seg.slug)}
                onCheckedChange={() => onToggleSegment(seg.slug)}
              />
              <span className="flex-1">{seg.name}</span>
              <span className="text-muted-foreground text-xs">{seg.customerCount}</span>
            </label>
          ))}
          {segments.length === 0 && (
            <p className="text-sm text-muted-foreground">No segments</p>
          )}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Order History</h4>
        <div className="space-y-2">
          {([
            ['any', 'Any'],
            ['has_ordered', 'Has ordered'],
            ['never_ordered', 'Never ordered'],
          ] as const).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="orderHistory"
                checked={orderHistory === value}
                onChange={() => onOrderHistoryChange(value)}
                className="h-4 w-4 text-primary"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Total Spent</h4>
        <div className="space-y-2">
          {([
            ['any', 'Any'],
            ['gt100', '> $100'],
            ['gt500', '> $500'],
            ['gt1000', '> $1,000'],
          ] as const).map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="spentFilter"
                checked={spentFilter === value}
                onChange={() => onSpentFilterChange(value)}
                className="h-4 w-4 text-primary"
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminCustomersTable() {
  const [data, setData] = useState<PaginatedResponse<Customer> | null>(null);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [search, setSearch] = useState('');
  const [selectedSegments, setSelectedSegments] = useState<Set<string>>(new Set());
  const [orderHistory, setOrderHistory] = useState<OrderHistoryFilter>('any');
  const [spentFilter, setSpentFilter] = useState<SpentFilter>('any');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeSegment = useMemo(() => {
    const slugs = Array.from(selectedSegments);
    return slugs.length === 1 ? slugs[0] : undefined;
  }, [selectedSegments]);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminCustomersAction({
        search: search || undefined,
        segment: activeSegment,
        page,
        perPage: 20,
      });
      setData(result);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [search, activeSegment, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    getSegmentsAction()
      .then(setSegments)
      .catch(() => setSegments([]));
  }, []);

  const toggleSegment = (slug: string) => {
    setSelectedSegments((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCustomerAction(deleteTarget.id);
      setDeleteTarget(null);
      fetchCustomers();
    } catch {
      // silently handled
    } finally {
      setDeleting(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!data) return null;
    let filtered = data.data;

    if (selectedSegments.size > 1) {
      filtered = filtered.filter((c) => c.segment && selectedSegments.has(c.segment));
    }

    if (orderHistory === 'has_ordered') {
      filtered = filtered.filter((c) => c.nbOrders > 0);
    } else if (orderHistory === 'never_ordered') {
      filtered = filtered.filter((c) => c.nbOrders === 0);
    }

    if (spentFilter === 'gt100') {
      filtered = filtered.filter((c) => c.totalSpent > 10000);
    } else if (spentFilter === 'gt500') {
      filtered = filtered.filter((c) => c.totalSpent > 50000);
    } else if (spentFilter === 'gt1000') {
      filtered = filtered.filter((c) => c.totalSpent > 100000);
    }

    return filtered;
  }, [data, selectedSegments, orderHistory, spentFilter]);

  const hasActiveFilters = selectedSegments.size > 0 || orderHistory !== 'any' || spentFilter !== 'any';

  const clearFilters = () => {
    setSelectedSegments(new Set());
    setOrderHistory('any');
    setSpentFilter('any');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setMobileFiltersOpen(true)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              !
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="hidden lg:flex">
            <X className="mr-2 h-4 w-4" />
            Clear filters
          </Button>
        )}

        <Button size="sm" className="ml-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="flex gap-6">
        <aside className="hidden lg:block w-56 shrink-0 space-y-2">
          <div className="rounded-lg border p-4">
            <FilterPanel
              segments={segments}
              selectedSegments={selectedSegments}
              onToggleSegment={toggleSegment}
              orderHistory={orderHistory}
              onOrderHistoryChange={(v) => { setOrderHistory(v); setPage(1); }}
              spentFilter={spentFilter}
              onSpentFilterChange={(v) => { setSpentFilter(v); setPage(1); }}
            />
          </div>
        </aside>

        <div className="flex-1 space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredData && filteredData.length > 0 ? (
                  filteredData.map((customer) => {
                    const fullName = `${customer.firstName} ${customer.lastName}`;
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium text-white ${getAvatarColor(fullName)}`}
                            >
                              {getInitials(customer.firstName, customer.lastName)}
                            </div>
                            <span className="font-medium">{fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {customer.email}
                        </TableCell>
                        <TableCell>
                          {customer.segment ? (
                            <Badge variant="outline" className="capitalize">
                              {customer.segment.replace(/_/g, ' ')}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{customer.nbOrders}</TableCell>
                        <TableCell>
                          <span
                            className={
                              customer.totalSpent > 50000
                                ? 'dark:text-green-500 text-lime-700 font-semibold'
                                : ''
                            }
                          >
                            {formatPrice(customer.totalSpent)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {customer.lastOrderAt
                            ? formatDate(customer.lastOrderAt)
                            : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => setDeleteTarget(customer)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {data && (data.pagination?.totalPages ?? 0) > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.pagination?.page ?? 1} of {data.pagination?.totalPages ?? 1} ({data.pagination?.total ?? 0} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= (data.pagination?.totalPages ?? 1)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetContent side="left" className="w-72 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>Narrow down your customer list</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <FilterPanel
              segments={segments}
              selectedSegments={selectedSegments}
              onToggleSegment={toggleSegment}
              orderHistory={orderHistory}
              onOrderHistoryChange={(v) => { setOrderHistory(v); setPage(1); }}
              spentFilter={spentFilter}
              onSpentFilterChange={(v) => { setSpentFilter(v); setPage(1); }}
            />
          </div>
          {hasActiveFilters && (
            <div className="mt-6">
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                Clear all filters
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.firstName}{' '}
              {deleteTarget?.lastName}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
