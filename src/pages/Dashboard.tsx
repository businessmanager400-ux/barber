import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { BarberProfile, Booking } from '../types';
import { motion } from 'motion/react';
import { Users, Calendar, TrendingUp, ExternalLink, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const [profile, setProfile] = useState<BarberProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notesCount, setNotesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { language, t } = useLanguage();

  useEffect(() => {
    let subscription: any;

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        // Fetch barber profile
        const { data: barberData } = await supabase
          .from('barbers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (barberData) {
          setProfile(barberData as BarberProfile);
        }

        // Fetch recent bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*')
          .eq('barber_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (bookingsData) {
          setBookings(bookingsData as Booking[]);
        }

        // Fetch initial notes count
        const { count, error: countError } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (!countError) {
          setNotesCount(count || 0);
        }

        // Set up real-time subscription for notes
        subscription = supabase
          .channel('notes_count_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notes',
              filter: `user_id=eq.${user.id}`,
            },
            async () => {
              const { count: newCount } = await supabase
                .from('notes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);
              
              setNotesCount(newCount || 0);
            }
          )
          .subscribe();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  if (loading) return null;

  const stats = [
    { label: t.dashboard.totalBookings, value: bookings.length, icon: Calendar, color: 'text-gold-500', bg: 'bg-gold-500/10' },
    { label: t.dashboard.totalNotes, value: notesCount, icon: FileText, color: 'text-gold-500', bg: 'bg-gold-500/10' },
    { label: t.dashboard.monthlyRevenue, value: '$2,450', icon: TrendingUp, color: 'text-gold-500', bg: 'bg-gold-500/10' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className={`flex-1 ${language === 'ar' ? 'mr-64' : 'ml-64'} p-10`}>
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 font-serif italic">{t.dashboard.welcome}, {profile?.shopName}</h1>
              <p className="text-white/40">{t.dashboard.subtitle}</p>
            </div>
            <a
              href={`/${profile?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gold-500 text-black px-6 py-3 rounded-2xl text-sm font-bold hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/20"
            >
              {t.dashboard.viewLive}
              <ExternalLink className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
            </a>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[32px] bg-white/5 border border-white/10 hover:border-gold-500/30 transition-all group"
              >
                <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`${stat.color} w-6 h-6`} />
                </div>
                <p className="text-white/40 text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold font-serif italic">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white/5 border border-white/10 rounded-[40px] p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">{t.dashboard.recentBookings}</h2>
              <Link to="/bookings" className="text-emerald-500 text-sm font-bold hover:underline">{t.dashboard.viewAll}</Link>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
                <Calendar className="w-12 h-12 text-white/10 mx-auto mb-4" />
                <p className="text-white/40">{t.dashboard.noBookings}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-xl font-bold text-white/20">
                        {booking.customerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{booking.customerName}</h4>
                        <p className="text-white/40 text-sm">{booking.serviceName} • {format(new Date(booking.date), 'MMM d, yyyy')} at {booking.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
                        booking.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                        booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {booking.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-emerald-500/10 rounded-xl transition-colors text-emerald-500">
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-red-500/10 rounded-xl transition-colors text-red-500">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
