"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Book, Shield } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"reader" | "admin">("reader");
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      setIsLoading(true);

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Email ou senha inválidos");
        return;
      }

      // verifica a sessão para  redirecionamento correto
      const session = await getSession();

      if (session?.user) {
        toast.success("Login realizado com sucesso!");

        // redireciona baseado no usuario
        if (session?.user.role === "CLIENT") {
          router.push("/books");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error) {
      console.error("Erro no login:", error);
      toast.error("Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signIn("google", { callbackUrl: "/books" });
    } catch (error) {
      console.error("Erro no login Google:", error);
      toast.error("Erro ao fazer login com Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Book className="h-8 w-8 text-white mr-2" />
            <span className="text-2xl font-bold text-white">BookShelf</span>
          </div>
          <p className="text-blue-100">
            Sistema de Gerenciamento de Biblioteca
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("reader")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === "reader"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Book className="h-5 w-5 inline mr-2" />
            Leitor
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
              activeTab === "admin"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Shield className="h-5 w-5 inline mr-2" />
            Administrador
          </button>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="p-8">
          {activeTab === "reader" ? (
            // Login para Leitores (Google OAuth)
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Entrar como Leitor
              </h2>
              <p className="text-gray-600 mb-8">
                Acesse com sua conta Google para explorar nossa biblioteca
              </p>

              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img src="/google.svg" alt="Google" className="w-5 h-5" />
                <span className="font-medium text-gray-700">
                  {isLoading ? "Entrando..." : "Continuar com Google"}
                </span>
              </button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Para leitores:</strong> Use sua conta Google para
                  acessar o sistema e solicitar empréstimos de livros.
                </p>
              </div>
            </div>
          ) : (
            // Login para Administradores (Email/Senha)
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Acesso Administrativo
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Use suas credenciais de administrador
              </p>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@biblioteca.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha"
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? "Entrando..." : "Entrar como Administrador"}
                </button>
              </form>

              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Acesso Restrito:</strong> Esta área é para
                  {activeTab === "admin"
                    ? " administradores e funcionários"
                    : " leitores"}
                  do sistema.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
