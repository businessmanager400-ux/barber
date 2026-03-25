import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Globe, Calendar, Settings, LogOut, Scissors, User, Languages } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: t.dashboard.recentBookings, path: '/dashboard' },
    { icon: Globe, label: t.editor.title, path: '/editor' },
    { icon: Calendar, label: t.bookings.title, path: '/bookings' },
    { icon: User, label: t.profile.title, path: '/profile' },
    { icon: Settings, label: t.settings.title, path: '/settings' },
  ];

  return (
    <div className={`w-64 bg-black ${language === 'ar' ? 'border-l' : 'border-r'} border-white/5 flex flex-col h-screen fixed ${language === 'ar' ? 'right-0' : 'left-0'} top-0 z-50`}>
      <div className={`p-8 flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
        <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
          <Scissors className="text-black w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white font-serif italic">BarberSite</span>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                language === 'ar' ? 'flex-row-reverse text-right' : ''
              } ${
                isActive
                   ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20'
                   : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-black' : 'text-white/40'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2">
        <button 
          onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
          className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all ${
            language === 'ar' ? 'flex-row-reverse text-right' : ''
          }`}
        >
          <Languages className="w-5 h-5" />
          {language === 'en' ? 'العربية' : 'English'}
        </button>
        <button
          onClick={handleLogout}
          className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-2xl text-sm font-semibold text-red-400 hover:bg-red-400/10 transition-all ${
            language === 'ar' ? 'flex-row-reverse text-right' : ''
          }`}
        >
          <LogOut className="w-5 h-5" />
          {t.settings.logout}
        </button>
      </div>
    </div>
  );
}
