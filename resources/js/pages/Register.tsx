import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
  role: z.enum(['CLIENT', 'COMPANION']),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Passwords don't match",
  path: ['password_confirmation'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { register: registerMutation, registerStatus } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CLIENT',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setGlobalError(null);
    try {
      const res = await registerMutation(data);
      // setAuth is handled by the mutation onSuccess in useAuth.ts
      
      const role = res?.user?.role?.toLowerCase();
      if (role === 'companion') {
        navigate('/dashboard/schedule');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F0F23] p-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-[#1A1A3E]/40 p-8 shadow-2xl backdrop-blur-lg border border-white/5">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Join Chulx
          </h2>
          <p className="mt-2 text-sm text-[#E8E8E8]/60">
            Create an account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setValue('role', 'CLIENT')}
              className={`p-4 rounded-xl border transition-all ${
                selectedRole === 'CLIENT'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                  : 'border-white/10 hover:bg-white/5'
              }`}
            >
              <div className="text-sm font-semibold text-white">Client</div>
              <div className="text-xs text-[#E8E8E8]/60 mt-1">Book companions</div>
            </button>
            <button
              type="button"
              onClick={() => setValue('role', 'COMPANION')}
              className={`p-4 rounded-xl border transition-all ${
                selectedRole === 'COMPANION'
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                  : 'border-white/10 hover:bg-white/5'
              }`}
            >
              <div className="text-sm font-semibold text-white">Companion</div>
              <div className="text-xs text-[#E8E8E8]/60 mt-1">Offer your time</div>
            </button>
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Phone Number"
              type="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              autoComplete="new-password"
              error={errors.password_confirmation?.message}
              {...register('password_confirmation')}
            />
          </div>

          {globalError && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 text-center">
              {globalError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={registerStatus === 'pending'}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-[#E8E8E8]/60">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#D4AF37] hover:text-[#B8962E] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}