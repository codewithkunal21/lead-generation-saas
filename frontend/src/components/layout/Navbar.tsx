import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Plus, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/dashboard':
        return 'Dashboard Overview';
      case '/scraper':
        return 'Lead Scraper Engine';
      case '/leads':
        return 'Scraped Leads Directory';
      case '/settings':
        return 'Account & API Settings';
      default:
        return 'Dashboard';
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {getPageTitle(location.pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {location.pathname !== '/scraper' && (
          <Link
            to="/scraper"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Scrape</span>
          </Link>
        )}

        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-semibold text-xs">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.full_name || user?.username}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              {user?.is_superuser ? 'Administrator' : 'Standard User'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
