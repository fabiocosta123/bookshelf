// Client-side service - usa fetch para APIs
export const dashboardService = {
  async getDashboardStats() {
    const response = await fetch('/api/dashboard/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas do dashboard');
    }

    return response.json();
  },

  async getReadingStats() {
    const response = await fetch('/api/dashboard/reading-stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar estatísticas de leitura');
    }

    return response.json();
  },
};