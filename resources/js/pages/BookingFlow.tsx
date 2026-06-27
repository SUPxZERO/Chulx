import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBookings } from '@/hooks/useBookings';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Calendar, MapPin, Briefcase } from 'lucide-react';

const bookingSchema = z.object({
  scheduled_start: z.string().min(1, 'Please select a start date and time'),
  scheduled_end: z.string().min(1, 'Please select an end date and time'),
  venue_id: z.string().min(1, 'Please select a venue'),
  purpose: z.enum(['WEDDING', 'BUSINESS', 'TOURISM', 'CORPORATE', 'OTHER']),
  special_requests: z.string().max(1000).optional(),
}).refine((data) => new Date(data.scheduled_end) > new Date(data.scheduled_start), {
  message: "End time must be after start time",
  path: ['scheduled_end'],
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookingFlow() {
  const { companionId } = useParams<{ companionId: string }>();
  const navigate = useNavigate();
  const { createBooking, isCreating, createError } = useBookings();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      purpose: 'TOURISM',
    },
  });

  const nextStep = async (fieldsToValidate: (keyof BookingFormValues)[]) => {
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const onSubmit = async (data: BookingFormValues) => {
    if (!companionId) return;
    setGlobalError(null);
    try {
      const result = await createBooking({
        ...data,
        companion_id: Number(companionId),
        venue_id: Number(data.venue_id),
      });
      // Navigate to payment/escrow screen
      navigate(`/bookings/${result.uuid}/pay`);
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Failed to create booking.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F23] p-4 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-[#1A1A3E]/40 p-8 rounded-3xl shadow-2xl backdrop-blur-md border border-white/5">
        
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 w-full h-0.5 bg-white/10 -z-10"></div>
          {[1, 2, 3].map((num) => (
            <div 
              key={num} 
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-4 border-[#1A1A3E] ${
                step >= num ? 'bg-gradient-to-tr from-[#D4AF37] to-[#B8962E] text-[#0F0F23]' : 'bg-[#0F0F23] text-white/50'
              }`}
            >
              {num}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mb-6">
          {step === 1 && 'When do you need them?'}
          {step === 2 && 'Where are you meeting?'}
          {step === 3 && 'Confirm Details'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <Input
                label="Start Date & Time"
                type="datetime-local"
                error={errors.scheduled_start?.message}
                {...register('scheduled_start')}
              />
              <Input
                label="End Date & Time"
                type="datetime-local"
                error={errors.scheduled_end?.message}
                {...register('scheduled_end')}
              />
              <Button type="button" className="w-full mt-4" onClick={() => nextStep(['scheduled_start', 'scheduled_end'])}>
                Continue to Venue <MapPin className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-1">
                <label className="text-sm text-[#E8E8E8]/60 ml-4">Venue ID (Mock selection)</label>
                <select 
                  className="w-full rounded-lg border border-white/10 bg-[#1A1A3E]/60 px-4 py-3 text-[#E8E8E8] outline-none focus:border-[#D4AF37]"
                  {...register('venue_id')}
                >
                  <option value="">Select a venue...</option>
                  <option value="1">Rosewood Hotel (Lounge)</option>
                  <option value="2">Sora Skybar</option>
                  <option value="3">Vattanac Capital</option>
                </select>
                {errors.venue_id && <p className="text-red-400 text-xs ml-4 mt-1">{errors.venue_id.message}</p>}
              </div>

              <div className="space-y-1 mt-4">
                <label className="text-sm text-[#E8E8E8]/60 ml-4">Purpose of Booking</label>
                <select 
                  className="w-full rounded-lg border border-white/10 bg-[#1A1A3E]/60 px-4 py-3 text-[#E8E8E8] outline-none focus:border-[#D4AF37]"
                  {...register('purpose')}
                >
                  <option value="TOURISM">Tourism / Guide</option>
                  <option value="BUSINESS">Business Event</option>
                  <option value="CORPORATE">Corporate Dinner</option>
                  <option value="WEDDING">Wedding Plus-One</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>Back</Button>
                <Button type="button" className="flex-1" onClick={() => nextStep(['venue_id', 'purpose'])}>
                  Review & Confirm <Briefcase className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="rounded-xl bg-[#0F0F23] p-6 border border-white/5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-[#E8E8E8]/60">Starts</span>
                  <span className="text-white font-medium">{new Date(getValues('scheduled_start')).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E8E8E8]/60">Ends</span>
                  <span className="text-white font-medium">{new Date(getValues('scheduled_end')).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E8E8E8]/60">Purpose</span>
                  <span className="text-white font-medium">{getValues('purpose')}</span>
                </div>
              </div>

              <Input
                label="Special Requests (Optional)"
                error={errors.special_requests?.message}
                {...register('special_requests')}
              />

              {globalError && (
                <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm text-center">
                  {globalError}
                </div>
              )}

              <div className="flex gap-3">
                <Button type="button" variant="secondary" onClick={() => setStep(2)} disabled={isCreating}>Back</Button>
                <Button type="submit" className="flex-1" loading={isCreating}>
                  Lock in Escrow
                </Button>
              </div>
            </div>
          )}

        </form>
      </div>
    </div>
  );
}