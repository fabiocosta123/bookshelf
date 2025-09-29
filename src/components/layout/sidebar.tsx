" use client";

import {
  Home,
  Users,
  Book,
  ClipboardList,
  BarChart3,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SideBar {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Book, label: "Biblioteca", href: "/library" },
  { icon: Users, label: "Usuários", href: "/users" },
  { icon: ClipboardList, label: "Empréstimos", href: "/loans" },
  { icon: BarChart3, label: "Relatórios", href: "/reports" },
  { icon: Settings, label: "Configurações", href: "/settings" },
];

export function Sidebar({ isOpen, onClose }: SideBar) {
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
          </div>
        </div>
      </aside>
    </>
  );
}
