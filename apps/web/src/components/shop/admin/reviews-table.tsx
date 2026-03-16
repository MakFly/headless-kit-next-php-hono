'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getAdminReviewsAction,
  moderateReviewAction,
  bulkApproveReviewsAction,
  bulkRejectReviewsAction,
} from '@/lib/actions/shop/admin';
import type { Review, ReviewStatus, PaginatedResponse } from '@/types/shop';
import { formatDate } from '@/components/shop/admin/format';
import { StatusBadge } from '@/components/shop/admin/status-badge';
import { StarRating } from '@/components/shop/admin/star-rating';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle } from 'lucide-react';

const REVIEW_STATUSES: (ReviewStatus | 'all')[] = [
  'all',
  'pending',
  'approved',
  'rejected',
];

const RATINGS = ['all', '1', '2', '3', '4', '5'] as const;

const statusBorderClass: Record<ReviewStatus, string> = {
  approved: 'border-l-[5px] border-l-green-400 dark:border-l-green-800',
  pending: 'border-l-[5px] border-l-yellow-400 dark:border-l-yellow-800',
  rejected: 'border-l-[5px] border-l-red-400 dark:border-l-red-800',
};

export function AdminReviewsTable() {
  const [data, setData] = useState<PaginatedResponse<Review> | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [sheetReview, setSheetReview] = useState<Review | null>(null);
  const [sheetStatus, setSheetStatus] = useState<ReviewStatus>('pending');
  const [sheetSaving, setSheetSaving] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAdminReviewsAction({
        status: statusFilter === 'all' ? undefined : statusFilter,
        rating: ratingFilter === 'all' ? undefined : Number(ratingFilter),
        page,
        perPage: 20,
      });
      setData(result);
      setSelected(new Set());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, ratingFilter, page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (!data) return;
    if (selected.size === data.data.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(data.data.map((r) => r.id)));
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      const ids = Array.from(selected);
      if (action === 'approve') {
        await bulkApproveReviewsAction(ids);
      } else {
        await bulkRejectReviewsAction(ids);
      }
      fetchReviews();
    } catch {
      // silently handled
    } finally {
      setBulkLoading(false);
    }
  };

  const openSheet = (review: Review) => {
    setSheetReview(review);
    setSheetStatus(review.status);
  };

  const handleSheetSave = async () => {
    if (!sheetReview) return;
    setSheetSaving(true);
    try {
      await moderateReviewAction(sheetReview.id, { status: sheetStatus });
      setSheetReview(null);
      fetchReviews();
    } catch {
      // silently handled
    } finally {
      setSheetSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as ReviewStatus | 'all');
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {REVIEW_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s === 'all' ? 'All Statuses' : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={ratingFilter}
          onValueChange={(v) => {
            setRatingFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent>
            {RATINGS.map((r) => (
              <SelectItem key={r} value={r}>
                {r === 'all' ? 'All Ratings' : `${r} Star${r === '1' ? '' : 's'}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">
              {selected.size} selected
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
              onClick={() => handleBulkAction('approve')}
              disabled={bulkLoading}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => handleBulkAction('reject')}
              disabled={bulkLoading}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject Selected
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="border-l-transparent border-l-[5px]">
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    !!(data && data.data.length > 0 && selected.size === data.data.length)
                  }
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data && data.data.length > 0 ? (
              data.data.map((review) => (
                <TableRow
                  key={review.id}
                  className={`cursor-pointer hover:bg-muted/50 ${statusBorderClass[review.status]}`}
                  onClick={() => openSheet(review)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(review.id)}
                      onCheckedChange={() => toggleSelect(review.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {review.product?.name ?? review.productId}
                  </TableCell>
                  <TableCell>
                    {review.customer
                      ? `${review.customer.firstName} ${review.customer.lastName}`
                      : review.customerId}
                  </TableCell>
                  <TableCell>
                    <StarRating rating={review.rating} />
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {review.comment ?? (
                      <span className="text-muted-foreground italic">No comment</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={review.status} />
                  </TableCell>
                  <TableCell>{formatDate(review.createdAt)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      {review.status !== 'approved' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600"
                          onClick={async () => {
                            await moderateReviewAction(review.id, { status: 'approved' });
                            fetchReviews();
                          }}
                          title="Approve"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      {review.status !== 'rejected' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={async () => {
                            await moderateReviewAction(review.id, { status: 'rejected' });
                            fetchReviews();
                          }}
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No reviews found.
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

      <Sheet open={!!sheetReview} onOpenChange={(open) => !open && setSheetReview(null)}>
        <SheetContent className="sm:max-w-[25rem] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Review Details</SheetTitle>
            <SheetDescription>
              Review for {sheetReview?.product?.name ?? sheetReview?.productId}
            </SheetDescription>
          </SheetHeader>

          {sheetReview && (
            <div className="mt-6 space-y-6">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Product</p>
                <p className="text-sm font-semibold">
                  {sheetReview.product?.name ?? sheetReview.productId}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Customer</p>
                <p className="text-sm font-semibold">
                  {sheetReview.customer
                    ? `${sheetReview.customer.firstName} ${sheetReview.customer.lastName}`
                    : sheetReview.customerId}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Rating</p>
                <StarRating rating={sheetReview.rating} size={24} />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Comment</p>
                <p className="text-sm leading-relaxed rounded-md bg-muted p-3">
                  {sheetReview.comment ?? (
                    <span className="italic text-muted-foreground">No comment provided</span>
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-sm">{formatDate(sheetReview.createdAt)}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Select
                  value={sheetStatus}
                  onValueChange={(v) => setSheetStatus(v as ReviewStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REVIEW_STATUSES.filter((s) => s !== 'all').map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <SheetFooter className="mt-6">
            <Button variant="outline" onClick={() => setSheetReview(null)}>
              Close
            </Button>
            <Button
              onClick={handleSheetSave}
              disabled={sheetSaving || sheetStatus === sheetReview?.status}
            >
              {sheetSaving ? 'Saving...' : 'Save'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
