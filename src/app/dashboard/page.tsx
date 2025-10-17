"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Book, Users, ClipboardList, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentBooks } from "@/components/dashboard/recent-books";
import { dashboardService } from "@/lib/services/dashboard-service";
import { useAuth } from "@/hooks/use-auth";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Toaster, toast } from "sonner";

interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  activeLoans: number;
  completedLoans: number;
  recentBooks: {
    id: string;
    title: string;
    author: string;
    cover?: string | null;
    reading_status: string;
  }[];
}

interface ReadingStats {
  QUERO_LER?: number;
  LENDO?: number;
  LIDO?: number;
  PAUSADO?: number;
  ABANDONADO?: number;
  totalPagesRead: number;
}

interface DashboardData {
  stats: DashboardStats;
  readingStats: ReadingStats;
}

type LoanListItem = {
  id: string;
  status?: string | null;
  book?: { id?: string; title?: string } | null;
  user?: { id?: string; name?: string; email?: string } | null;
  dueDate?: string | null;
  approvedBy?: { id?: string; name?: string; email?: string } | null;
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  ACTIVE: "Ativo",
  RETURNED: "Devolvido",
  OVERDUE: "Atrasado",
  CANCELLED: "Cancelado",
  REJECTED: "Rejeitado",
};

const STATUS_CLASSES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-blue-100 text-blue-800",
  ACTIVE: "bg-green-100 text-green-800",
  RETURNED: "bg-gray-100 text-gray-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  REJECTED: "bg-red-100 text-red-800",
};

