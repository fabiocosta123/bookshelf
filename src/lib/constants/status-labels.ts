import { CANCELLED } from "dns";

export const STATUS_LABELS_PT: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovado",
    ACTIVE: "Ativo",
    RETURNED: "Devolvido",
    OVERDUE: "Atrasado",
    CANCELLED: "Cancelado",
    REJECTED: "Rejeitado"
}