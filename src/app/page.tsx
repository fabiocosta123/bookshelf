// app/page.tsx
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        
        {/* Header - Otimizado para mobile */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            📚 BookShelf
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-md sm:max-w-xl md:max-w-2xl mx-auto px-2">
            Sistema moderno para gerenciamento de sua biblioteca pessoal
          </p>
        </div>

        {/* Status do Sistema - Mobile First */}
        <div className="bg-white rounded-lg shadow-sm sm:shadow-md p-4 sm:p-6 md:p-8 max-w-full sm:max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Status do Sistema
          </h2>
          
          {/* Grid responsivo - 1 coluna mobile, 3 desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="text-xl sm:text-2xl mb-1">✅</div>
              <div className="font-medium text-gray-700 text-sm sm:text-base">Backend</div>
              <div className="text-xs sm:text-sm text-gray-500">Pronto</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-xl sm:text-2xl mb-1">🚀</div>
              <div className="font-medium text-gray-700 text-sm sm:text-base">Frontend</div>
              <div className="text-xs sm:text-sm text-gray-500">Em Desenvolvimento</div>
            </div>
            
            <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg border border-purple-100">
              <div className="text-xl sm:text-2xl mb-1">⚡</div>
              <div className="font-medium text-gray-700 text-sm sm:text-base">Database</div>
              <div className="text-xs sm:text-sm text-gray-500">SQLite + Prisma</div>
            </div>
          </div>

          {/* Lista de funcionalidades - Mobile friendly */}
          <div className="text-left bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
              Próximas Funcionalidades:
            </h3>
            <ul className="text-gray-600 text-xs sm:text-sm space-y-1">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Cadastro de livros e usuários</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Sistema de empréstimos inteligente</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Notificações de devolução</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Dashboard com estatísticas</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                <span>Busca integrada com Google Books API</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Botão - Mobile First */}
        <div className="space-y-3 max-w-full sm:max-w-md mx-auto px-2">
          <Link 
            href="/dashboard" 
            className="block w-full bg-blue-600 text-white py-3 px-4 sm:py-3 sm:px-6 rounded-lg font-medium hover:bg-blue-700 transition duration-200 text-sm sm:text-base text-center"
          >
            Acessar Dashboard (Em Breve)
          </Link>
          
          <div className="text-xs sm:text-sm text-gray-500 text-center">
            Sistema em desenvolvimento • Versão 1.0
          </div>
        </div>

      </div>
    </div>
  );
}