/**
 * Fetches a road-snapped polyline for a sequence of coordinates using the public OSRM API.
 */
export async function getStreetRoutePolyline(coordinates: [number, number][]): Promise<[number, number][]> {
  if (coordinates.length < 2) return coordinates;

  // OSRM expects: {longitude},{latitude};...
  const coordsString = coordinates.map((coord) => `${coord[1]},${coord[0]}`).join(';');
  
  // Use driving profile, request geometry as geojson
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('OSRM request failed');
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return coordinates; // back to straight line on failure
    }

    // OSRM returns geojson coordinates as [lng, lat], Leaflet polyline needs [lat, lng]
    const routeCoords: [number, number][] = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
    return routeCoords;
  } catch (err) {
    console.error('Failed to fetch street route from OSRM:', err);
    return coordinates; // Fallback to straight lines
  }
}
