import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'app-files';

export const uploadFile = async (file: File, featureName: string, itemId: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const extension = file.name.split('.').pop();
  const uuid = uuidv4();
  const filePath = `${user.id}/${featureName}/${itemId}/${uuid}.${extension}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file);

  if (error) throw error;
  return data.path;
};

export const getSignedUrl = async (path: string) => {
  if (!path) return null;
  
  // If it's already a full URL (like picsum), just return it
  if (path.startsWith('http')) return path;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, 3600); // 1 hour expiry

  if (error) {
    console.error('Error getting signed URL:', error);
    return null;
  }
  return data.signedUrl;
};

export const deleteFile = async (path: string) => {
  if (!path) return;
  if (path.startsWith('http')) return; // Don't try to delete external URLs

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) throw error;
};
