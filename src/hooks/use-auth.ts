import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user;
  const isAuthenticated = !!user;
  const isLoading = status === 'loading';

  // Funções para verificar roles
  const isClient = user?.role === 'CLIENT';
  const isEmployee = user?.role === 'EMPLOYEE';
  const isAdmin = user?.role === 'ADMIN';
  
  // Verificar permissões
  const canManageBooks = isEmployee || isAdmin;
  const canManageUsers = isAdmin;
  const canViewReports = isEmployee || isAdmin;

  return {
    // Dados do usuário
    user,
    
    // Status
    isAuthenticated,
    isLoading,
    status,
    
    // Roles específicas
    isClient,
    isEmployee,
    isAdmin,
    
    // Permissões
    canManageBooks,
    canManageUsers,
    canViewReports,
    
    // Helper para verificar múltiplas roles
    hasRole: (roles: string[]) => {
      if (!user?.role) return false;
      return roles.includes(user.role);
    }
  };
}