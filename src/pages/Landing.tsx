import { motion } from 'motion/react';
import { Scissors, Calendar, Layout, Globe, ArrowRight, CheckCircle, Smartphone, Zap, Languages } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Landing() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-gold-500 selection:text-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gold-500 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
              <Scissors className="text-black w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight font-serif italic">BarberSite <span className="text-gold-500">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#features" className="hover:text-white transition-colors">{t.nav.features}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{t.nav.pricing}</a>
            <a href="#templates" className="hover:text-white transition-colors">{t.nav.templates}</a>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2 text-sm font-medium hover:text-gold-500 transition-colors px-3 py-2 rounded-xl bg-white/5"
            >
              <Languages className="w-4 h-4" />
              {language === 'en' ? 'العربية' : 'English'}
            </button>
            <Link to="/login" className="text-sm font-medium hover:text-gold-500 transition-colors">{t.nav.login}</Link>
            <Link to="/login" className="bg-gold-500 text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20">{t.nav.getStarted}</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gold-500/10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-gold-500 mb-6 uppercase tracking-widest">
              {t.hero.badge}
            </span>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9] font-serif italic">
              {t.hero.title} <br />
              <span className="text-white/40">{t.hero.subtitle}</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 mb-12 leading-relaxed">
              {t.hero.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto bg-gold-500 text-black px-8 py-4 rounded-full text-lg font-bold hover:scale-105 transition-transform flex items-center justify-center gap-2 group shadow-xl shadow-gold-500/20">
                {t.hero.cta}
                <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${language === 'ar' ? 'rotate-180' : ''}`} />
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-bold border border-white/10 hover:bg-white/5 transition-colors">
                {t.hero.viewTemplates}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-5xl rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm shadow-2xl overflow-hidden">
              <img
                src="https://picsum.photos/seed/barber-dashboard/1200/800"
                alt="Dashboard Preview"
                className="rounded-xl w-full"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Everything you need to succeed</h2>
            <p className="text-white/60 text-lg">Built specifically for the modern barber shop owner.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Layout, title: "Visual Builder", desc: "Choose a template and customize it to match your shop's vibe. No coding required." },
              { icon: Calendar, title: "Booking System", desc: "Let customers book appointments 24/7. Manage your schedule from any device." },
              { icon: Globe, title: "Custom Domain", desc: "Get a professional link for your shop. Easy to share on Instagram and WhatsApp." },
              { icon: Smartphone, title: "Mobile Ready", desc: "Your website will look perfect on every screen, from iPhone to desktop." },
              { icon: Zap, title: "AI Descriptions", desc: "Generate professional shop descriptions and service lists using our AI assistant." },
              { icon: CheckCircle, title: "WhatsApp Integration", desc: "Direct contact button to let customers reach you instantly via WhatsApp." },
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-gold-500/50 transition-all"
              >
                <div className="w-12 h-12 bg-gold-500/20 rounded-2xl flex items-center justify-center mb-6">
                  <f.icon className="text-gold-500 w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-white/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white/5 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 font-serif">Simple, transparent pricing</h2>
          <p className="text-white/60 text-lg mb-16">One plan. Everything included. Cancel anytime.</p>

          <div className="p-12 rounded-[40px] bg-black border border-gold-500/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gold-500 text-black px-6 py-1 text-xs font-bold uppercase tracking-widest rounded-bl-2xl">
              Most Popular
            </div>
            <div className="mb-8">
              <span className="text-6xl font-bold">$19</span>
              <span className="text-white/40 text-xl">/month</span>
            </div>
            <ul className="space-y-4 mb-12 text-left max-w-xs mx-auto">
              {["Unlimited Bookings", "Custom Website Slug", "All Premium Templates", "AI Text Generator", "WhatsApp Integration", "24/7 Support"].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="text-gold-500 w-5 h-5" />
                  <span className="text-white/80">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/login" className="block w-full bg-gold-500 text-black py-4 rounded-full text-lg font-bold hover:bg-gold-400 transition-colors shadow-lg shadow-gold-500/20">
              Start Your 14-Day Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <Scissors className="text-gold-500 w-6 h-6" />
            <span className="text-xl font-bold font-serif italic">BarberSite Pro</span>
          </div>
          <p className="text-white/40 text-sm">© 2026 BarberSite Pro. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
