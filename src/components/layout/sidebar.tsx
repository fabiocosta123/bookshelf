'use client';

import {
  Home,
  Users,
  Book,
  ClipboardList,
  BarChart3,
  Settings,
  Download
} from "lucide-react";


import { usePathname } from "next/navigation";


interface SideBar {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

// Menu base - Todos podem ver
const baseMenuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", roles: ["CLIENT", "EMPLOYEE", "ADMIN"]},
  { icon: Book, label: "Biblioteca", href: "/books", roles: ["CLIENT", "EMPLOYEE", "ADMIN"] },
  { icon: ClipboardList, label: "Empréstimos", href: "/loans", roles: ["CLIENT", "EMPLOYEE", "ADMIN"] },
]

// Menu apenas para funcionários e admin
const adminMenuItems = [
  { icon: Users, label: "Usuários", href: "/users", roles: ["EMPLOYEE", "ADMIN"] },
  { icon: BarChart3, label: "Relatórios", href: "/reports", roles: ["EMPLOYEE", "ADMIN"] },
  { icon: Download, label: "Importar Livros", href: "/books/import", roles: ["EMPLOYEE", "ADMIN"] }, // ← NOVO ITEM
  { icon: Settings, label: "Configurações", href: "/settings", roles: ["EMPLOYEE", "ADMIN"] },
];



export function Sidebar({ isOpen, onClose, userRole }: SideBar) {
  const pathname = usePathname();

   // Filtra os itens do menu baseado no role do usuário
  const menuItems = [
    ...baseMenuItems.filter(item => item.roles.includes(userRole || "CLIENT")),
    ...adminMenuItems.filter(item => item.roles.includes(userRole || "CLIENT"))
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Logo area */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="flex items-center">
            <span className="text-2xl mr-2">📚</span>
            <span className="text-lg font-semibold">BookShelf</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex items-center p-2 text-sm rounded-md hover:bg-gray-100 transition-colors w-full"
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Stats preview */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <div className="font-semibold">Sistema Online</div>
            <div className="text-xs text-green-600">● Conectado</div>
            {userRole && (
              <div className="text-xs text-blue-600 mt-1">Usuário: {userRole}</div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
