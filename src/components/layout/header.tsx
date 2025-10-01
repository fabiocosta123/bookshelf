"use client";

import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuClick: () => void;
  user?: {
    name: string;
    email: string;
    image?: string;
    role: string;
  }
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu button and logo */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="mr-2 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <span className="text-2xl mr-2">📚</span>
              <h1 className="text-xl font-bold text-gray-900">BookShelf</h1>
            </div>
          </div>

          {/* Right side - Notifications and user */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </Button>

            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
