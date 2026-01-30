import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { MapPin, Search, X, Navigation } from 'lucide-react';
import L from 'leaflet';

// Fix generic marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Component to handle map center updates and dragging
const MapController = ({ onCenterChange, center }) => {
    const map = useMap();
    const isFirstRun = useRef(true);

    useEffect(() => {
        if (center && isFirstRun.current) {
            map.flyTo(center, map.getZoom());
            isFirstRun.current = false;
        }
    }, [center, map]);

    useMapEvents({
        moveend: () => {
            const newCenter = map.getCenter();
            onCenterChange([newCenter.lat, newCenter.lng]);
        }
    });

    return null;
};

const LocationPicker = ({ label, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeout = useRef(null);
    const [mapCenter, setMapCenter] = useState([-17.8216, 31.0492]); // Default Harare
    const [selectedAddress, setSelectedAddress] = useState('');
    const [loading, setLoading] = useState(false);

    // Initial sync
    useEffect(() => {
        if (value && value.address) {
            setSelectedAddress(value.address);
        }
    }, [value]);

    // Debounced Autocomplete Search
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 3) {
            setSuggestions([]);
            return;
        }

        // Clear previous timeout
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        // Set new timeout (debounce 500ms)
        searchTimeout.current = setTimeout(async () => {
            try {
                // Using ViewBox to bias results towards Zimbabwe (roughly) if needed, but keeping global for now
                // Zim Bounding Box: 25.237, -22.422, 33.068, -15.609 (min_lon, min_lat, max_lon, max_lat)
                const viewbox = '25.237,-22.422,33.068,-15.609';
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${viewbox}&bounded=0&limit=5`);
                const data = await response.json();
                setSuggestions(data || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error("Autocomplete failed:", error);
            }
        }, 500);

        return () => clearTimeout(searchTimeout.current);
    }, [searchQuery]);

    const handleSelectSuggestion = (suggestion) => {
        const lat = parseFloat(suggestion.lat);
        const lon = parseFloat(suggestion.lon);

        setMapCenter([lat, lon]);
        // Update generic address state
        setSelectedAddress(suggestion.display_name.split(',').slice(0, 3).join(','));
        setSearchQuery(suggestion.display_name.split(',')[0]); // Short name in input

        setSuggestions([]);
        setShowSuggestions(false);

        // Directly trigger the "confirm" like state logic if needed, 
        // but here we just center the map so user can verify.
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        // Fallback manual search (Enter key)
        if (!searchQuery) return;
        setLoading(true);
        setShowSuggestions(false);

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                handleSelectSuggestion(data[0]);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const lookupAddress = async (lat, lng) => {
        setLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                // Formatting address to be shorter
                const shortAddr = data.display_name.split(',').slice(0, 3).join(',');
                setSelectedAddress(shortAddr);
            }
        } catch (error) {
            console.error("Reverse geocode failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        onChange({
            address: selectedAddress || "Selected Location",
            coords: mapCenter
        });
        setIsOpen(false);
    };

    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black text-text-muted uppercase">{label}</label>

            {/* Trigger Input */}
            <div
                onClick={() => setIsOpen(true)}
                className="relative cursor-pointer group"
            >
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                <div className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm transition-all group-hover:border-primary text-slate-900 ${!value ? 'text-slate-400' : 'text-slate-900'}`}>
                    {value?.address || placeholder}
                </div>
            </div>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[1000] bg-background flex flex-col animate-in fade-in duration-200">
                    {/* Header */}
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surface z-10 shadow-sm relative">
                        <h3 className="font-black text-slate-900 uppercase text-lg">Set {label || 'Location'}</h3>
                        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    {/* Search with Autocomplete */}
                    <div className="p-4 bg-background border-b border-slate-100 flex gap-2 z-20 relative">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search location (e.g. 'Harare')..."
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-base font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-slate-400"
                                value={searchQuery}
                                onChange={e => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSearch(e);
                                    }
                                }}
                            />

                            {/* Suggestions Dropdown */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2">
                                    {suggestions.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectSuggestion(item)}
                                            className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex items-center transition-colors group"
                                        >
                                            <MapPin className="w-4 h-4 text-slate-300 mr-3 group-hover:text-primary" />
                                            <div>
                                                <p className="font-bold text-sm text-slate-800">{item.display_name.split(',')[0]}</p>
                                                <p className="text-[10px] text-slate-500 truncate">{item.display_name}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-base hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
                        >
                            Search
                        </button>
                    </div>

                    {/* Map Area */}
                    <div className="relative flex-1 bg-slate-800 min-h-0">
                        <MapContainer
                            center={mapCenter}
                            zoom={18}
                            className="w-full h-full"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapController
                                center={mapCenter}
                                onCenterChange={(c) => {
                                    setMapCenter(c);
                                    lookupAddress(c[0], c[1]);
                                }}
                            />
                        </MapContainer>

                        {/* Locate Me Button */}
                        <button
                            type="button"
                            onClick={() => {
                                if (navigator.geolocation) {
                                    setLoading(true);
                                    navigator.geolocation.getCurrentPosition((position) => {
                                        const { latitude, longitude } = position.coords;
                                        setMapCenter([latitude, longitude]);
                                        lookupAddress(latitude, longitude);
                                        setLoading(false);
                                    }, (err) => {
                                        console.error("Geolocation error:", err);
                                        setLoading(false);
                                        alert("Could not access your location. Please check browser permissions.");
                                    });
                                }
                            }}
                            className="absolute bottom-28 right-4 z-[900] bg-surface p-3.5 rounded-full shadow-xl hover:bg-background transition-colors border border-white/10"
                            title="Use My Current Location"
                        >
                            <Navigation className="w-6 h-6 text-primary fill-current" />
                        </button>

                        {/* Center Pin Overlay */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[1000] flex flex-col items-center">
                            <div className="relative">
                                <MapPin className="w-10 h-10 text-primary drop-shadow-2xl filter" fill="currentColor" strokeWidth={1.5} />
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-1.5 bg-black/50 rounded-full blur-[2px]"></div>
                            </div>
                        </div>

                        {/* Address Badge - Floating Bottom */}
                        <div className="absolute bottom-6 left-4 right-4 bg-surface/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10 z-[1000]">
                            <div className="flex items-start gap-4">
                                <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 ${loading ? 'bg-primary animate-pulse' : 'bg-green-500'}`}></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] uppercase font-black text-text-muted mb-1 tracking-wider">Confirmed Location</p>
                                    <p className="text-sm font-black text-slate-900 line-clamp-2 leading-tight">
                                        {loading ? "Identifying exact street address..." : (selectedAddress || "Drag map to center on your location")}
                                    </p>
                                </div>
                                <button
                                    onClick={handleConfirm}
                                    disabled={loading || !selectedAddress}
                                    className="ml-2 py-3 px-6 bg-primary hover:bg-primary/90 text-background rounded-xl font-black uppercase text-xs shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LocationPicker;
