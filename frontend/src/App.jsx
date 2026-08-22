import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { BookOpen, Compass, LogIn, Sparkles } from 'lucide-react';

import { Button } from './components/ui/button';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';

function App() {
  const location = useLocation();
  const hideNavbar = ['/login', '/dashboard'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {!hideNavbar && (
        <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-lg font-semibold tracking-tight text-foreground">SkillSwap</div>
                <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">University</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              <Link to="/marketplace" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                Marketplace
              </Link>
              <Link to="/dashboard" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                Dashboard
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/marketplace" className="flex items-center gap-2">
                  <Compass className="h-4 w-4" />
                  Explore
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </Button>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Routes>
      </main>

      {!hideNavbar && (
        <footer className="border-t border-border bg-card/60">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              SkillSwap University
            </div>
            <div className="flex items-center gap-3">
              <span>© {new Date().getFullYear()}</span>
              <span className="hidden sm:inline">•</span>
              <span>Built for peer learning</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
