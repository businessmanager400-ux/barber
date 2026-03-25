import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Booking } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Clock, Phone, User, Calendar as CalendarIcon, Filter, Scissors } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';

export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('barber_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setBookings(data as Booking[]);
      }
      setLoading(false);

      // Real-time subscription
      const subscription = supabase
        .channel('bookings_changes')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `barber_id=eq.${user.id}`
        }, (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookings(prev => [payload.new as Booking, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setBookings(prev => prev.map(b => b.id === payload.new.id ? payload.new as Booking : b));
          } else if (payload.eventType === 'DELETE') {
            setBookings(prev => prev.filter(b => b.id !== payload.old.id));
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    };

    fetchBookings();
  }, []);

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className={`flex-1 ${language === 'ar' ? 'mr-64' : 'ml-64'} p-10`}>
        <div className="max-w-6xl mx-auto">
          <header className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 font-serif italic">{t.bookings.title}</h1>
              <p className="text-white/40">{t.bookings.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10">
              {['all', 'pending', 'approved', 'rejected'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    filter === f ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {t.bookings[f as keyof typeof t.bookings] || f}
                </button>
              ))}
            </div>
          </header>

          <div className="grid gap-4">
            <AnimatePresence mode="popLayout">
              {filteredBookings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-32 bg-white/[0.02] rounded-[40px] border border-dashed border-white/10"
                >
                  <CalendarIcon className="w-16 h-16 text-white/10 mx-auto mb-6" />
                  <p className="text-white/40 text-lg">{t.bookings.noBookings}</p>
                </motion.div>
              ) : (
                filteredBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group bg-white/5 border border-white/10 rounded-[32px] p-8 flex items-center justify-between hover:border-gold-500/30 transition-all"
                  >
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-2xl font-bold text-white/20 group-hover:bg-gold-500/10 group-hover:text-gold-500 transition-colors">
                        {booking.customerName.charAt(0)}
                      </div>
                      <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gold-500/40" />
                          <span className="font-bold">{booking.customerName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gold-500/40" />
                          <span className="text-white/60">{booking.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Scissors className="w-4 h-4 text-gold-500/40" />
                          <span className="text-white/60">{booking.serviceName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CalendarIcon className="w-4 h-4 text-gold-500/40" />
                          <span className="text-white/60">{format(new Date(booking.date), 'MMM d, yyyy')} at {booking.time}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${
                        booking.status === 'approved' ? 'bg-gold-500/10 text-gold-500' :
                        booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {t.bookings[booking.status as keyof typeof t.bookings] || booking.status}
                      </span>
                      
                      {booking.status === 'pending' && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateStatus(booking.id!, 'approved')}
                            className="flex items-center gap-2 bg-gold-500 text-black px-6 py-2.5 rounded-xl text-sm font-bold hover:scale-105 transition-all shadow-lg shadow-gold-500/20"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {t.bookings.approve}
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id!, 'rejected')}
                            className="flex items-center gap-2 bg-white/5 text-red-500 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500/10 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                            {t.bookings.reject}
                          </button>
                        </div>
                      )}

                      {booking.status !== 'pending' && (
                        <button
                          onClick={() => updateStatus(booking.id!, 'pending')}
                          className="text-xs font-bold text-white/20 hover:text-white transition-colors"
                        >
                          {t.bookings.reset}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
