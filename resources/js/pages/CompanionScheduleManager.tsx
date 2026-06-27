import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { Clock, Calendar as CalendarIcon, Save, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';

// 1 = Monday, 7 = Sunday
const DAYS_OF_WEEK = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 7, name: 'Sunday' },
];

export default function CompanionScheduleManager() {
  const [schedules, setSchedules] = useState<Record<number, { enabled: boolean, start: string, end: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Initialize defaults
  useEffect(() => {
    const defaultSchedules: any = {};
    DAYS_OF_WEEK.forEach(day => {
      defaultSchedules[day.id] = { enabled: false, start: '09:00', end: '17:00' };
    });
    setSchedules(defaultSchedules);
    // Ideally we would fetch existing schedules here using useQuery and merge them in
  }, []);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.put('/companions/me/schedule', payload);
      return res.data;
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save schedule.');
    }
  });

  const handleToggle = (dayId: number) => {
    setSchedules(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], enabled: !prev[dayId].enabled }
    }));
  };

  const handleTimeChange = (dayId: number, field: 'start' | 'end', value: string) => {
    setSchedules(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }));
  };

  const handleSave = () => {
    setError(null);
    const activeSchedules = [];

    for (const [dayId, data] of Object.entries(schedules)) {
      if (data.enabled) {
        if (data.start >= data.end) {
          setError(`End time must be after start time on ${DAYS_OF_WEEK.find(d => d.id === parseInt(dayId))?.name}.`);
          return;
        }
        activeSchedules.push({
          day_of_week: parseInt(dayId),
          start_time: data.start,
          end_time: data.end
        });
      }
    }

    saveMutation.mutate({ schedules: activeSchedules });
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4 sm:px-6 mb-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Clock className="w-8 h-8 mr-3 text-[#D4AF37]" />
            Weekly Availability
          </h1>
          <p className="text-[#E8E8E8]/60">Set the hours you are generally available for bookings each week.</p>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start space-x-3 text-green-400">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-sm">Schedule saved successfully.</span>
        </motion.div>
      )}

      <div className="bg-[#0F0F23]/80 rounded-3xl border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />
        
        <div className="p-6 sm:p-8 relative z-10 divide-y divide-white/5">
          {DAYS_OF_WEEK.map((day, i) => {
            const data = schedules[day.id];
            if (!data) return null;

            return (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                key={day.id} 
                className={`py-5 flex flex-col sm:flex-row sm:items-center justify-between transition-opacity ${data.enabled ? 'opacity-100' : 'opacity-50'}`}
              >
                <div className="flex items-center mb-4 sm:mb-0 w-48">
                  {/* Custom Toggle */}
                  <div 
                    onClick={() => handleToggle(day.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-300 mr-4 ${data.enabled ? 'bg-[#D4AF37]' : 'bg-white/20'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${data.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="font-medium text-lg text-white">{day.name}</span>
                </div>

                {data.enabled ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col">
                      <label className="text-xs text-white/40 mb-1 ml-1">Start Time</label>
                      <input 
                        type="time" 
                        value={data.start}
                        onChange={(e) => handleTimeChange(day.id, 'start', e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-mono text-sm"
                      />
                    </div>
                    <span className="text-white/30 mt-5">—</span>
                    <div className="flex flex-col">
                      <label className="text-xs text-white/40 mb-1 ml-1">End Time</label>
                      <input 
                        type="time" 
                        value={data.end}
                        onChange={(e) => handleTimeChange(day.id, 'end', e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 font-mono text-sm"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-white/30 italic flex-1 text-right pr-4">Unavailable</div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="bg-black/20 p-6 flex justify-between items-center border-t border-white/10 relative z-10">
          <p className="text-xs text-white/40 max-w-sm">Changes made here will affect your general availability. To block out specific dates (like vacations), use the Calendar Blocks feature.</p>
          <Button onClick={handleSave} loading={saveMutation.isPending} className="px-8">
            <Save className="w-4 h-4 mr-2" /> Save Schedule
          </Button>
        </div>
      </div>
    </div>
  );
}
