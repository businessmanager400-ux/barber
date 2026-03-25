import Sidebar from '../components/Sidebar';
import { CreditCard, Bell, Shield, Globe, HelpCircle, Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Settings() {
  const { language, setLanguage, t } = useLanguage();

  const sections = [
    { icon: CreditCard, title: 'Subscription', desc: 'Manage your monthly plan and billing.', action: 'Manage Plan' },
    { icon: Bell, title: 'Notifications', desc: 'Configure booking alerts and emails.', action: 'Configure' },
    { icon: Shield, title: 'Security', desc: 'Two-factor authentication and login history.', action: 'Setup' },
    { icon: Globe, title: 'Domain', desc: 'Connect your own custom domain.', action: 'Connect' },
    { icon: HelpCircle, title: 'Support', desc: 'Get help with your shop or booking system.', action: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className={`flex-1 ${language === 'ar' ? 'mr-64' : 'ml-64'} p-10`}>
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-serif italic">{t.settings.title}</h1>
            <p className="text-white/40">{t.settings.subtitle}</p>
          </header>

          <div className="grid gap-6">
            {/* Language Selection Section */}
            <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex items-center justify-between hover:border-gold-500/30 transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-gold-500/10 group-hover:text-gold-500 transition-colors">
                  <Languages className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{t.settings.language}</h3>
                  <p className="text-white/40 text-sm">{t.settings.selectLanguage}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-black/40 p-1 rounded-2xl border border-white/10">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    language === 'en' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-white/40 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    language === 'ar' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-white/40 hover:text-white'
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>

            {sections.map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex items-center justify-between hover:border-gold-500/30 transition-all group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-gold-500/10 group-hover:text-gold-500 transition-colors">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">{s.title}</h3>
                    <p className="text-white/40 text-sm">{s.desc}</p>
                  </div>
                </div>
                <button className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gold-500/10 hover:text-gold-500 hover:border-gold-500/30 transition-all">
                  {s.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
