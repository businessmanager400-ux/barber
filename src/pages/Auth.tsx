import { useState } from 'react';
import { motion } from 'motion/react';
import { Scissors, Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        if (data.session) {
          navigate('/dashboard');
        }
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
            data: {
              full_name: name,
              shop_name: name || 'My Barber Shop',
            }
          }
        });
        if (signUpError) throw signUpError;
        
        // If a session was created (auto-login), sign out to respect "Do NOT auto-login"
        if (data.session) {
          await supabase.auth.signOut();
        }

        setSuccessMsg(language === 'ar' 
          ? "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتأكيد حسابك ثم قم بتسجيل الدخول."
          : "Account created successfully! Please check your email to confirm your account, then sign in.");
        
        setIsLogin(true);
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-black text-white flex items-center justify-center p-6 font-sans ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-gold-500/20">
            <Scissors className="text-black w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 font-serif italic">
            {isLogin ? t.auth.welcomeBack : t.auth.join}
          </h1>
          <p className="text-white/40">
            {isLogin ? t.auth.loginSubtitle : t.auth.signupSubtitle}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleAuth} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-widest text-white/40 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.auth.shopName}</label>
                <div className="relative">
                  <User className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-white/20`} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 ${language === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} focus:border-gold-500 outline-none transition-colors`}
                    placeholder={t.auth.shopPlaceholder}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-widest text-white/40 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.auth.email}</label>
              <div className="relative">
                <Mail className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-white/20`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 ${language === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} focus:border-gold-500 outline-none transition-colors`}
                  placeholder={t.auth.emailPlaceholder}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-widest text-white/40 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.auth.password}</label>
              <div className="relative">
                <Lock className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-white/20`} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 ${language === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} focus:border-gold-500 outline-none transition-colors`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {successMsg && <p className="text-gold-400 text-sm text-center font-medium">{successMsg}</p>}

            <button
              disabled={loading}
              className="w-full bg-gold-500 text-black py-4 rounded-2xl font-bold hover:bg-gold-400 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg shadow-gold-500/20"
            >
              {loading ? t.auth.processing : isLogin ? t.auth.login : t.auth.signup}
              {!loading && <ArrowRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest">
              <span className="bg-black/5 px-4 text-white/40">{t.auth.orContinue}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3 rounded-2xl hover:bg-white/10 transition-colors disabled:opacity-50 w-full"
            >
              <Chrome className="w-5 h-5" />
              <span className="text-sm font-medium">Google</span>
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-white/40 text-sm">
          {isLogin ? t.auth.noAccount : t.auth.hasAccount}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccessMsg('');
            }}
            className="text-emerald-500 font-bold hover:underline"
          >
            {isLogin ? t.auth.signUpLink : t.auth.loginLink}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
