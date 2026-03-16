'use client';

import { useEffect, useState } from 'react';
import {
  getAdminInventoryAction,
  updateInventoryAction,
} from '@/lib/actions/shop/admin';
import type { InventoryItem } from '@/types/shop';
import { StatusBadge } from '@/components/shop/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Save } from 'lucide-react';

export function AdminInventoryTable() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedStocks, setEditedStocks] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const result = await getAdminInventoryAction();
      setItems(result);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleStockChange = (productId: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setEditedStocks((prev) => ({ ...prev, [productId]: num }));
    }
  };

  const handleUpdateStock = async (productId: string) => {
    const newStock = editedStocks[productId];
    if (newStock === undefined) return;

    setSaving((prev) => ({ ...prev, [productId]: true }));
    try {
      await updateInventoryAction(productId, newStock);
      setEditedStocks((prev) => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      fetchInventory();
    } catch {
      // error handled silently
    } finally {
      setSaving((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock Quantity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items.length > 0 ? (
              items.map((item) => {
                const isEdited = editedStocks[item.productId] !== undefined;
                const displayStock =
                  editedStocks[item.productId] ?? item.stockQuantity;

                return (
                  <TableRow key={item.productId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted" />
                        )}
                        <span className="font-medium">
                          {item.product.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {item.product.sku ?? (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        value={displayStock}
                        onChange={(e) =>
                          handleStockChange(item.productId, e.target.value)
                        }
                        className="h-8 w-24"
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={!isEdited || saving[item.productId]}
                        onClick={() => handleUpdateStock(item.productId)}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {saving[item.productId] ? 'Saving...' : 'Update'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No inventory data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
