import { Routes, Route, Link } from 'react-router-dom';
import { BookOpen, LogIn, LayoutDashboard } from 'lucide-react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                <BookOpen className="text-purple-600 h-8 w-8" />
                SkillSwap
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/marketplace" className="text-slate-600 hover:text-purple-600 px-3 py-2 rounded-md font-medium transition-colors">Marketplace</Link>
              <Link to="/dashboard" className="text-slate-600 hover:text-purple-600 px-3 py-2 rounded-md font-medium flex items-center gap-2 transition-colors">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link to="/login" className="bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-full font-medium flex items-center gap-2 transition-all shadow-md shadow-purple-600/20 hover:shadow-lg hover:shadow-purple-600/40">
                <LogIn className="h-4 w-4" /> Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Routes>
      </main>
      
      <footer className="bg-white border-t border-slate-200 mt-auto py-8 text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} SkillSwap University. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
