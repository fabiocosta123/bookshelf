"use client";
import React from "react";
import { createPortal } from "react-dom";

export function Dialog({ children, open, onOpenChange }: any) {
  if (!open) return null;

  // onOpenChange pode ser chamado para fechar (ex.: clicando no overlay)
  return typeof window !== "undefined"
    ? createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => onOpenChange?.(false)}
            data-dialog-overlay
          />
          <div className="relative z-10 w-full max-w-2xl p-4">{children}</div>
        </div>,
        document.body
      )
    : null;
}

export function DialogContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>{children}</div>;
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4 border-b">{children}</div>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-medium">{children}</h3>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <div className="px-6 py-4 border-t flex justify-end gap-2">{children}</div>;
}