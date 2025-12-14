import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Search, Loader2, Navigation, MapPin, X, Locate, Globe, Footprints, Clock, Info, Image as ImageIcon, Layers } from 'lucide-react';
import { findNearbyPlaces } from '../services/geminiService';

// --- CONFIGURATION ---
const EXTERNAL_MAP_URL = ''; 

// Helper for deterministic placeholder images
const getPlaceImage = (query: string) => {
  const images = [
    'https://images.unsplash.com/photo-1565552629477-ff7285289419?auto=format&fit=crop&w=600&q=80', // Kaaba
    'https://images.unsplash.com/photo-1598282364073-6379c5c99365?auto=format&fit=crop&w=600&q=80', // Masjid Crowd
    'https://images.unsplash.com/photo-1565988019865-c3f25367623a?auto=format&fit=crop&w=600&q=80', // Mina Tents
    'https://images.unsplash.com/photo-1534008277259-26966601b633?auto=format&fit=crop&w=600&q=80', // Lamps/Architecture
    'https://images.unsplash.com/photo-1580418827493-f2b22c438517?auto=format&fit=crop&w=600&q=80', // Madinah Green Dome
    'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=600&q=80', // Architecture
  ];
  
  let hash = 0;
  for (let i = 0; i < query.length; i++) {
    hash = query.charCodeAt(i) + ((hash << 5) - hash);
  }
  return images[Math.abs(hash) % images.length];
};

// Standard Hajj Locations
const POIS = [
  { key: 'kaaba', name: 'পবিত্র কাবা (Kaaba)', location: { lat: 21.422487, lng: 39.826206 }, image: 'https://images.unsplash.com/photo-1565552629477-ff7285289419?auto=format&fit=crop&w=400&q=80' },
  { key: 'mina', name: 'মিনা (Mina)', location: { lat: 21.413333, lng: 39.893333 }, image: 'https://images.unsplash.com/photo-1565988019865-c3f25367623a?auto=format&fit=crop&w=400&q=80' },
  { key: 'arafat', name: 'আরাফাত (Arafat)', location: { lat: 21.3549, lng: 39.9841 }, image: 'https://images.unsplash.com/photo-1598282364073-6379c5c99365?auto=format&fit=crop&w=400&q=80' },
  { key: 'muzdalifah', name: 'মুজদালিফা (Muzdalifah)', location: { lat: 21.3891, lng: 39.9169 }, image: 'https://images.unsplash.com/photo-1534008277259-26966601b633?auto=format&fit=crop&w=400&q=80' },
  { key: 'jamarat', name: 'জামারাত (Jamarat)', location: { lat: 21.4214, lng: 39.8732 }, image: 'https://images.unsplash.com/photo-1566497170882-9f796d111d4e?auto=format&fit=crop&w=400&q=80' }
];

// Custom Icons for Leaflet
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const poiIcon = createCustomIcon('#2ECC71'); // Green
const placeIcon = createCustomIcon('#E74C3C'); // Red
const userIcon = createCustomIcon('#3498DB'); // Blue
const startIcon = createCustomIcon('#F39C12'); // Orange for route start

// Controller to handle Map View Updates (Zoom/Center/Bounds)
const MapController = ({ 
  center, 
  zoom, 
  routeCoords,
  isRouting 
}: { 
  center: { lat: number, lng: number }, 
  zoom: number, 
  routeCoords: [number, number][],
  isRouting: boolean
}) => {
  const map = useMap();

  useEffect(() => {
    if (routeCoords.length > 0 && isRouting) {
      // Fit bounds to route
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Fly to specific point
      map.flyTo([center.lat, center.lng], zoom, { duration: 1.5 });
    }
  }, [center, zoom, routeCoords, isRouting, map]);

  return null;
};

