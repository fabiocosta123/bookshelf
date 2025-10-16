"use client";

import * as React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type: string;
  relatedLoanId?: string | null;
  createdAt?: string | Date;
  is_read?: boolean;
};

export function NotificationCard({
  notification,
  onMarkRead,
  className,
}: {
  notification: NotificationItem;
  onMarkRead?: (id: string) => void;
  className?: string;
}) {
  const createdAt = notification.createdAt ? new Date(notification.createdAt) : null;
  const time = createdAt ? createdAt.toLocaleString() : "";

  const colorClasses =
    notification.type === "NEW_LOAN_REQUEST"
      ? "bg-yellow-50 text-yellow-800"
      : notification.type === "SYSTEM"
      ? "bg-blue-50 text-blue-800"
      : "bg-gray-50 text-gray-800";

  return (
    <article
      className={cn(
        "w-full bg-white border rounded-lg shadow-sm flex gap-3 items-start p-4",
        "md:flex-row md:items-center",
        className
      )}
      role="article"
      aria-labelledby={`notif-${notification.id}-title`}
    >
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          notification.is_read ? "bg-gray-100" : "bg-indigo-600"
        )}
      >
        <Bell className={cn("w-5 h-5", notification.is_read ? "text-gray-500" : "text-white")} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="truncate">
            <h3 id={`notif-${notification.id}-title`} className="text-sm font-semibold truncate">
              {notification.title}
            </h3>
            <p className="text-xs text-gray-500 truncate mt-1">{notification.message}</p>
          </div>

          <div className="text-right ml-2">
            <time className="block text-xs text-gray-400">{time}</time>
            <span
              className={cn(
                "mt-2 inline-block px-2 py-0.5 text-xs font-medium rounded",
                colorClasses
              )}
            >
              {notification.type.replaceAll("_", " ")}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {notification.relatedLoanId ? (
            <Link
              href={`/loans/${notification.relatedLoanId}`}
              className="inline-flex items-center px-3 py-1.5 text-xs rounded-md bg-gray-100 hover:bg-gray-200"
            >
              Ver Empréstimo
            </Link>
          ) : null}

          <button
            onClick={() => onMarkRead?.(notification.id)}
            className="ml-auto inline-flex items-center px-3 py-1.5 text-xs rounded-md border hover:bg-gray-50"
            aria-label="Marcar como lida"
          >
            Marcar lida
          </button>
        </div>
      </div>
    </article>
  );
}