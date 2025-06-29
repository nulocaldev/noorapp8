
import { ApprovedSponsor } from '../types';

const LOCATION_NOT_PROVIDED = "Location Not Provided";

interface Coordinates { lat: number; lon: number; }

export function parseLocationToCoords(locationString: string): Coordinates | null {
  if (!locationString || locationString === LOCATION_NOT_PROVIDED) return null;
  const match = locationString.match(/Lat:\s*(-?\d+\.?\d*),\s*Lon:\s*(-?\d+\.?\d*)/i);
  if (match && match[1] && match[2]) {
    const lat = parseFloat(match[1]); const lon = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lon)) return { lat, lon };
  } return null;
}
export function calculateDistance(coords1: Coordinates, coords2: Coordinates): number {
  const R = 6371; const dLat = (coords2.lat - coords1.lat) * Math.PI / 180;
  const dLon = (coords2.lon - coords1.lon) * Math.PI / 180;
  const lat1Rad = coords1.lat * Math.PI / 180; const lat2Rad = coords2.lat * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); return R * c;
}

export const isLocationMatch = (userLocationString: string, sponsor: ApprovedSponsor): boolean => {
  if (sponsor.isGlobal) return true; 
  if (userLocationString === LOCATION_NOT_PROVIDED) return false;
  const userCoords = parseLocationToCoords(userLocationString);
  if (userCoords && sponsor.detectedLat !== undefined && sponsor.detectedLon !== undefined) {
    const sponsorCoords: Coordinates = { lat: sponsor.detectedLat, lon: sponsor.detectedLon };
    return calculateDistance(userCoords, sponsorCoords) <= sponsor.radiusKm;
  } return false;
};
