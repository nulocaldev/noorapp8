// Location utility functions for the MyNoor app

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  timezone?: string;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export async function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by this browser.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const locationData = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            ...locationData
          });
        } catch (error) {
          // Return basic location data even if reverse geocoding fails
          resolve({
            latitude,
            longitude
          });
        }
      },
      (error) => {
        reject({
          code: error.code,
          message: getGeolocationErrorMessage(error.code)
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<Partial<LocationData>> {
  try {
    // Using a free geocoding service
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding service unavailable');
    }
    
    const data = await response.json();
    
    return {
      city: data.city || data.locality || data.principalSubdivision,
      country: data.countryName,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }
}

export function getGeolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location access denied by user.';
    case 2:
      return 'Location information is unavailable.';
    case 3:
      return 'Location request timed out.';
    default:
      return 'An unknown error occurred while retrieving location.';
  }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function isWithinRadius(
  userLat: number,
  userLon: number,
  targetLat: number,
  targetLon: number,
  radiusKm: number
): boolean {
  const distance = calculateDistance(userLat, userLon, targetLat, targetLon);
  return distance <= radiusKm;
}

export function formatLocation(location: LocationData): string {
  if (location.city && location.country) {
    return `${location.city}, ${location.country}`;
  } else if (location.country) {
    return location.country;
  } else {
    return `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`;
  }
}

export function validateCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

export async function getLocationFromIP(): Promise<Partial<LocationData>> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error('IP geolocation service unavailable');
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.reason || 'IP geolocation failed');
    }
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      country: data.country_name,
      timezone: data.timezone
    };
  } catch (error) {
    console.warn('IP-based location detection failed:', error);
    throw error;
  }
}

export function getTimezone(latitude?: number, longitude?: number): string {
  // Fallback to browser timezone if coordinates not available
  if (!latitude || !longitude) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  
  // For a more accurate timezone detection, you would typically use a service
  // For now, return browser timezone
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatCoordinates(latitude: number, longitude: number, precision: number = 4): string {
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
}

export async function requestLocationPermission(): Promise<boolean> {
  try {
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      return permission.state === 'granted';
    }
    return false;
  } catch (error) {
    console.warn('Permission API not supported:', error);
    return false;
  }
}

export function saveLocationToStorage(location: LocationData): void {
  try {
    localStorage.setItem('mynoor_last_location', JSON.stringify({
      ...location,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.warn('Failed to save location to storage:', error);
  }
}

export function getLocationFromStorage(): LocationData | null {
  try {
    const stored = localStorage.getItem('mynoor_last_location');
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    const age = Date.now() - data.timestamp;
    
    // Consider location stale after 1 hour
    if (age > 3600000) {
      localStorage.removeItem('mynoor_last_location');
      return null;
    }
    
    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      country: data.country,
      timezone: data.timezone
    };
  } catch (error) {
    console.warn('Failed to retrieve location from storage:', error);
    return null;
  }
}

export function isLocationMatch(
  userLocation: LocationData,
  targetLocation: { latitude?: number; longitude?: number; radiusKm?: number },
  isGlobal: boolean = false
): boolean {
  if (isGlobal) {
    return true;
  }

  if (!userLocation.latitude || !userLocation.longitude || 
      !targetLocation.latitude || !targetLocation.longitude) {
    return false;
  }

  const radiusKm = targetLocation.radiusKm || 10;
  return isWithinRadius(
    userLocation.latitude,
    userLocation.longitude,
    targetLocation.latitude,
    targetLocation.longitude,
    radiusKm
  );
}