export default function Dashboard() {
  useRequireAuth();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeLoans, setActiveLoans] = useState<LoanListItem[] | null>(null);
  const [completedLoans, setCompletedLoans] = useState<LoanListItem[] | null>(
    null
  );
  const [overdueLoans, setOverdueLoans] = useState<LoanListItem[] | null>(null);
  const [loansLoading, setLoansLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    let mounted = true;
    async function loadDashboardStats() {
      setLoading(true);
      try {
        const [stats, readingStats] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getReadingStats(),
        ]);
        if (!mounted) return;
        setData({ stats, readingStats });
      } catch (error: any) {
        console.error("Erro ao carregar dashboard:", error);
        toast.error(error?.message ?? "Erro ao carregar dados do Dashboard");
        if (!mounted) return;
        setData(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    loadDashboardStats();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchJson(url: string) {
      const res = await fetch(url, {
        cache: "no-store",
        credentials: "same-origin",
        signal,
      });
      return res.ok ? await res.json() : [];
    }

    async function loadLoanLists() {
      setLoansLoading(true);
      try {
        const [
          activeJson,
          approvedJson,
          returnedJson,
          rejectedJson,
          cancelledJson,
          overdueJson,
        ] = await Promise.all([
          fetchJson("/api/loans?status=ACTIVE&size=6"),
          fetchJson("/api/loans?status=APPROVED&size=6"),
          fetchJson("/api/loans?status=RETURNED&size=6"),
          fetchJson("/api/loans?status=REJECTED&size=6"),
          fetchJson("/api/loans?status=CANCELLED&size=6"),
          fetchJson("/api/loans?status=OVERDUE&size=6"),
        ]);

        const activeList: LoanListItem[] = Array.isArray(activeJson)
          ? activeJson
          : activeJson?.loans ?? [];
        const approvedList: LoanListItem[] = Array.isArray(approvedJson)
          ? approvedJson
          : approvedJson?.loans ?? [];

        // combinar ACTIVE + APPROVED removendo duplicatas
        const combinedActive = [
          ...activeList,
          ...approvedList.filter((a) => !activeList.some((x) => x.id === a.id)),
        ].slice(0, 6);

        const returnedList: LoanListItem[] = Array.isArray(returnedJson)
          ? returnedJson
          : returnedJson?.loans ?? [];
        const rejectedList: LoanListItem[] = Array.isArray(rejectedJson)
          ? rejectedJson
          : rejectedJson?.loans ?? [];
        const cancelledList: LoanListItem[] = Array.isArray(cancelledJson)
          ? cancelledJson
          : cancelledJson?.loans ?? [];
        const overdueList: LoanListItem[] = Array.isArray(overdueJson)
          ? overdueJson
          : overdueJson?.loans ?? [];

        // combinar finalizados (RETURNED, REJECTED, CANCELLED) sem duplicatas
        const combinedCompleted = [
          ...returnedList,
          ...rejectedList.filter(
            (r) => !returnedList.some((x) => x.id === r.id)
          ),
          ...cancelledList.filter(
            (c) =>
              !returnedList.some((x) => x.id === c.id) &&
              !rejectedList.some((x) => x.id === c.id)
          ),
        ].slice(0, 6);

        // atualizar apenas as listas que sua UI já consome
        setActiveLoans(combinedActive);
        setCompletedLoans(combinedCompleted);
        setOverdueLoans(overdueList.slice(0, 6));
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Erro ao carregar listas de empréstimos:", err);
        toast.error("Erro ao carregar listas de empréstimos");
        setActiveLoans([]);
        setCompletedLoans([]);
        setOverdueLoans([]);
      } finally {
        setLoansLoading(false);
      }
    }

    loadLoanLists();
    return () => controller.abort();
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    function onStatsUpdated(e: Event) {
      try {
        const custom = e as CustomEvent<DashboardStats>;
        const newStats = custom.detail;
        if (!newStats) return;
        setData((prev) => {
          if (!prev)
            return {
              stats: newStats,
              readingStats: (prev as any)?.readingStats ?? ({} as ReadingStats),
            };
          return { ...prev, stats: newStats };
        });
      } catch (err) {
        console.error(
          "dashboard: erro ao processar evento dashboard:stats:updated",
          err
        );
      }
    }

    window.addEventListener(
      "dashboard:stats:updated",
      onStatsUpdated as EventListener
    );
    return () =>
      window.removeEventListener(
        "dashboard:stats:updated",
        onStatsUpdated as EventListener
      );
  }, []);

  if (authLoading || loading || loansLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Erro ao carregar dados do dashboard.</p>
      </div>
    );
  }

  return (
    <div>
      <Toaster position="top-right" richColors closeButton />

      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          {user ? `Bem-vindo, ${user.name}! ` : ""}Visão geral da sua biblioteca
          pessoal de livros.
        </p>

        {user && (
          <div className="mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === "ADMIN"
                  ? "bg-red-100 text-red-800"
                  : user.role === "EMPLOYEE"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {user.role === "ADMIN"
                ? "Administrador"
                : user.role === "EMPLOYEE"
                ? "Funcionário"
                : "Cliente"}
            </span>
          </div>
        )}
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total de Livros"
          value={data.stats.totalBooks}
          icon={Book}
          description="Na sua biblioteca"
          color="blue"
        />
        <StatsCard
          title="Usuários Cadastrados"
          value={data.stats.totalUsers}
          icon={Users}
          description="No sistema"
          color="green"
        />
        <StatsCard
          title="Livros Emprestados"
          value={data.stats.activeLoans}
          icon={ClipboardList}
          description="Atualmente Emprestados"
          color="purple"
        />
        <StatsCard
          title="Livros Devolvidos"
          value={data.stats.completedLoans}
          icon={CheckCircle}
          description="Total de Devoluções"
          color="orange"
        />
      </div>

      {/* Conteúdo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status de Leitura */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-4">Status de Leitura</h2>
          <div className="space-y-3">
            {Object.entries(data.readingStats).map(([status, count]) => {
              if (status === "totalPagesRead") return null;
              return (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {status.toLowerCase().replace("_", " ")}
                  </span>
                  <span className="font-semibold">{count}</span>
                </div>
              );
            })}

            {/* Páginas Lidas */}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm text-gray-600">Páginas Lidas</span>
              <span className="font-semibold">
                {data.readingStats.totalPagesRead}
              </span>
            </div>
          </div>
        </div>

        {/* Livros Recentes */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-4">Livros Recentes</h2>
          <RecentBooks books={data.stats.recentBooks} />
        </div>
      </div>

      {/* Empréstimos Ativos / Finalizados / Atrasados - esse trecho de código deve estar na pagina de relatorios*/}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4">Empréstimos Ativos</h3>
          {activeLoans && activeLoans.length > 0 ? (
            <ul className="space-y-3">
              {activeLoans.slice(0, 3).map((loan) => (
                <li
                  key={loan.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {loan.book?.title ?? "Título indisponível"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Solicitado por{" "}
                      {loan.user?.name ?? loan.user?.email ?? "—"}
                      {loan.dueDate
                        ? ` • Devolução: ${new Date(
                            loan.dueDate
                          ).toLocaleDateString("pt-BR")}`
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        STATUS_CLASSES[loan.status ?? ""] ??
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {STATUS_LABELS[loan.status ?? ""] ?? loan.status ?? "—"}
                    </span>
                    <Link
                      href={`/loans/${loan.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Detalhes
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-600">
              Nenhum empréstimo ativo recente.
            </div>
          )}
        </div>

        {/* Empréstimos Devolvidos (últimos 3) */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4">Empréstimos Devolvidos</h3>
          {completedLoans &&
          completedLoans.some((l) => l.status === "RETURNED") ? (
            <ul className="space-y-3">
              {completedLoans
                .filter((loan) => loan.status === "RETURNED")
                .slice(0, 3)
                .map((loan) => (
                  <li
                    key={loan.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-medium">
                        {loan.book?.title ?? "Título indisponível"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Solicitado por{" "}
                        {loan.user?.name ?? loan.user?.email ?? "—"}
                        {loan.dueDate
                          ? ` • Devolução: ${new Date(
                              loan.dueDate
                            ).toLocaleDateString("pt-BR")}`
                          : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          STATUS_CLASSES[loan.status ?? ""] ??
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {STATUS_LABELS[loan.status ?? ""] ?? loan.status ?? "—"}
                      </span>
                      <Link
                        href={`/loans/${loan.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Detalhes
                      </Link>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-600">
              Nenhum empréstimo devolvido recente.
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h3 className="text-lg font-semibold mb-4">Empréstimos Atrasados</h3>
          {overdueLoans && overdueLoans.length > 0 ? (
            <ul className="space-y-3">
              {overdueLoans.map((loan) => (
                <li
                  key={loan.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {loan.book?.title ?? "Título indisponível"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Solicitado por{" "}
                      {loan.user?.name ?? loan.user?.email ?? "—"}
                      {loan.dueDate
                        ? ` • Devolução: ${new Date(
                            loan.dueDate
                          ).toLocaleDateString("pt-BR")}`
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        STATUS_CLASSES[loan.status ?? ""] ??
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {STATUS_LABELS[loan.status ?? ""] ?? loan.status ?? "—"}
                    </span>
                    <Link
                      href={`/loans/${loan.id}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Detalhes
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-600">
              Nenhum empréstimo atrasado recente.
            </div>
          )}
        </div>
      </div>

      {/* Mensagem de boas-vindas */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-xl font-semibold mb-4">
          {user
            ? `Bem-vindo de volta, ${user.name}!`
            : "Bem-vindo ao BookShelf!"}
        </h2>
        <p className="text-gray-600 mb-4">
          {user?.role === "ADMIN"
            ? "Como administrador, você tem acesso completo a todas as funcionalidades do sistema."
            : user?.role === "EMPLOYEE"
            ? "Como funcionário, você pode gerenciar livros e empréstimos do sistema."
            : "Como cliente, você pode explorar nossa biblioteca e fazer observações nos livros."}
        </p>
        <div className="flex items-center text-sm text-gray-500">
          <span>Email: {user?.email}</span>
        </div>
      </div>
    </div>
  );
}
