import { useState, useCallback } from 'react';

/**
 * useGeoLocation
 * Returns: { location, loading, error, getLocation }
 * location: { lat, lng } | null
 */
export default function useGeoLocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      (err) => {
        const messages = {
          1: 'Location access denied. Please enable it in your browser settings.',
          2: 'Location unavailable. Try entering coordinates manually.',
          3: 'Location request timed out.',
        };
        setError(messages[err.code] || 'Failed to get location');
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  return { location, loading, error, getLocation };
}
