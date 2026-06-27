import { useState, useEffect } from 'react';
import { useCompanions } from '@/hooks/useCompanions';
import { MapPin, Navigation, Star } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export default function CompanionDirectory() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [isLocating, setIsLocating] = useState(false);

  const { data, isLoading, error } = useCompanions({
    ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
    radius_km: radiusKm,
  });

  const getLocation = () => {
    setIsLocating(true);
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error(error);
        setGeoError('Unable to retrieve your location. Please check permissions.');
        setIsLocating(false);
      }
    );
  };

  // Automatically request on mount
  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F23] p-4 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Header & Location Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Find Companions</h1>
            <p className="text-[#E8E8E8]/60 mt-2">Discover cultural ambassadors near you.</p>
          </div>

          <div className="flex items-center gap-3 bg-[#1A1A3E]/40 p-3 rounded-xl border border-white/5">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={getLocation} 
              loading={isLocating}
              className="whitespace-nowrap"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {coords ? 'Update Location' : 'Use My Location'}
            </Button>
            <select
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="bg-[#0F0F23] text-white text-sm rounded-lg border border-white/10 px-3 py-2 outline-none focus:border-[#D4AF37]"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={25}>Within 25 km</option>
              <option value={50}>Within 50 km</option>
            </select>
          </div>
        </div>

        {geoError && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm border border-red-500/20">
            {geoError}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm border border-red-500/20">
            Failed to load companions. Please try again.
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4">
            <Spinner size="lg" className="text-[#D4AF37]" />
            <p className="text-[#E8E8E8]/60">Scanning your area...</p>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && data && data.data.length === 0 && (
          <div className="py-20 text-center">
            <MapPin className="w-12 h-12 text-[#E8E8E8]/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white">No companions found</h3>
            <p className="text-[#E8E8E8]/60 mt-2">Try expanding your search radius.</p>
          </div>
        )}

        {!isLoading && data && data.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.data.map((profile) => (
              <Card key={profile.id} className="flex flex-col hover:border-[#D4AF37]/50 transition-colors">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#B8962E] p-0.5">
                    <img 
                      src={profile.user?.avatar_url || `https://ui-avatars.com/api/?name=${profile.user?.name}&background=1A1A3E&color=fff`} 
                      alt={profile.user?.name}
                      className="w-full h-full rounded-full object-cover bg-[#0F0F23]"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{profile.user?.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-[#D4AF37] mt-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{profile.rating_avg > 0 ? profile.rating_avg.toFixed(1) : 'New'}</span>
                      <span className="text-[#E8E8E8]/40 ml-1">({profile.total_bookings} trips)</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-[#E8E8E8]/80 line-clamp-2 mb-4 flex-1">
                  {profile.bio || 'No bio provided.'}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {profile.languages?.slice(0, 3).map((lang) => (
                    <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <div>
                    <div className="text-lg font-bold text-white">{profile.hourly_rate_display}</div>
                    <div className="text-xs text-[#E8E8E8]/50">per hour</div>
                  </div>
                  <Link to={`/book/${profile.user?.id}`}>
                    <Button variant="primary" size="sm">Book Now</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}