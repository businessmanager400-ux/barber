import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { UserProfile } from '../types';
import { User, Mail, Shield, Calendar, Save, Camera, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../supabaseClient';
import { uploadFile, getSignedUrl, deleteFile } from '../lib/storage';

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarSignedUrl, setAvatarSignedUrl] = useState<string | null>(null);
  const { language, t } = useLanguage();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          uid: data.id,
          email: data.email,
          role: data.role,
          avatarUrl: data.avatar_url,
          createdAt: data.created_at
        } as UserProfile);

        if (data.avatar_url) {
          const url = await getSignedUrl(data.avatar_url);
          setAvatarSignedUrl(url);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (file: File) => {
    if (!profile) return;
    setSaving(true);
    try {
      // Delete old avatar if exists
      if (profile.avatarUrl) {
        await deleteFile(profile.avatarUrl);
      }

      const path = await uploadFile(file, 'avatars', profile.uid);
      const signedUrl = await getSignedUrl(path);

      // Update database
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: path })
        .eq('id', profile.uid);

      if (error) throw error;

      setProfile({ ...profile, avatarUrl: path });
      setAvatarSignedUrl(signedUrl);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert(language === 'ar' ? "فشل رفع الصورة" : "Avatar upload failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile || !profile.avatarUrl) return;
    setSaving(true);
    try {
      await deleteFile(profile.avatarUrl);
      
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', profile.uid);

      if (error) throw error;

      setProfile({ ...profile, avatarUrl: undefined });
      setAvatarSignedUrl(null);
    } catch (error) {
      console.error("Error removing avatar:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />
      <main className={`flex-1 ${language === 'ar' ? 'mr-64' : 'ml-64'} p-10`}>
        <div className="max-w-2xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-2 font-serif italic">{t.profile.title}</h1>
            <p className="text-white/40">{t.profile.subtitle}</p>
          </header>

          <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 space-y-8">
            <div className={`flex items-center gap-6 pb-8 border-b border-white/5 ${language === 'ar' ? 'flex-row-reverse text-right' : ''}`}>
              <div className="relative group">
                <div className="w-24 h-24 bg-gold-500 rounded-3xl flex items-center justify-center text-4xl font-bold text-black shadow-xl shadow-gold-500/20 overflow-hidden">
                  {avatarSignedUrl ? (
                    <img src={avatarSignedUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile.email.charAt(0).toUpperCase()
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                {avatarSignedUrl && (
                  <button
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:scale-110 transition-all z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{profile.email}</h2>
                <p className="text-gold-500 font-bold text-sm uppercase tracking-widest">{profile.role}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-widest text-white/40 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.profile.email}</label>
                <div className="relative">
                  <Mail className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-white/20`} />
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 ${language === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} text-white/40 outline-none cursor-not-allowed`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-widest text-white/40 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.profile.role}</label>
                <div className="relative">
                  <Shield className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-white/20`} />
                  <input
                    type="text"
                    disabled
                    value={profile.role}
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 ${language === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} text-white/40 outline-none cursor-not-allowed capitalize`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-xs font-bold uppercase tracking-widest text-white/40 ${language === 'ar' ? 'mr-1' : 'ml-1'}`}>{t.profile.memberSince}</label>
                <div className="relative">
                  <Calendar className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-white/20`} />
                  <input
                    type="text"
                    disabled
                    value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : 'N/A'}
                    className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 ${language === 'ar' ? 'pr-12 pl-4 text-right' : 'pl-12 pr-4'} text-white/40 outline-none cursor-not-allowed`}
                  />
                </div>
              </div>
            </div>

            <div className="pt-8">
              <button
                disabled
                className="w-full bg-white/5 text-white/20 py-4 rounded-2xl font-bold border border-white/5 cursor-not-allowed"
              >
                {t.profile.changePassword}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
