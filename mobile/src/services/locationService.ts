// src/services/locationService.ts
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Géolocalisation non supportée'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  });
};

// Coordonnées d'Antananarivo par défaut
export const ANTANANARIVO_CENTER: [number, number] = [-18.8792, 47.5079];
export const DEFAULT_ZOOM = 14;