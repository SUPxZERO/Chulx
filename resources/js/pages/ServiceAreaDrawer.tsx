import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, DrawingManager, Polygon } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Map, MapPin, Save, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import api from '@/lib/api';
import Button from '@/components/ui/Button';

// Requires a Google Maps API Key. In production, this comes from an env variable.
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const libraries: ("drawing" | "places" | "geometry" | "localContext" | "visualization")[] = ['drawing'];

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '1.5rem',
};

// Default center: Los Angeles
const defaultCenter = {
  lat: 34.0522,
  lng: -118.2437
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#263c3f" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#6b9a76" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#9ca5b3" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#746855" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1f2835" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#f3d19c" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#515c6d" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

interface CustomPolygon {
  id: string;
  name: string;
  paths: { lat: number; lng: number }[];
}

export default function ServiceAreaDrawer() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const [polygons, setPolygons] = useState<CustomPolygon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const polygonIdCounter = useRef(0);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/companions/me/service-areas', payload);
      return res.data;
    },
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to save service areas.');
    }
  });

  const onPolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    // Extract paths
    const path = polygon.getPath();
    const coordinates: { lat: number; lng: number }[] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const pt = path.getAt(i);
      coordinates.push({ lat: pt.lat(), lng: pt.lng() });
    }

    // Remove the drawn polygon from the map so we can manage it with our state
    polygon.setMap(null);

    polygonIdCounter.current += 1;
    const newPoly: CustomPolygon = {
      id: `poly_${polygonIdCounter.current}`,
      name: `Service Area ${polygonIdCounter.current}`,
      paths: coordinates,
    };

    setPolygons((prev) => [...prev, newPoly]);
  }, []);

  const removePolygon = (id: string) => {
    setPolygons(prev => prev.filter(p => p.id !== id));
  };

  const updatePolygonName = (id: string, name: string) => {
    setPolygons(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const handleSave = () => {
    setError(null);
    if (polygons.length === 0) {
      setError('Please draw at least one service area.');
      return;
    }

    // Convert to GeoJSON Format
    const areas = polygons.map(poly => {
      const coords = poly.paths.map(pt => [pt.lng, pt.lat]);
      // Close the linear ring
      if (coords.length > 0) {
        coords.push(coords[0]);
      }
      
      return {
        name: poly.name,
        boundary: {
          type: "Polygon",
          coordinates: [coords]
        }
      };
    });

    saveMutation.mutate({ areas });
  };

  if (loadError) {
    return <div className="p-8 text-center text-red-400">Failed to load Google Maps. Please check your API key.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 sm:px-6 mb-24">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Map className="w-8 h-8 mr-3 text-[#D4AF37]" />
            Service Areas
          </h1>
          <p className="text-[#E8E8E8]/60">Draw the specific geographic zones where you are willing to provide services.</p>
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
          <span className="text-sm">Service areas saved successfully.</span>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
          {!isLoaded ? (
            <div className="w-full h-[600px] bg-[#0F0F23] flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={11}
              options={mapOptions}
            >
              <DrawingManager
                onPolygonComplete={onPolygonComplete}
                options={{
                  drawingControl: true,
                  drawingControlOptions: {
                    position: window.google.maps.ControlPosition.TOP_CENTER,
                    drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
                  },
                  polygonOptions: {
                    fillColor: '#D4AF37',
                    fillOpacity: 0.3,
                    strokeWeight: 2,
                    strokeColor: '#D4AF37',
                    clickable: false,
                    editable: false,
                    zIndex: 1,
                  },
                }}
              />
              {polygons.map((poly) => (
                <Polygon
                  key={poly.id}
                  paths={poly.paths}
                  options={{
                    fillColor: '#D4AF37',
                    fillOpacity: 0.3,
                    strokeWeight: 2,
                    strokeColor: '#D4AF37',
                    clickable: false,
                    editable: false,
                    zIndex: 1,
                  }}
                />
              ))}
            </GoogleMap>
          )}
        </div>

        <div className="bg-[#0F0F23]/80 rounded-3xl border border-white/10 backdrop-blur-xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-[#D4AF37]" /> Your Zones
          </h3>
          
          <div className="flex-1 overflow-y-auto mb-6">
            {polygons.length === 0 ? (
              <div className="text-center text-white/40 mt-10">
                <p>Use the map drawing tool to highlight your service areas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {polygons.map((poly) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={poly.id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <input 
                      type="text" 
                      value={poly.name}
                      onChange={(e) => updatePolygonName(poly.id, e.target.value)}
                      className="w-full bg-transparent border-b border-white/10 focus:border-[#D4AF37] text-white font-medium mb-3 pb-1 outline-none transition-colors"
                      placeholder="e.g. Downtown LA"
                    />
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>{poly.paths.length} points</span>
                      <button 
                        onClick={() => removePolygon(poly.id)}
                        className="flex items-center text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10 mt-auto">
            <Button onClick={handleSave} loading={saveMutation.isPending} className="w-full">
              <Save className="w-4 h-4 mr-2" /> Save Zones
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
