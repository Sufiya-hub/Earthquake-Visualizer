import React, { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  GeoJSON,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Smoothly fly to earthquake location
function FlyToLocation({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 6, { duration: 2 });
    }
  }, [coords, map]);
  return null;
}

export default function MapView({ earthquakes = [], selectedCoords }) {
  const center = [20, 0]; // Default global view
  const [plateData, setPlateData] = useState(null);

  // Fetch tectonic plate boundaries once
  useEffect(() => {
    async function fetchPlates() {
      try {
        const res = await fetch(
          'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'
        );
        const data = await res.json();
        setPlateData(data);
      } catch (err) {
        console.error('Error loading tectonic plates:', err);
      }
    }
    fetchPlates();
  }, []);

  // Marker radius based on magnitude
  function magToRadius(mag) {
    if (!mag && mag !== 0) return 4;
    return Math.max(4, Math.min(30, mag * 4));
  }

  // Marker color based on magnitude
  function magToColor(mag) {
    if (mag >= 6) return 'red';
    if (mag >= 4) return 'orange';
    return 'yellow';
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={2}
        worldCopyJump={true}
        minZoom={2}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Base map layer */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
          noWrap={false}
        />

        {/* Plate boundaries */}
        {plateData && (
          <GeoJSON
            data={plateData}
            style={{
              color: 'blue',
              weight: 2,
              dashArray: '4 4',
            }}
          />
        )}

        {/* Fly to earthquake when sidebar is clicked */}
        {selectedCoords && <FlyToLocation coords={selectedCoords} />}

        {/* Earthquake markers */}
        {earthquakes.map((eq) => {
          if (!eq.geometry || !eq.geometry.coordinates) return null;
          const [lng, lat, depth] = eq.geometry.coordinates;
          const mag = eq.properties.mag;
          const id = eq.id;
          const radius = magToRadius(mag);
          const color = magToColor(mag);

          return (
            <CircleMarker
              key={id}
              center={[lat, lng]}
              radius={radius}
              pathOptions={{ color, fillColor: color, fillOpacity: 0.7 }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{eq.properties.place}</div>
                  <div>
                    Magnitude: <strong>{mag ?? 'N/A'}</strong>
                  </div>
                  <div>Depth: {depth ?? 'N/A'} km</div>
                  <div>
                    Time: {new Date(eq.properties.time).toLocaleString()}
                  </div>
                  <a
                    className="text-blue-600"
                    href={eq.properties.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Details
                  </a>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