export default function MapView() {
  const [useExternalApp, setUseExternalApp] = useState(!!EXTERNAL_MAP_URL);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState<any[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showTileNotice, setShowTileNotice] = useState(true);
  const [mapType, setMapType] = useState<'street' | 'satellite'>('street');
  
  // Map State
  const [currentPosition, setCurrentPosition] = useState(POIS[0].location);
  const [zoom, setZoom] = useState(15);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Routing State
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distance: number, duration: number } | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  // Initial Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => console.log("Geolocation permission denied or waiting")
      );
    }
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setPlaces([]);
    setSelectedPlace(null);
    setRouteCoords([]); // Clear prev route
    setIsRouting(false);

    try {
      // Use Gemini to get coordinates (Grounding)
      const result = await findNearbyPlaces(query, currentPosition.lat, currentPosition.lng);
      
      if (result.places && result.places.length > 0) {
        setPlaces(result.places);
        const first = result.places[0];
        if (first.location) {
             setCurrentPosition(first.location);
             setZoom(16);
             setSelectedPlace({
                 ...first,
                 image: getPlaceImage(query) // Use helper
             });
        }
      } else {
        alert("কোনো স্থান পাওয়া যায়নি।");
      }
    } catch (error) {
      console.error("Search failed", error);
      alert("অনুসন্ধান করা যাচ্ছে না।");
    } finally {
      setLoading(false);
    }
  };

  const handlePoiClick = (poi: typeof POIS[0]) => {
    setCurrentPosition(poi.location);
    setZoom(16);
    setSelectedPlace({
        title: poi.name,
        location: poi.location,
        type: 'landmark',
        address: 'গুরুত্বপূর্ণ স্থান (Important Place)',
        image: poi.image || getPlaceImage(poi.name) // Use specific image or fallback
    });
    setRouteCoords([]);
    setRouteInfo(null);
    setIsRouting(false);
  };

  const handleLocateMe = () => {
      setIsLocating(true);
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const loc = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                  };
                  setUserLocation(loc);
                  setCurrentPosition(loc);
                  setZoom(17);
                  setIsLocating(false);
                  
                  // Reset routing if active
                  setRouteCoords([]);
                  setIsRouting(false);
              },
              (error) => {
                  console.error(error);
                  alert("আপনার অবস্থান সনাক্ত করা যাচ্ছে না। অনুগ্রহ করে জিপিএস চালু করুন।");
                  setIsLocating(false);
              },
              { enableHighAccuracy: true, timeout: 10000 }
          );
      } else {
          alert("আপনার ডিভাইসে জিপিএস সুবিধা নেই (Location unavailable)");
          setIsLocating(false);
      }
  };

  // IN-APP ROUTING USING OSRM
  const getWalkingRoute = async () => {
    if (!selectedPlace) return;

    // Check if we have user location, if not try to get it
    let startLat = userLocation?.lat;
    let startLng = userLocation?.lng;

    if (!startLat || !startLng) {
        alert("নেভিগেশনের জন্য আপনার অবস্থান চালু করুন (Find Me বাটনে চাপ দিন)।");
        handleLocateMe();
        return;
    }

    setIsRouting(true);
    setLoading(true);

    try {
        // --- REAL DISTANCE CHECK ---
        const distKm = Math.sqrt(
          Math.pow(selectedPlace.location.lat - startLat, 2) + 
          Math.pow(selectedPlace.location.lng - startLng, 2)
        ) * 111;

        if (distKm > 50) {
            alert("আপনার অবস্থান গন্তব্য থেকে অনেক দূরে (৫০ কি.মি. এর বেশি)। হাঁটার পথ দেখানো সম্ভব নয়। গাড়ি বা বিমান ব্যবহার করুন।");
            setLoading(false);
            setIsRouting(false);
            return;
        }

        // OSRM expects: longitude,latitude
        const start = `${startLng},${startLat}`;
        const end = `${selectedPlace.location.lng},${selectedPlace.location.lat}`;
        
        const response = await fetch(`https://router.project-osrm.org/route/v1/walking/${start};${end}?overview=full&geometries=geojson`);
        const data = await response.json();

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            // Leaflet expects: [lat, lng]
            const coords = route.geometry.coordinates.map((c: number[]) => [c[1], c[0]] as [number, number]);
            
            setRouteCoords(coords);
            setRouteInfo({
                distance: route.distance, // meters
                duration: route.duration // seconds
            });
        } else {
            throw new Error("NO_ROUTE");
        }
    } catch (e: any) {
        console.error("Routing error:", e);
        alert("পথ পাওয়া যায়নি। সম্ভবত রাস্তার তথ্য নেই।");
        setIsRouting(false);
    } finally {
        setLoading(false);
    }
  };

  const startGoogleMaps = () => {
    if (!selectedPlace) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedPlace.location.lat},${selectedPlace.location.lng}&travelmode=walking`;
    window.open(url, '_blank');
  };

  // --- EXTERNAL APP INTEGRATION VIEW ---
  if (useExternalApp && EXTERNAL_MAP_URL) {
      return (
          <div className="h-full w-full flex flex-col bg-white">
              <div className="flex justify-between items-center p-3 border-b bg-gray-50">
                  <span className="font-bold font-bengali text-primary">লাইভ ম্যাপ (Live Map)</span>
                  <button 
                    onClick={() => setUseExternalApp(false)}
                    className="text-xs bg-gray-200 px-3 py-1 rounded-full text-gray-700"
                  >
                    অ্যাপ ম্যাপে ফিরে যান
                  </button>
              </div>
              <iframe 
                src={EXTERNAL_MAP_URL} 
                className="flex-1 w-full h-full border-0"
                title="Specialist Map App"
                allow="geolocation"
              />
          </div>
      );
  }

  // --- BUILT-IN LEAFLET MAP VIEW ---
  return (
    <div className="h-full w-full relative bg-gray-100 dark:bg-gray-900 flex flex-col">
        {/* Language Disclaimer & Simulation Notice */}
        <div className="absolute top-24 left-0 right-0 z-[900] flex flex-col items-center gap-2 pointer-events-none px-4">
            {showTileNotice && (
              <div className="bg-black/80 backdrop-blur text-white px-4 py-2 rounded-full text-xs font-bengali shadow-lg animate-fade-in flex items-center gap-2 pointer-events-auto">
                <Info size={14} className="text-yellow-400"/>
                মানচিত্রের নামগুলো স্থানীয় ভাষায় (আরবি/ইংরেজি)
                <button onClick={() => setShowTileNotice(false)} className="ml-2 bg-white/20 rounded-full p-0.5"><X size={12}/></button>
              </div>
            )}
        </div>

        <div className="flex-1 relative z-0">
            <MapContainer 
                center={[currentPosition.lat, currentPosition.lng]} 
                zoom={zoom} 
                scrollWheelZoom={true}
                className="w-full h-full outline-none"
                zoomControl={false}
            >
                <TileLayer
                    key={mapType}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url={mapType === 'street' 
                        ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    }
                />
                
                <MapController 
                  center={currentPosition} 
                  zoom={zoom} 
                  routeCoords={routeCoords}
                  isRouting={isRouting}
                />

                {/* POI Markers */}
                {POIS.map(poi => (
                    <Marker 
                        key={poi.key} 
                        position={[poi.location.lat, poi.location.lng]}
                        icon={poiIcon}
                        eventHandlers={{
                            click: () => handlePoiClick(poi)
                        }}
                    >
                        <Popup className="font-bengali font-bold">
                            <div className="text-center">
                                {poi.image && <img src={poi.image} alt={poi.name} className="w-full h-24 object-cover rounded-lg mb-2" />}
                                {poi.name}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* User Location */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup className="font-bengali">আপনি এখানে (You)</Popup>
                    </Marker>
                )}

                {/* Search Results */}
                {places.map((place, idx) => (
                    place.location && (
                        <Marker 
                            key={idx} 
                            position={[place.location.lat, place.location.lng]}
                            icon={placeIcon}
                            eventHandlers={{
                                click: () => {
                                  setSelectedPlace({
                                      ...place,
                                      image: getPlaceImage(query)
                                  });
                                  setCurrentPosition(place.location);
                                  setIsRouting(false);
                                }
                            }}
                        >
                            <Popup>
                                <div className="font-bengali">
                                    <strong>{place.title}</strong><br/>
                                    {place.address}
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}

                {/* Route Line */}
                {routeCoords.length > 0 && (
                    <>
                      <Polyline 
                          positions={routeCoords} 
                          color="#3b82f6" 
                          weight={6} 
                          opacity={0.8}
                      />
                      {/* Start Marker for Route */}
                      <Marker position={routeCoords[0]} icon={startIcon}>
                          <Popup className="font-bengali">শুরু (Start)</Popup>
                      </Marker>
                      {/* End Marker for Route */}
                      {routeCoords.length > 1 && (
                         <Marker position={routeCoords[routeCoords.length - 1]} icon={placeIcon} />
                      )}
                    </>
                )}
            </MapContainer>

            {/* UI Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-[1000] pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto space-y-3">
                    
                    {/* Search Bar */}
                    <div className="bg-white/95 backdrop-blur-md shadow-lg rounded-2xl p-2 flex gap-2 border border-gray-200 transition-all focus-within:ring-2 focus-within:ring-primary/20">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="কোথায় যেতে চান? (Search)..."
                            className="flex-1 px-3 outline-none font-bengali text-dark bg-transparent placeholder-gray-400"
                        />
                        <button 
                            onClick={handleSearch} 
                            disabled={loading}
                            className="bg-primary text-white p-3 rounded-xl shadow-md transition active:scale-95 disabled:opacity-50 hover:bg-green-600"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} />}
                        </button>
                    </div>

                    {/* Quick Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
                        {POIS.map(poi => (
                            <button
                                key={poi.key}
                                onClick={() => handlePoiClick(poi)}
                                className="bg-white/90 backdrop-blur text-xs font-bold px-4 py-2.5 rounded-full shadow-md border border-gray-100 whitespace-nowrap text-gray-700 hover:bg-primary hover:text-white transition-colors"
                            >
                                {poi.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-24 right-4 z-[400] flex flex-col gap-3">
                {/* Toggle Map Type Button */}
                <button
                    onClick={() => setMapType(prev => prev === 'street' ? 'satellite' : 'street')}
                    className="bg-white text-gray-700 p-4 rounded-full shadow-xl active:scale-90 transition border border-gray-200 hover:bg-gray-50"
                    title="মানচিত্রের ধরন পরিবর্তন করুন (Toggle Map Type)"
                >
                    <Layers size={24} className={mapType === 'satellite' ? 'text-primary' : ''} />
                </button>

                 <button 
                    onClick={handleLocateMe}
                    disabled={isLocating}
                    className="bg-white text-gray-700 p-4 rounded-full shadow-xl active:scale-90 transition border border-gray-200 hover:bg-gray-50 disabled:opacity-80"
                    title="Find Me"
                 >
                     {isLocating ? <Loader2 size={24} className="animate-spin text-primary" /> : <Locate size={24} />}
                 </button>
                 
                 {EXTERNAL_MAP_URL && (
                    <button 
                        onClick={() => setUseExternalApp(true)}
                        className="bg-secondary text-white p-4 rounded-full shadow-xl active:scale-90 transition hover:bg-blue-600"
                        title="Open Live Map App"
                    >
                        <Globe size={24} />
                    </button>
                 )}
            </div>

            {/* Selected Place Details Card */}
            {selectedPlace && (
                <div className="absolute bottom-0 left-0 right-0 z-[1000] p-4 pb-24 animate-slide-up">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] p-5 border border-gray-100 dark:border-gray-700">
                        {/* Image Header in Card */}
                        {selectedPlace.image && (
                            <div className="h-32 w-full rounded-xl overflow-hidden mb-4 relative">
                                <img src={selectedPlace.image} alt={selectedPlace.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <span className="absolute bottom-2 left-3 text-white text-xs font-bold flex items-center gap-1">
                                    <ImageIcon size={12} /> দৃশ্য
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-xl font-bengali text-gray-900 dark:text-white leading-tight mb-1">
                                    {selectedPlace.title}
                                </h3>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <MapPin size={14} className="mr-1" />
                                    <span className="truncate max-w-[200px]">{selectedPlace.address}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => { setSelectedPlace(null); setRouteCoords([]); setRouteInfo(null); setIsRouting(false); }}
                                className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Route Info Stats */}
                        {routeInfo && (
                            <div className="flex gap-4 mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                    <Footprints size={18} />
                                    <span className="font-bold">{(routeInfo.distance / 1000).toFixed(1)} km</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                                    <Clock size={18} />
                                    <span className="font-bold">{Math.ceil(routeInfo.duration / 60)} min</span>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            {/* Internal Navigation */}
                            <button 
                                onClick={getWalkingRoute}
                                disabled={isRouting || loading}
                                className={`flex-1 text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold font-bengali transition shadow-lg active:scale-[0.98] disabled:opacity-70 ${
                                    isRouting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-green-600 shadow-green-200 dark:shadow-green-900/20'
                                }`}
                            >
                                {loading ? <Loader2 className="animate-spin"/> : <Navigation size={20} />}
                                {isRouting ? 'নেভিগেশন চালু...' : 'পথ দেখান (In-App)'}
                            </button>
                            
                            {/* External Google Maps */}
                            <button 
                                onClick={startGoogleMaps}
                                className="px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center justify-center"
                                title="Open in Google Maps"
                            >
                                <Globe size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}