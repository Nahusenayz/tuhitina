import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  label?: string;
}

export default function ImageUpload({ onUpload, currentImage, label = "Update Image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `hotel-images/${fileName}`;

      // Upload to 'hotel-content' bucket
      const { error: uploadError } = await supabase.storage
        .from('hotel-content')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('hotel-content')
        .getPublicUrl(filePath);

      onUpload(publicUrl);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-semibold text-gray-700">{label}</label>}
      <div className="relative group">
        <div className="aspect-video w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-300">
          {currentImage ? (
            <>
              <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-gray-900 shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Upload className="w-4 h-4 text-blue-600" />}
                  Change Photo
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors"
            >
              {uploading ? (
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              ) : (
                <>
                  <ImageIcon className="w-10 h-10" />
                  <span className="text-sm font-medium">Click to upload image</span>
                </>
              )}
            </button>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          accept="image/*"
          className="hidden"
          disabled={uploading}
        />
      </div>
      <p className="text-[10px] text-gray-400 font-medium px-1">
        PNG, JPG or WEBP. Max 2MB.
      </p>
    </div>
  );
}
