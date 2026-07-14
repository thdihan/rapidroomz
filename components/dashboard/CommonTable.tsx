"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Column<T> {
  header: React.ReactNode;
  accessorKey?: keyof T | string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

interface CommonTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  pagination?: PaginationProps;
  isLoading?: boolean;
}

export default function CommonTable<T>({
  data,
  columns,
  emptyMessage = "No records found.",
  pagination,
  isLoading = false,
}: CommonTableProps<T>) {
  return (
    <div className="w-full bg-white rounded-lg border border-border overflow-hidden shadow-sm">
      <div className="w-full overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50 border-b border-border">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3.5 px-4 ${column.className || ""}`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading State Skeleton rows
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="animate-pulse border-b border-border/50">
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded-sm w-3/4"></div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-16 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="p-3 rounded-full bg-slate-50 text-slate-400">
                      <Inbox className="size-8" />
                    </div>
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="hover:bg-slate-50/50 transition-colors border-b border-border last:border-0"
                >
                  {columns.map((column, colIndex) => {
                    const value = column.accessorKey
                      ? (item as any)[column.accessorKey]
                      : undefined;
                    return (
                      <TableCell
                        key={colIndex}
                        className={`py-3.5 px-4 text-sm text-foreground font-medium ${column.className || ""}`}
                      >
                        {column.render
                          ? column.render(item, rowIndex)
                          : value !== undefined
                          ? String(value)
                          : null}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-border">
          <div className="text-xs text-muted-foreground font-semibold">
            {pagination.totalItems !== undefined && pagination.itemsPerPage !== undefined ? (
              <span>
                Showing{" "}
                <span className="font-bold text-foreground">
                  {Math.min(
                    (pagination.currentPage - 1) * pagination.itemsPerPage + 1,
                    pagination.totalItems
                  )}
                </span>{" "}
                to{" "}
                <span className="font-bold text-foreground">
                  {Math.min(
                    pagination.currentPage * pagination.itemsPerPage,
                    pagination.totalItems
                  )}
                </span>{" "}
                of <span className="font-bold text-foreground">{pagination.totalItems}</span>{" "}
                entries
              </span>
            ) : (
              <span>
                Page <span className="font-bold text-foreground">{pagination.currentPage}</span>{" "}
                of <span className="font-bold text-foreground">{pagination.totalPages}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="h-8 px-2 flex items-center gap-1 border-border bg-white text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs rounded-sm shadow-none"
            >
              <ChevronLeft className="size-4" />
              <span>Previous</span>
            </Button>

            {/* Page number chips for cleaner premium UI */}
            {Array.from({ length: pagination.totalPages }).map((_, index) => {
              const pageNum = index + 1;
              // Show current, first, last, and pages adjacent to current page
              if (
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                Math.abs(pageNum - pagination.currentPage) <= 1
              ) {
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={`h-8 w-8 p-0 cursor-pointer shadow-none rounded-sm transition-colors text-xs font-semibold ${
                      pagination.currentPage === pageNum
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border-border bg-white text-muted-foreground hover:text-foreground hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              } else if (
                (pageNum === 2 && pagination.currentPage > 3) ||
                (pageNum === pagination.totalPages - 1 &&
                  pagination.currentPage < pagination.totalPages - 2)
              ) {
                return (
                  <span key={pageNum} className="px-1 text-muted-foreground text-xs font-medium">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="h-8 px-2 flex items-center gap-1 border-border bg-white text-muted-foreground hover:text-foreground hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs rounded-sm shadow-none"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
