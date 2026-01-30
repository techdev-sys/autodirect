import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default leaflet icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Icons
const driverIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/758/758784.png', // Represents a car/truck
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
    className: 'driver-marker-icon'
});

const startIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const endIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});


function MapUpdater({ bounds }) {
    const map = useMap();
    useEffect(() => {
        if (bounds && bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [bounds, map]);
    return null;
}

const LiveMap = ({ startPos, endPos, driverPos }) => {
    // Positions are arrays [lat, lng]
    // Example: [-17.8216, 31.0492]

    // Calculate bounds to fit all markers
    const points = [startPos, endPos, driverPos].filter(Boolean);
    const bounds = points.length > 0 ? L.latLngBounds(points) : null;

    if (!startPos || !endPos || !Array.isArray(startPos) || !Array.isArray(endPos)) return <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">Loading Map Data...</div>;

    return (
        <MapContainer
            center={startPos}
            zoom={13}
            className="w-full h-full rounded-xl z-0"
            style={{ height: '100%' }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater bounds={bounds} />

            {startPos && (
                <Marker position={startPos} icon={startIcon}>
                    <Popup>Pickup Location</Popup>
                </Marker>
            )}

            {endPos && (
                <Marker position={endPos} icon={endIcon}>
                    <Popup>Destination</Popup>
                </Marker>
            )}

            {driverPos && (
                <Marker position={driverPos} icon={driverIcon}>
                    <Popup>Driver's Current Location</Popup>
                </Marker>
            )}

            {startPos && endPos && (
                <Polyline positions={[startPos, endPos]} color="blue" dashArray="10, 10" opacity={0.4} />
            )}

            {/* If we had a route, we would draw it here. For now, a straight line connects start/end, 
                and we assume the driver is somewhere near it. 
             */}
        </MapContainer>
    );
};

export default LiveMap;
