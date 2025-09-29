export default function Dashboard() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Visão geral da sua biblioteca pessoal de livros.
                </p>
            </div>

            {/* Estatisticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="bg-white rounded-lg shadow-sm p-6 border">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Conteudo */}
            <div className="bg-white rounded-lg shadow-sm p-6 border">
                <h2 className="text-xl font-semibold mb-4"> Bem vindo ao BooKShelf!</h2>
                <p className="text-gray-600">
                    Em breve dashboard completo com suas estatísticas e atividades recentes.
                </p>

            </div>
        </div>
    )
}