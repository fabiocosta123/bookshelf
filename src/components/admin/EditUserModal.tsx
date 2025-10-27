"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { X, User, Save, Mail, Phone, IdCard } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "CLIENT" | "EMPLOYEE" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  phone?: string;
  registration_number?: string;
}

interface EditUserModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

export function EditUserModal({
  user,
  open,
  onOpenChange,
  onUserUpdated,
}: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    registration_number: "",
    role: "CLIENT" as "CLIENT" | "EMPLOYEE" | "ADMIN",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "SUSPENDED",
  });

  // preencher form quando usuário mudar
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        registration_number: user.registration_number || "",
        role: user.role,
        status: user.status,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao atualizar usuário");
      }

      toast.success("Usuário atualizado com sucesso!");
      onUserUpdated();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao atualizar usuário:", error);
      toast.error(error.message || "Erro ao atualizar usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">Editar Usuário</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* formulário */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Foto e nome */}
            <div className="flex items-center gap-4 mb-4">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-12 w-12 rounded-full"
                />
              ) : (
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              )}
              <div className="flex-1">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* email */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h4-w-4" />
                Email
              </Label>

              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>

            {/* telefone */}
            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h4-w-4" />
                Telefone
              </Label>

              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(00) 0000-0000"
              />
            </div>

            {/* matrícula */}
            <div>
              <Label
                htmlFor="registration_number"
                className="flex items-center gap-2"
              >
                <IdCard className="h4-w-4" />
                Matrícula
              </Label>

              <Input
                id="registration_number"
                value={formData.registration_number}
                onChange={(e) =>
                  handleChange("registration_number", e.target.value)
                }
              />
            </div>

            {/* Role */}
            <div>
              <Label htmlFor="role">Tipo de Usuário</Label>
              <select
                id=""
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="CLIENT">Cliente</option>
                <option value="EMPLOYEE">Funcionário</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id=""
                value={formData.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg
                              focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="SUSPENDED">Suspenso</option>
              </select>
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
