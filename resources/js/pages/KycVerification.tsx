import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  Car, 
  UploadCloud, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';

type DocType = 'PASSPORT' | 'NATIONAL_ID' | 'DRIVERS_LICENSE';

export default function KycVerification() {
  const [step, setStep] = useState(1);
  const [docType, setDocType] = useState<DocType>('NATIONAL_ID');
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be under 10MB.');
        return;
      }
      setter(file);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!frontImage || !selfieImage) {
      setError('Please provide all required documents.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append('document_type', docType);
    formData.append('front_image', frontImage);
    if (backImage) formData.append('back_image', backImage);
    formData.append('selfie_image', selfieImage);

    try {
      await api.post('/profile/kyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const FileUploadBox = ({ 
    file, 
    label, 
    icon: Icon, 
    inputRef, 
    setter 
  }: { 
    file: File | null, 
    label: string, 
    icon: any, 
    inputRef: React.RefObject<HTMLInputElement>, 
    setter: React.Dispatch<React.SetStateAction<File | null>> 
  }) => (
    <div className="relative group">
      {!file ? (
        <div 
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-[#D4AF37]/50 transition-all duration-300"
        >
          <Icon className="w-10 h-10 text-[#D4AF37]/80 mb-3 group-hover:scale-110 transition-transform" />
          <p className="text-sm font-medium text-white text-center">{label}</p>
          <p className="text-xs text-white/50 mt-2">JPEG, PNG or PDF (Max 10MB)</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="flex items-center space-x-4 overflow-hidden">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div className="truncate pr-4">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-white/50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button 
            onClick={() => setter(null)}
            className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <input 
        type="file" 
        className="hidden" 
        ref={inputRef} 
        onChange={(e) => handleFileChange(e, setter)} 
        accept="image/jpeg,image/png,application/pdf" 
      />
    </div>
  );

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 rounded-3xl bg-[#1A1A3E]/40 border border-white/10 backdrop-blur-xl text-center">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-12 h-12 text-green-400" />
        </motion.div>
        <h2 className="text-2xl font-bold text-white mb-2">Documents Submitted</h2>
        <p className="text-[#E8E8E8]/70 mb-8">
          Your identity verification is currently pending review. This usually takes between 1-24 hours. We will notify you once you are approved.
        </p>
        <Button onClick={() => window.location.href = '/'}>Return to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 mb-24 px-4 sm:px-0">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-[#D4AF37]/20 rounded-2xl mb-4">
          <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Identity Verification</h1>
        <p className="text-[#E8E8E8]/60">Securely verify your identity to unlock all companion features.</p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-center mb-10">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= s ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-white/40 border border-white/10'}`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-16 h-1 mx-2 rounded-full transition-colors duration-300 ${step > s ? 'bg-[#D4AF37]' : 'bg-white/10'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      <div className="p-6 sm:p-10 rounded-3xl bg-[#0F0F23]/80 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-[#D4AF37]/5 blur-[100px] pointer-events-none" />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-semibold text-white mb-6">Select Document Type</h3>
              <div className="grid gap-4">
                {[
                  { id: 'PASSPORT', icon: FileText, label: 'Passport' },
                  { id: 'NATIONAL_ID', icon: CreditCard, label: 'National ID Card' },
                  { id: 'DRIVERS_LICENSE', icon: Car, label: 'Driver\'s License' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setDocType(type.id as DocType)}
                    className={`flex items-center p-5 rounded-2xl border transition-all duration-300 ${docType === type.id ? 'bg-[#D4AF37]/10 border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]' : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'}`}
                  >
                    <div className={`p-3 rounded-xl mr-4 ${docType === type.id ? 'bg-[#D4AF37] text-black' : 'bg-white/10 text-white'}`}>
                      <type.icon className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-white text-lg">{type.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-semibold text-white mb-2">Upload {docType.replace('_', ' ').toLowerCase()}</h3>
              <p className="text-sm text-white/50 mb-6">Ensure the document is fully visible, well lit, and in focus.</p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <FileUploadBox 
                  file={frontImage} 
                  setter={setFrontImage} 
                  inputRef={frontInputRef} 
                  icon={UploadCloud} 
                  label={`Upload Front Side${docType === 'PASSPORT' ? ' (Photo Page)' : ''}`} 
                />
                
                {docType !== 'PASSPORT' && (
                  <FileUploadBox 
                    file={backImage} 
                    setter={setBackImage} 
                    inputRef={backInputRef} 
                    icon={UploadCloud} 
                    label="Upload Back Side" 
                  />
                )}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <h3 className="text-xl font-semibold text-white mb-2">Take a Selfie</h3>
              <p className="text-sm text-white/50 mb-6">We need a photo of you to match with your document.</p>
              
              <div className="max-w-md mx-auto">
                <FileUploadBox 
                  file={selfieImage} 
                  setter={setSelfieImage} 
                  inputRef={selfieInputRef} 
                  icon={Camera} 
                  label="Upload a clear selfie" 
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex items-center justify-between pt-6 border-t border-white/10">
          <Button 
            variant="ghost" 
            onClick={() => setStep(step - 1)} 
            disabled={step === 1 || isSubmitting}
            className={step === 1 ? 'invisible' : ''}
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          {step < 3 ? (
            <Button 
              onClick={() => {
                if (step === 2 && !frontImage) {
                  setError('Please upload the front of your document.');
                  return;
                }
                setError(null);
                setStep(step + 1);
              }}
            >
              Continue <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={isSubmitting}>
              Submit Verification
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
