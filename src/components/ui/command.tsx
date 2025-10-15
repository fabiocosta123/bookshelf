"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function Command({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("w-full rounded-md border bg-white", className)}>{children}</div>;
}

export function CommandInput({
  value,
  onValueChange,
  placeholder,
  className,
  ...props
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  placeholder?: string;
  className?: string;
  [key: string]: any;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      placeholder={placeholder}
      className={cn("w-full px-3 py-2 text-sm bg-transparent outline-none", className)}
      {...props}
    />
  );
}

export function CommandList({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("max-h-48 overflow-auto", className)}>{children}</div>;
}

export function CommandItem({ children, onSelect, className }: any) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect?.()}
      onKeyDown={(e) => e.key === "Enter" && onSelect?.()}
      className={cn("px-3 py-2 hover:bg-gray-50 cursor-pointer", className)}
    >
      {children}
    </div>
  );
}