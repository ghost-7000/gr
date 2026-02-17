'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Props for the map component
interface ContactMapProps {
    coords: { lat: number, lng: number } | null;
    setCoords: (c: { lat: number, lng: number }) => void;
    setAddress?: (addr: string) => void;
}

// Internal component to handle map events
function MapEvents({ setCoords, setAddress }: { setCoords: (c: { lat: number, lng: number }) => void, setAddress?: (addr: string) => void }) {
    const map = useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setCoords({ lat, lng });
            map.flyTo(e.latlng, map.getZoom());

            if (setAddress) {
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.display_name) setAddress(data.display_name);
                    })
                    .catch(console.error);
            }
        },
    });
    return null;
}

function SearchControl({ setCoords, setAddress }: { setCoords: (c: { lat: number, lng: number }) => void, setAddress?: (addr: string) => void }) {
    const map = useMap();
    const [query, setQuery] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query) return;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newCoords = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setCoords(newCoords);
                if (setAddress) setAddress(display_name);
                map.flyTo([newCoords.lat, newCoords.lng], 15);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    return (
        <div className="absolute top-4 left-4 z-[1000] w-64">
            <div className="flex shadow-xl">
                <input
                    type="text"
                    placeholder="ابحث عن مكان..."
                    className="flex-1 px-4 py-2 text-sm rounded-r-xl border-none outline-none dark:bg-slate-900 dark:text-white"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch(e as any);
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={(e) => handleSearch(e as any)}
                    className="bg-[#2E7D32] text-white px-4 py-2 rounded-l-xl font-bold text-xs"
                >
                    بحث
                </button>
            </div>
        </div>
    );
}

export default function ContactMap({ coords, setCoords, setAddress }: ContactMapProps) {
    // Fix for Leaflet icons
    useEffect(() => {
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }, []);

    return (
        <MapContainer
            center={coords ? [coords.lat, coords.lng] : [23.6143, 58.5453]}
            zoom={coords ? 15 : 12}
            style={{ height: '100%', width: '100%' }}
            className="z-10"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapEvents setCoords={setCoords} setAddress={setAddress} />
            <SearchControl setCoords={setCoords} setAddress={setAddress} />
            {coords && (
                <Marker position={[coords.lat, coords.lng]}>
                    <Popup>موقع المخلفات المكتشف</Popup>
                </Marker>
            )}
        </MapContainer>
    );
}
