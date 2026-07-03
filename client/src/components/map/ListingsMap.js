import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Button, Chip, Rating } from '@mui/material';
import { Link } from 'react-router-dom';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const categoryColor = {
  fruit_waste: '#e76f51',
  vegetable_waste: '#2d6a4f',
  mixed_produce: '#f4a261',
  other: '#8d99ae',
};

function createColoredIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:20px;height:20px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid #fff;
      transform:rotate(-45deg);
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -22],
  });
}

// Fly to user location when it changes
function FlyToUser({ userLocation }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 1.2 });
    }
  }, [userLocation, map]);
  return null;
}

/**
 * ListingsMap
 * Props:
 *   listings: Listing[]
 *   userLocation: { lat, lng } | null
 *   radiusKm: number
 *   selectedId: string | null
 *   onSelect: (id) => void
 */
export default function ListingsMap({
  listings = [],
  userLocation = null,
  radiusKm = 20,
  selectedId = null,
  onSelect,
}) {
  const defaultCenter = [6.5244, 3.3792]; // Lagos
  const markerRefs = useRef({});

  // Auto-open popup for selected listing
  useEffect(() => {
    if (selectedId && markerRefs.current[selectedId]) {
      markerRefs.current[selectedId].openPopup();
    }
  }, [selectedId]);

  return (
    <MapContainer
      center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
      zoom={12}
      style={{ height: '100%', width: '100%', minHeight: 420 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToUser userLocation={userLocation} />

      {/* User radius circle */}
      {userLocation && (
        <>
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={radiusKm * 1000}
            pathOptions={{ color: '#2d6a4f', fillColor: '#52b788', fillOpacity: 0.07, weight: 1.5, dashArray: '6 4' }}
          />
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: '',
              html: `<div style="width:16px;height:16px;border-radius:50%;background:#2d6a4f;border:3px solid #fff;box-shadow:0 0 0 3px rgba(45,106,79,0.35)"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          />
        </>
      )}

      {/* Listing pins */}
      {listings.map((listing) => {
        const [lng, lat] = listing.location?.coordinates || [0, 0];
        if (!lat || !lng) return null;
        const color = categoryColor[listing.category] || '#8d99ae';
        return (
          <Marker
            key={listing._id}
            position={[lat, lng]}
            icon={createColoredIcon(color)}
            ref={(ref) => { if (ref) markerRefs.current[listing._id] = ref; }}
            eventHandlers={{ click: () => onSelect?.(listing._id) }}
          >
            <Popup maxWidth={240}>
              <Box sx={{ minWidth: 200 }}>
                {listing.photos?.[0] && (
                  <Box
                    component="img"
                    src={listing.photos[0]}
                    alt={listing.title}
                    sx={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 1, mb: 1 }}
                  />
                )}
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  {listing.title}
                </Typography>
                <Box display="flex" gap={0.5} mb={1} flexWrap="wrap">
                  <Chip
                    label={listing.category?.replace('_', ' ')}
                    size="small"
                    sx={{ fontSize: 10, bgcolor: color, color: '#fff', height: 20 }}
                  />
                  <Chip
                    label={`${listing.quantityKg} kg`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: 10, height: 20 }}
                  />
                </Box>
                {listing.vendor?.averageRating > 0 && (
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <Rating value={listing.vendor.averageRating} size="small" readOnly precision={0.5} />
                    <Typography variant="caption">{listing.vendor.name}</Typography>
                  </Box>
                )}
                <Button
                  component={Link}
                  to={`/listings/${listing._id}`}
                  variant="contained"
                  size="small"
                  fullWidth
                  sx={{ mt: 0.5, fontSize: 12 }}
                >
                  View listing
                </Button>
              </Box>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
