import { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, X } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';

interface KycUploaderProps {
  onSuccess?: (url: string) => void;
}

export default function KycUploader({ onSuccess }: KycUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Basic validation matching the backend (5MB max, pdf/jpeg/png)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File must be smaller than 5MB');
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Only JPEG, PNG, or PDF files are allowed');
        return;
      }

      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const { data } = await api.post('/profile/kyc', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setProgress(percentCompleted);
          }
        },
      });

      setSuccess(true);
      
      // Backend returns the updated user with eager loaded relationships
      if (data.user) {
        const token = localStorage.getItem('chulx_auth_token');
        if (token) setAuth(data.user, token);
      }
      
      if (onSuccess) onSuccess(data.url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-[#1A1A3E]/30 p-6 backdrop-blur-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Identity Verification</h3>
        <p className="text-sm text-[#E8E8E8]/60">Upload your ID or Passport (PDF, JPG, PNG)</p>
      </div>

      {!file && !success && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-xl border-2 border-dashed border-[#D4AF37]/30 bg-[#0F0F23]/50 p-8 text-center transition-colors hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5"
        >
          <UploadCloud className="mx-auto h-12 w-12 text-[#D4AF37]/70" />
          <p className="mt-4 text-sm font-medium text-white">Click to browse or drag and drop</p>
          <p className="mt-1 text-xs text-[#E8E8E8]/50">Max size 5MB</p>
        </div>
      )}

      {file && !success && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-[#0F0F23] p-4 border border-white/5">
            <div className="flex items-center space-x-3 overflow-hidden">
              <UploadCloud className="h-6 w-6 shrink-0 text-[#D4AF37]" />
              <div className="truncate text-sm text-white">{file.name}</div>
            </div>
            {!uploading && (
              <button onClick={() => setFile(null)} className="p-1 hover:bg-white/10 rounded">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>

          {uploading && (
            <div className="w-full rounded-full bg-white/10 h-2">
              <div 
                className="bg-gradient-to-r from-[#D4AF37] to-[#B8962E] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="ghost" onClick={() => setFile(null)} disabled={uploading}>Cancel</Button>
            <Button onClick={handleUpload} loading={uploading}>Upload Document</Button>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-6 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-3" />
          <h4 className="text-lg font-medium text-green-400">Upload Successful</h4>
          <p className="text-sm text-green-400/70 mt-1">Your document is now in review.</p>
          <Button variant="ghost" className="mt-4" onClick={() => { setFile(null); setSuccess(false); }}>
            Upload Another
          </Button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,application/pdf"
        onChange={handleFileChange}
      />
    </div>
  );
}
