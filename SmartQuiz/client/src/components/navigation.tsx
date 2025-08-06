import { Link, useLocation } from "wouter";
import { FileText, Library, Settings, Bell, User, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { logout } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import LoginModal from "@/components/auth/login-modal";

export default function Navigation() {
  const [location] = useLocation();
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navItems = [
    { href: "/", label: "Quiz Generator", icon: FileText },
    { href: "/library", label: "My Quizzes", icon: Library },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <FileText className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-semibold text-slate-800">SmartDocs</span>
              </div>
              <div className="hidden md:flex space-x-6">
                {navItems.map((item) => {
                  const isActive = location === item.href || 
                    (item.href !== "/" && location.startsWith(item.href));
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={
                        isActive
                          ? "text-primary font-medium border-b-2 border-primary py-2"
                          : "text-slate-600 hover:text-slate-900 py-2 transition-colors"
                      }
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-slate-600 hover:text-slate-900">
                <Bell className="w-5 h-5" />
              </button>
              
              {loading ? (
                <div className="w-8 h-8 bg-slate-300 rounded-full animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                        <AvatarFallback>
                          {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLoginModal(true)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <LoginModal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
}
