"use client";
import React from "react";

export function Dialog({ children, open, onOpenChange }: any) {
  // Componente wrapper simples; shadcn tem <Dialog> controlando portal/overlay.
  return <div data-dialog-root>{children}</div>;
}

export function DialogContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">{children}</div>
    </div>
  );
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