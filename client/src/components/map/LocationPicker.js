import React, { useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Chip } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';

// Fix default Leaflet icon paths broken by webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Inner component — captures click events from the map
function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

/**
 * LocationPicker
 * Props:
 *   value: { lat, lng } | null
 *   onChange: ({ lat, lng }) => void
 *   label?: string
 */
export default function LocationPicker({ value, onChange, label = 'Pickup location' }) {
  // Default centre: Lagos Island
  const defaultCenter = [6.5244, 3.3792];

  const handleLocationSelect = useCallback(
    ({ lat, lng }) => onChange({ lat, lng }),
    [onChange]
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <PlaceIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
        {value && (
          <Chip
            label={`${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}`}
            size="small"
            color="success"
            variant="outlined"
          />
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        Click anywhere on the map to set the pickup location
      </Typography>
      <Box sx={{ border: '1.5px solid', borderColor: value ? 'primary.main' : 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <MapContainer
          center={value ? [value.lat, value.lng] : defaultCenter}
          zoom={13}
          style={{ height: 280, width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onLocationSelect={handleLocationSelect} />
          {value && (
            <Marker position={[value.lat, value.lng]} icon={greenIcon} />
          )}
        </MapContainer>
      </Box>
    </Box>
  );
}
