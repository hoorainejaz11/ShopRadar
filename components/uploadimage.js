import { uploadImage } from '../lib/storage';

// Uploads a local image to Supabase Storage, then calls onUploaded(publicUrl).
const UploadImage = async (imageUrl, setUploading, onUploaded, folder = 'images') => {
  setUploading(true);
  try {
    const publicUrl = await uploadImage(imageUrl, folder);
    await onUploaded(publicUrl);
  } catch (error) {
    console.log('Image upload failed:', error);
    alert(error?.message || 'Image upload failed');
  } finally {
    setUploading(false);
  }
};

export default UploadImage;
