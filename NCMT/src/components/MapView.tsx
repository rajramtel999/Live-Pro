'use client';

import { useEffect, useMemo, useState } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Marker, InfoWindow } from '@react-google-maps/api';
import type { RouteSearchStopSequenceItem } from '@/types/searchResult';

interface MapViewProps {
  stops: RouteSearchStopSequenceItem[];
  activeVehicleCount: number;
}

const mapContainerStyle = { width: '100%', height: '100%' };
const DEFAULT_CENTER = { lat: 27.7172, lng: 85.3240 }; // Kathmandu

export default function MapView({ stops, activeVehicleCount }: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const positions = useMemo(
    () => stops.map((stop) => ({ lat: stop.latitude, lng: stop.longitude })),
    [stops]
  );

  useEffect(() => {
    if (!isLoaded || positions.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();
    
    // Waypoints are all stops EXCEPT the first and last
    const waypoints = positions.slice(1, -1).map(p => ({
      location: p,
      stopover: true
    }));

    directionsService.route(
      {
        origin: positions[0],
        destination: positions[positions.length - 1],
        waypoints: waypoints,
        // Using driving for public transit routes snapped to roads
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirectionsResponse(result);
        } else {
          console.error(`error fetching directions ${result}`);
        }
      }
    );
  }, [isLoaded, positions]);

  const vehicleMarkers = useMemo(() => {
    if (!stops.length || activeVehicleCount <= 0) return [];

    const markerCount = Math.min(activeVehicleCount, stops.length);
    const step = Math.max(1, Math.floor(stops.length / markerCount));

    return Array.from({ length: markerCount }, (_, index) => {
      const stopIndex = Math.min(index * step, stops.length - 1);
      const stop = stops[stopIndex];

      return {
        id: `vehicle-${index + 1}`,
        lat: stop.latitude,
        lng: stop.longitude,
        stopName: stop.stopName,
      };
    });
  }, [stops, activeVehicleCount]);

  if (positions.length < 2) {
    return (
      <div className="h-56 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500 flex items-center justify-center">
        Not enough stop points to draw a route line.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-56 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="h-56 overflow-hidden rounded-xl border border-gray-200">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={positions[0] || DEFAULT_CENTER}
        zoom={13}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            // Lightweight clean style matching the site theme
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] }
          ]
        }}
      >
        {/* The DirectionsRenderer automatically draws the snapped blue line and alphabet markers */}
        {directionsResponse && (
          <DirectionsRenderer 
            directions={directionsResponse} 
            options={{
              suppressMarkers: false, // let google handle A/B/C stops
              polylineOptions: {
                strokeColor: '#3b82f6',
                strokeWeight: 5,
                strokeOpacity: 0.8
              }
            }} 
          />
        )}

        {/* Custom Vehicle Markers */}
        {vehicleMarkers.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={{ lat: vehicle.lat, lng: vehicle.lng }}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: '#10b981',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 8,
            }}
            onClick={() => setSelectedVehicle(vehicle.id)}
          >
            {selectedVehicle === vehicle.id && (
              <InfoWindow onCloseClick={() => setSelectedVehicle(null)}>
                <div className="text-sm p-1">
                  <p className="font-semibold text-gray-900">{vehicle.id}</p>
                  <p className="text-gray-500">Near: {vehicle.stopName}</p>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
}
