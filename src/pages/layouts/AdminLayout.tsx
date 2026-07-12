import { useState } from 'react';
import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Stethoscope, 
  Clock, 
  CalendarOff, 
  Settings, 
  LogOut,
  BookOpen,
  HelpCircle,
  MessageSquare,
  Shield,
  Menu,
  X,
  Stethoscope as ClinicIcon
} from 'lucide-react';

export default function AdminLayout() {
  const { user, isAdmin, isLoading, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard },
    { name: 'Appointments', path: '/admin/appointments', icon: CalendarDays },
    { name: 'Services', path: '/admin/services', icon: Stethoscope },
    { name: 'Business Hours', path: '/admin/hours', icon: Clock },
    { name: 'Blocked Dates', path: '/admin/blocked-dates', icon: CalendarOff },
    { name: 'Blogs (CMS)', path: '/admin/blogs', icon: BookOpen },
    { name: 'FAQs (CMS)', path: '/admin/faqs', icon: HelpCircle },
    { name: 'Reviews (CMS)', path: '/admin/testimonials', icon: MessageSquare },
    { name: 'Legal Policies', path: '/admin/policies', icon: Shield },
    { name: 'Clinic Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for PC */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-teal-700">
            <div className="bg-teal-50 p-2 rounded-lg">
              <ClinicIcon size={24} />
            </div>
            <span className="font-semibold text-lg tracking-tight">Admin Portal</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors mb-4 border border-slate-200"
          >
            <ClinicIcon size={20} />
            View Live Website
          </a>
          
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Management</div>
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-slate-50">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
              {user.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                Admin
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-teal-700">
            <div className="bg-teal-50 p-1.5 rounded-lg">
              <ClinicIcon size={20} />
            </div>
            <span className="font-semibold text-base tracking-tight">Admin Portal</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors mb-4 border border-slate-200"
          >
            <ClinicIcon size={18} />
            View Live Website
          </a>
          
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Management</div>
          
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-teal-50 text-teal-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white border border-slate-100 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {user.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                Admin
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              logout();
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 -ml-1 rounded-lg text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 text-teal-700">
              <ClinicIcon size={22} />
              <span className="font-semibold text-base tracking-tight">Admin Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Live Site
            </a>
            <button 
              onClick={logout} 
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto w-full">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
