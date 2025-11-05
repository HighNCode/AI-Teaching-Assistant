import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, LogOut, BookOpenText, UserCircle } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
            <BookOpenText className="h-6 w-6" />
            <span>AI Teaching Assistant</span>
          </Link>
          <nav className="flex items-center gap-4">
            {user && (
              <>
                <Link to="/dashboard" className="flex items-center gap-1 text-sm font-medium hover:text-primary">
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link to="/profile" className="flex items-center gap-1 text-sm font-medium hover:text-primary">
                  <UserCircle className="h-4 w-4" />
                  Profile
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="flex items-center gap-1">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <footer className="border-t bg-card py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} AI Teaching Assistant. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;