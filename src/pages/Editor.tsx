import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { BarberProfile } from '../types';
import { motion } from 'motion/react';
import { Save, Sparkles, Plus, Trash2, Image as ImageIcon, MapPin, Clock, Phone, Share2, LayoutDashboard, Scissors, Layout, Upload, X } from 'lucide-react';
import { generateBarberDescription } from '../services/gemini';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';
import { uploadFile, getSignedUrl, deleteFile } from '../lib/storage';

export default function Editor() {
  const [profile, setProfile] = useState<BarberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [logoSignedUrl, setLogoSignedUrl] = useState<string | null>(null);
  const [coverSignedUrl, setCoverSignedUrl] = useState<string | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        const barberData = data as BarberProfile;
        setProfile(barberData);
        
        // Fetch signed URLs for logo and cover
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
    fetchProfile();
  }, []);

  const handleFileUpload = async (file: File, type: 'logo' | 'cover') => {
    if (!profile || !profile.id) return;
    
    try {
      // Delete old file if exists
      const oldPath = type === 'logo' ? profile.logoUrl : profile.coverUrl;
      if (oldPath) {
        await deleteFile(oldPath);
      }

      const path = await uploadFile(file, 'branding', profile.id);
      const signedUrl = await getSignedUrl(path);

      if (type === 'logo') {
        setProfile({ ...profile, logoUrl: path });
        setLogoSignedUrl(signedUrl);
      } else {
        setProfile({ ...profile, coverUrl: path });
        setCoverSignedUrl(signedUrl);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(language === 'ar' ? "فشل رفع الملف" : "File upload failed");
    }
  };

  const handleRemoveFile = async (type: 'logo' | 'cover') => {
    if (!profile) return;
    const path = type === 'logo' ? profile.logoUrl : profile.coverUrl;
    if (path) {
      await deleteFile(path);
      if (type === 'logo') {
        setProfile({ ...profile, logoUrl: undefined });
        setLogoSignedUrl(null);
      } else {
        setProfile({ ...profile, coverUrl: undefined });
        setCoverSignedUrl(null);
      }
    }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('barbers')
        .update({
          shop_name: profile.shopName,
          slug: profile.slug,
          description: profile.description,
          services: profile.services,
          whatsapp: profile.whatsapp,
          social_links: profile.socialLinks,
          template_id: profile.templateId,
          logo_url: profile.logoUrl,
          cover_url: profile.coverUrl,
          location: profile.location,
          opening_hours: profile.openingHours
        })
        .eq('id', user.id);

      if (error) throw error;
      alert(language === 'ar' ? "تم تحديث الموقع بنجاح!" : "Website updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!profile) return;
    setGenerating(true);
    const services = profile.services.map(s => s.name);
    const description = await generateBarberDescription(profile.shopName, services);
    setProfile({ ...profile, description });
    setGenerating(false);
  };

  const addService = () => {
    if (!profile) return;
    const newService = { id: Date.now().toString(), name: language === 'ar' ? 'خدمة جديدة' : 'New Service', price: 20, duration: 30 };
    setProfile({ ...profile, services: [...profile.services, newService] });
  };

  const removeService = (id: string) => {
    if (!profile) return;
    setProfile({ ...profile, services: profile.services.filter(s => s.id !== id) });
  };

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className={`flex-1 ${language === 'ar' ? 'mr-64' : 'ml-64'} p-10`}>
        <div className="max-w-4xl mx-auto">
          <header className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2 font-serif italic">{t.editor.title}</h1>
              <p className="text-white/40">{t.editor.subtitle}</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gold-500 text-black px-8 py-3 rounded-2xl font-bold hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-gold-500/20"
            >
              <Save className="w-5 h-5" />
              {saving ? t.editor.saving : t.editor.save}
            </button>
          </header>

          <div className="space-y-10">
            {/* Branding Section */}
            <section className="bg-white/5 border border-white/10 rounded-[40px] p-10">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <ImageIcon className="text-gold-500 w-6 h-6" />
                {language === 'ar' ? 'الهوية البصرية' : 'Branding'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                    {language === 'ar' ? 'شعار المحل' : 'Shop Logo'}
                  </label>
                  <div className="relative group">
                    <div className="w-32 h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center overflow-hidden group-hover:border-gold-500/50 transition-all">
                      {logoSignedUrl ? (
                        <img src={logoSignedUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-white/10" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    {logoSignedUrl && (
                      <button
                        onClick={() => handleRemoveFile('logo')}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-white/20 italic">
                    {language === 'ar' ? 'يفضل استخدام شعار بخلفية شفافة (PNG)' : 'Recommended: Transparent PNG logo'}
                  </p>
                </div>

                {/* Cover Upload */}
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                    {language === 'ar' ? 'صورة الغلاف' : 'Cover Image'}
                  </label>
                  <div className="relative group">
                    <div className="w-full h-32 bg-white/5 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center overflow-hidden group-hover:border-gold-500/50 transition-all">
                      {coverSignedUrl ? (
                        <img src={coverSignedUrl} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-white/10" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    {coverSignedUrl && (
                      <button
                        onClick={() => handleRemoveFile('cover')}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-white/20 italic">
                    {language === 'ar' ? 'يفضل استخدام صورة عالية الجودة (1920x1080)' : 'Recommended: High resolution (1920x1080)'}
                  </p>
                </div>
              </div>
            </section>

            {/* Basic Info */}
            <section className="bg-white/5 border border-white/10 rounded-[40px] p-10">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <LayoutDashboard className="text-gold-500 w-6 h-6" />
                {t.editor.basicInfo}
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">{t.editor.shopName}</label>
                  <input
                    type="text"
                    value={profile.shopName}
                    onChange={(e) => setProfile({ ...profile, shopName: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-gold-500 outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">{t.editor.slug}</label>
                  <div className="relative">
                    <span className={`absolute ${language === 'ar' ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-white/20`}>barbersite.pro/</span>
                    <input
                      type="text"
                      value={profile.slug}
                      onChange={(e) => setProfile({ ...profile, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 ${language === 'ar' ? 'pr-36 pl-6' : 'pl-36 pr-6'} focus:border-gold-500 outline-none transition-colors`}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">{t.editor.description}</label>
                  <button
                    onClick={handleGenerateAI}
                    disabled={generating}
                    className="text-xs font-bold text-gold-500 flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3" />
                    {generating ? t.editor.generating : t.editor.generateAI}
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={profile.description}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-gold-500 outline-none transition-colors resize-none"
                  placeholder="..."
                />
              </div>
            </section>

            {/* Services */}
            <section className="bg-white/5 border border-white/10 rounded-[40px] p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <Scissors className="text-gold-500 w-6 h-6" />
                  {t.editor.services}
                </h2>
                <button
                  onClick={addService}
                  className="text-sm font-bold text-gold-500 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  {t.editor.addService}
                </button>
              </div>
              <div className="space-y-4">
                {profile.services.map((service, index) => (
                  <div key={service.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => {
                        const newServices = [...profile.services];
                        newServices[index].name = e.target.value;
                        setProfile({ ...profile, services: newServices });
                      }}
                      className="flex-1 bg-transparent border-none outline-none font-bold"
                      placeholder="..."
                    />
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                      <span className="text-white/40">$</span>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => {
                          const newServices = [...profile.services];
                          newServices[index].price = Number(e.target.value);
                          setProfile({ ...profile, services: newServices });
                        }}
                        className="w-12 bg-transparent border-none outline-none font-bold"
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                      <Clock className="w-4 h-4 text-white/40" />
                      <input
                        type="number"
                        value={service.duration}
                        onChange={(e) => {
                          const newServices = [...profile.services];
                          newServices[index].duration = Number(e.target.value);
                          setProfile({ ...profile, services: newServices });
                        }}
                        className="w-12 bg-transparent border-none outline-none font-bold"
                      />
                      <span className="text-white/40 text-xs">{language === 'ar' ? 'دقيقة' : 'min'}</span>
                    </div>
                    <button
                      onClick={() => removeService(service.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Contact & Social */}
            <section className="bg-white/5 border border-white/10 rounded-[40px] p-10">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Phone className="text-gold-500 w-6 h-6" />
                {t.editor.contact}
              </h2>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">{t.editor.whatsapp}</label>
                  <input
                    type="text"
                    value={profile.whatsapp}
                    onChange={(e) => setProfile({ ...profile, whatsapp: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-gold-500 outline-none transition-colors"
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">{t.editor.instagram}</label>
                  <input
                    type="text"
                    value={profile.socialLinks.instagram}
                    onChange={(e) => setProfile({ ...profile, socialLinks: { ...profile.socialLinks, instagram: e.target.value } })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-gold-500 outline-none transition-colors"
                    placeholder="@yourshop"
                  />
                </div>
              </div>
            </section>

            {/* Template Selection */}
            <section className="bg-white/5 border border-white/10 rounded-[40px] p-10">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3">
                <Layout className="text-gold-500 w-6 h-6" />
                {t.editor.templates}
              </h2>
              <div className="grid grid-cols-3 gap-6">
                {['classic', 'modern', 'luxury'].map((t_id) => (
                  <button
                    key={t_id}
                    onClick={() => setProfile({ ...profile, templateId: t_id as any })}
                    className={`p-6 rounded-3xl border-2 transition-all text-center ${
                      profile.templateId === t_id ? 'border-gold-500 bg-gold-500/10' : 'border-white/10 hover:border-white/20 bg-white/5'
                    }`}
                  >
                    <div className="w-full aspect-video bg-white/10 rounded-xl mb-4 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-white/20" />
                    </div>
                    <span className="font-bold capitalize">{t_id}</span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
