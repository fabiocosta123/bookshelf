"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandItem, CommandList, CommandInput } from "@/components/ui/command";

interface UserOption { id: string; name: string; email?: string; }

export function CreateLoanModal({
  bookId,
  open,
  onOpenChange,
  onCreated,
}: {
  bookId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void;
}) {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [dueDate, setDueDate] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setUsers([]);
      setSelectedUser(null);
      setDueDate("");
      setNotes("");
    }
  }, [open]);

  useEffect(() => {
    let mounted = true;
    async function doSearch() {
      if (!search) {
        setUsers([]);
        return;
      }
      setSearching(true);
      try {
        const res = await fetch(`/api/users?search=${encodeURIComponent(search)}`);
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        setUsers(json.users ?? json ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }
    const t = setTimeout(doSearch, 250);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [search]);

  const handleCreate = async () => {
    if (!selectedUser) {
      toast.error("Selecione um usuário");
      return;
    }
    setLoading(true);
    try {
      const body: any = { bookId, userId: selectedUser.id, userNotes: notes };
      if (dueDate) body.dueDate = dueDate;
      const resp = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await resp.json();
      if (!resp.ok) throw new Error(payload.error || "Erro ao criar empréstimo");
      toast.success("Empréstimo criado com sucesso");
      onOpenChange(false);
      onCreated?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message ?? "Erro ao criar empréstimo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Empréstimo (Admin)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Buscar usuário</Label>
            <Command>
              <CommandInput
                placeholder="Nome, email ou matrícula..."
                value={search}
                onValueChange={(v: string) => setSearch(v)}
              />
              <CommandList>
                {searching && <CommandItem>Buscando...</CommandItem>}
                {!searching && users.length === 0 && <CommandItem>Nenhum usuário</CommandItem>}
                {!searching && users.map((u) => (
                  <CommandItem key={u.id} onSelect={() => setSelectedUser(u)}>
                    <div className="flex flex-col">
                      <span className="font-medium">{u.name}</span>
                      <span className="text-sm text-muted-foreground">{u.email}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
            {selectedUser && (
              <div className="mt-2 text-sm">
                Selecionado: <strong>{selectedUser.name}</strong> {selectedUser.email && `• ${selectedUser.email}`}
              </div>
            )}
          </div>

          <div>
            <Label>Data de devolução (opcional)</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div>
            <Label>Observações (employeeNotes)</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleCreate} disabled={loading}>{loading ? "Criando..." : "Criar Empréstimo"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}