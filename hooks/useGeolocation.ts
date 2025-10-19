
import { useState, useEffect } from 'react';
import { Coordinates } from '../types';

interface GeolocationState {
  location: Coordinates | null;
  accuracy: number | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    accuracy: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation is not supported by your browser.', isLoading: false }));
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          error: null,
          isLoading: false,
        });
      },
      (err) => {
        let errorMessage = 'Unable to retrieve your location.';
        if (err.code === 1) {
          errorMessage = 'Permission denied. Please enable location services.';
        }
        setState(s => ({ ...s, error: errorMessage, isLoading: false }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watcher);
    };
  }, []);

  return state;
};
