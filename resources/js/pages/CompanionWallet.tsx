import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Landmark,
  Building,
  User as UserIcon,
  Hash
} from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

interface PayoutRequest {
  id: number;
  amount_cents: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_at: string;
}

export default function CompanionWallet() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Use react-query to fetch payouts
  const { data: payouts, isLoading } = useQuery({
    queryKey: ['payouts'],
    queryFn: async () => {
      const res = await api.get('/payouts');
      return res.data.data as PayoutRequest[];
    }
  });

  const requestPayout = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/payouts', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      // In a real app we'd refetch auth/me to update the wallet balance in the store, 
      // but for now we'll just close the modal.
      setIsModalOpen(false);
      setAmount('');
      setBankName('');
      setAccountName('');
      setAccountNumber('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to request payout.');
    }
  });

  const wallet = user?.wallet;
  const balance = wallet ? wallet.balance_cents / 100 : 0;
  const hold = wallet ? wallet.hold_amount_cents / 100 : 0;
  const available = balance - hold;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amountCents = parseFloat(amount) * 100;
    
    if (isNaN(amountCents) || amountCents <= 0) {
      setError('Please enter a valid amount.');
      return;
    }

    if (amountCents > available * 100) {
      setError('Amount exceeds available balance.');
      return;
    }

    requestPayout.mutate({
      amount_cents: amountCents,
      bank_details: {
        bank_name: bankName,
        account_name: accountName,
        account_number: accountNumber
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'PENDING': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'PROCESSING': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'FAILED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-white/70 bg-white/5 border-white/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4 mr-2" />;
      case 'PENDING': return <Clock className="w-4 h-4 mr-2" />;
      case 'PROCESSING': return <Clock className="w-4 h-4 mr-2" />;
      case 'FAILED': return <XCircle className="w-4 h-4 mr-2" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 px-4 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <WalletIcon className="w-8 h-8 mr-3 text-[#D4AF37]" />
            Earnings & Wallet
          </h1>
          <p className="text-[#E8E8E8]/60">Manage your balance and request payouts to your bank account.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="hidden sm:flex">
          <Landmark className="w-4 h-4 mr-2" /> Request Payout
        </Button>
      </div>

      {/* Hero Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-[#1A1A3E] to-[#0F0F23] border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 blur-[80px] pointer-events-none rounded-full transform translate-x-1/2 -translate-y-1/2" />
          
          <p className="text-white/60 font-medium mb-2 uppercase tracking-wider text-sm">Available Balance</p>
          <h2 className="text-5xl sm:text-7xl font-bold text-white tracking-tight mb-6">
            ${available.toFixed(2)}
          </h2>
          
          <Button onClick={() => setIsModalOpen(true)} className="sm:hidden mb-4 w-full">
            <Landmark className="w-4 h-4 mr-2" /> Request Payout
          </Button>

          <div className="flex items-center text-sm">
            <div className="flex items-center text-white/50 mr-6">
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2" />
              Total Earned: ${balance.toFixed(2)}
            </div>
            <div className="flex items-center text-yellow-400/80">
              <span className="w-2 h-2 rounded-full bg-yellow-400 mr-2" />
              On Hold: ${hold.toFixed(2)}
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 rounded-3xl bg-[#0F0F23] border border-white/10 flex flex-col justify-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10">
            <ArrowUpRight className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <p className="text-white/60 text-sm mb-1">Lifetime Payouts</p>
          <p className="text-3xl font-bold text-white">
            ${payouts?.filter(p => p.status === 'COMPLETED').reduce((acc, p) => acc + (p.amount_cents / 100), 0).toFixed(2) || '0.00'}
          </p>
        </motion.div>
      </div>

      {/* Transaction History */}
      <h3 className="text-xl font-semibold text-white mb-6">Payout History</h3>
      
      <div className="bg-[#0F0F23]/80 rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden">
        {isLoading ? (
          <div className="p-10 text-center text-white/50">Loading history...</div>
        ) : payouts?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Landmark className="w-8 h-8 text-white/20" />
            </div>
            <h4 className="text-lg font-medium text-white mb-1">No payouts yet</h4>
            <p className="text-sm text-white/50">When you request a payout, it will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {payouts?.map((payout, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={payout.id} 
                className="p-5 sm:p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 border ${getStatusColor(payout.status)}`}>
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Bank Transfer</p>
                    <p className="text-xs text-white/50 mt-1">{new Date(payout.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-white">${(payout.amount_cents / 100).toFixed(2)}</p>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${getStatusColor(payout.status)}`}>
                    {getStatusIcon(payout.status)}
                    {payout.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Request Payout">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Amount to Withdraw ($)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-white/50">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                min="1"
                max={available}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-[#0F0F23] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-transparent transition-all"
                placeholder="0.00"
                required
              />
            </div>
            <p className="text-xs text-white/40 mt-2 text-right">Available: ${available.toFixed(2)}</p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-medium text-white mb-4">Bank Details</h4>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0F0F23] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  placeholder="Bank Name (e.g. Chase)"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0F0F23] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  placeholder="Account Holder Name"
                  required
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Hash className="w-5 h-5 text-white/40" />
                </div>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#0F0F23] border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                  placeholder="Account Number"
                  required
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={requestPayout.isPending}>Submit Request</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
