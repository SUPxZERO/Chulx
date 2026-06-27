import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login, loginStatus } = useAuth();
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const autofill = (email: string) => {
    setValue('email', email);
    setValue('password', 'password');
  };

  const onSubmit = async (data: LoginFormValues) => {
    setGlobalError(null);
    try {
      const res = await login(data);
      
      // Redirect based on role
      const role = res?.user?.role?.toLowerCase();
      if (role === 'admin') {
        window.location.href = '/admin';
      } else if (role === 'companion') {
        navigate('/dashboard/schedule');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F0F23] p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-[#1A1A3E]/40 p-8 shadow-2xl backdrop-blur-lg border border-white/5">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Welcome back to Chulx
          </h2>
          <p className="mt-2 text-sm text-[#E8E8E8]/60">
            Sign in to access your account
          </p>
        </div>

        <div className="flex justify-center gap-2 mt-4">
            <button type="button" onClick={() => autofill('admin@chulx.com')} className="px-3 py-1 text-xs rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors">Admin</button>
            <button type="button" onClick={() => autofill('client@chulx.com')} className="px-3 py-1 text-xs rounded-md bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 transition-colors">Client</button>
            <button type="button" onClick={() => autofill('companion@chulx.com')} className="px-3 py-1 text-xs rounded-md bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-colors">Companion</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              error={errors.password?.message}
              {...register('password')}
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
            loading={loginStatus === 'pending'}
          >
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm text-[#E8E8E8]/60">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#D4AF37] hover:text-[#B8962E] transition-colors"
          >
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
}