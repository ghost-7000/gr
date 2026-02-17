'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface AdminReportMapProps {
    lat: number;
    lng: number;
    name: string;
}

export default function AdminReportMap({ lat, lng, name }: AdminReportMapProps) {
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
            center={[lat, lng]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={[lat, lng]}>
                <Popup>{name} - موقع مخلفات الرخام</Popup>
            </Marker>
        </MapContainer>
    );
}
