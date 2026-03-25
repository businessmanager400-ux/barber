import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarberProfile, BarberService } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Scissors, MapPin, Clock, Phone, Instagram, Facebook, Calendar, X, CheckCircle, ChevronRight } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';
import { getSignedUrl } from '../lib/storage';

export default function PublicSite() {
  const { slug } = useParams();
  const [barber, setBarber] = useState<BarberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedService, setSelectedService] = useState<BarberService | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [logoSignedUrl, setLogoSignedUrl] = useState<string | null>(null);
  const [coverSignedUrl, setCoverSignedUrl] = useState<string | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchBarber = async () => {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) {
        const barberData = data as BarberProfile;
        setBarber(barberData);

        // Fetch signed URLs
        if (barberData.logoUrl) {
          const url = await getSignedUrl(barberData.logoUrl);
          setLogoSignedUrl(url);
        }
        if (barberData.coverUrl) {
          const url = await getSignedUrl(barberData.coverUrl);
          setCoverSignedUrl(url);
        }
      }
      setLoading(false);
    };
    fetchBarber();
  }, [slug]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!barber || !selectedService || !selectedTime) return;

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          barber_id: barber.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          service_id: selectedService.id,
          service_name: selectedService.name,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          status: 'pending'
        });

      if (error) throw error;

      setBookingSuccess(true);
      setTimeout(() => {
        setShowBooking(false);
        setBookingSuccess(false);
        setSelectedService(null);
        setSelectedTime('');
        setCustomerName('');
        setCustomerPhone('');
      }, 3000);
    } catch (error) {
      console.error("Error creating booking:", error);
    }
  };

  if (loading) return null;
  if (!barber) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Shop not found</div>;

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className={`min-h-screen bg-black text-white font-sans ${barber.templateId === 'luxury' ? 'font-serif' : ''} ${language === 'ar' ? 'rtl' : 'ltr'}`}>
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img
          src={coverSignedUrl || "https://picsum.photos/seed/barber-shop/1920/1080"}
          alt={barber.shopName}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="relative text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            {logoSignedUrl ? (
              <img src={logoSignedUrl} alt="Logo" className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-gold-500/20" />
            ) : (
              <div className="w-24 h-24 bg-gold-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl shadow-gold-500/20">
                <Scissors className="text-black w-12 h-12" />
              </div>
            )}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-4 font-serif italic text-gold-500">{barber.shopName}</h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">{barber.description}</p>
          </motion.div>
          <button
            onClick={() => setShowBooking(true)}
            className="bg-gold-500 text-black px-10 py-4 rounded-full text-lg font-bold hover:scale-105 transition-all shadow-xl shadow-gold-500/30"
          >
            {t.public.bookNow}
          </button>
        </div>
      </section>

      {/* Services */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-12 text-center uppercase tracking-widest font-serif italic text-gold-500">{t.public.services}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {barber.services.map((service) => (
            <div key={service.id} className="p-8 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-gold-500/50 transition-all group">
              <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                <h3 className="text-xl font-bold mb-1 group-hover:text-gold-500 transition-colors">{service.name}</h3>
                <p className="text-white/40 text-sm">{service.duration} {language === 'ar' ? 'دقيقة' : 'minutes'}</p>
              </div>
              <div className="text-2xl font-bold text-gold-500">${service.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Info Grid */}
      <section className="py-24 bg-white/5 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Clock className="text-gold-500 w-6 h-6" />
              {t.public.hours}
            </h3>
            <div className="space-y-2 text-white/60">
              {Object.entries(barber.openingHours).map(([day, hours]) => (
                <div key={day} className="flex justify-between border-b border-white/5 pb-2">
                  <span className="capitalize">{day}</span>
                  <span>{hours}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <MapPin className="text-gold-500 w-6 h-6" />
              {t.public.location}
            </h3>
            <p className="text-white/60 leading-relaxed">
              {barber.location.address}<br />
              {barber.location.city}
            </p>
            <div className="h-48 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-white/20">
              Map View Placeholder
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Phone className="text-gold-500 w-6 h-6" />
              {t.public.contact}
            </h3>
            <div className="flex flex-col gap-4">
              {barber.whatsapp && (
                <a
                  href={`https://wa.me/${barber.whatsapp}`}
                  className="flex items-center gap-3 text-white/60 hover:text-gold-500 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  WhatsApp: {barber.whatsapp}
                </a>
              )}
              <div className="flex items-center gap-4 mt-4">
                {barber.socialLinks.instagram && (
                  <a href={`https://instagram.com/${barber.socialLinks.instagram}`} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-gold-500 hover:text-black transition-all">
                    <Instagram className="w-6 h-6" />
                  </a>
                )}
                {barber.socialLinks.facebook && (
                  <a href={`https://facebook.com/${barber.socialLinks.facebook}`} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-gold-500 hover:text-black transition-all">
                    <Facebook className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <AnimatePresence>
        {showBooking && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBooking(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[40px] p-10 overflow-hidden"
            >
              {bookingSuccess ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gold-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-gold-500/20">
                    <CheckCircle className="text-black w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 font-serif italic">{t.public.successTitle}</h2>
                  <p className="text-white/40">{t.public.successDesc}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-bold font-serif italic text-gold-500">{t.public.bookNow}</h2>
                    <button onClick={() => setShowBooking(false)} className={`p-2 hover:bg-white/5 rounded-full transition-colors ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}>
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <form onSubmit={handleBooking} className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40">{t.public.selectService}</label>
                      <div className="grid grid-cols-2 gap-3">
                        {barber.services.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedService(s)}
                            className={`p-4 rounded-2xl border text-left transition-all ${
                              selectedService?.id === s.id ? 'border-gold-500 bg-gold-500/10' : 'border-white/10 bg-white/5'
                            }`}
                          >
                            <p className={`font-bold ${language === 'ar' ? 'text-right' : 'text-left'}`}>{s.name}</p>
                            <p className={`text-xs text-white/40 ${language === 'ar' ? 'text-right' : 'text-left'}`}>${s.price} • {s.duration}{language === 'ar' ? ' د' : 'm'}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">{t.public.selectDate}</label>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                            const date = addDays(startOfToday(), i);
                            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => setSelectedDate(date)}
                                className={`flex-shrink-0 w-16 h-20 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                                  isSelected ? 'border-gold-500 bg-gold-500/10' : 'border-white/10 bg-white/5'
                                }`}
                              >
                                <span className="text-[10px] uppercase font-bold text-white/40">{format(date, 'EEE')}</span>
                                <span className="text-xl font-bold">{format(date, 'd')}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">{t.public.selectTime}</label>
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map((t_time) => (
                            <button
                              key={t_time}
                              type="button"
                              onClick={() => setSelectedTime(t_time)}
                              className={`py-2 rounded-xl border text-sm font-bold transition-all ${
                                selectedTime === t_time ? 'border-gold-500 bg-gold-500/10' : 'border-white/10 bg-white/5'
                              }`}
                            >
                              {t_time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        placeholder={language === 'ar' ? 'اسمك الكامل' : 'Your Name'}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-gold-500 outline-none ${language === 'ar' ? 'text-right' : 'text-left'}`}
                      />
                      <input
                        type="tel"
                        required
                        placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-gold-500 outline-none ${language === 'ar' ? 'text-right' : 'text-left'}`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!selectedService || !selectedTime || !customerName || !customerPhone}
                      className="w-full bg-gold-500 text-black py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-gold-500/20"
                    >
                      {t.public.confirm}
                      <ChevronRight className={`w-5 h-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
