import React, { useState, useMemo } from 'react';
import useEarthquakes from './hooks/useEarthquakes';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';

export default function App() {
  const [timeRange, setTimeRange] = useState('day'); // default
  const { features = [], isLoading, error } = useEarthquakes(timeRange); // ✅ default empty array

  const [minMag, setMinMag] = useState(0);
  const [selectedCoords, setSelectedCoords] = useState(null);

  // Filter earthquakes by magnitude
  const earthquakes = useMemo(() => {
    return features.filter((eq) => {
      const mag =
        eq.properties && typeof eq.properties.mag === 'number'
          ? eq.properties.mag
          : 0;
      return mag >= minMag;
    });
  }, [features, minMag]);

  // Sidebar click → center map
  function handleSelect(id) {
    const eq = features.find((f) => f.id === id);
    if (eq) {
      const [lng, lat] = eq.geometry.coordinates;
      setSelectedCoords([lat, lng]);
    }
  }

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <Sidebar
        earthquakes={features} // ✅ no risk of null
        onSelect={handleSelect}
        minMag={minMag}
        setMinMag={setMinMag}
      />

      {/* Map area */}
      <div className="flex-1 relative h-screen">
        {/* Controls (dropdown + legend) */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
          {/* Legend */}
          <div className="bg-white p-3 rounded shadow text-xs">
            <div className="font-semibold mb-1">Legend</div>
            <div className="flex items-center mb-1">
              <span className="w-3 h-3 rounded-full bg-red-600 mr-2"></span>
              Strong (≥ 6)
            </div>
            <div className="flex items-center mb-1">
              <span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
              Moderate (4–6)
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></span>
              Minor (&lt; 4)
            </div>
            <div className="flex items-center mt-2">
              <span className="w-6 h-[2px] bg-blue-600 mr-2"></span>
              Tectonic Plate Boundary
            </div>
          </div>

          {/* Time range dropdown */}
          <div className="bg-white p-2 rounded shadow">
            <label className="mr-2 font-semibold text-sm">Time Range:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border rounded p-1 text-sm"
            >
              <option value="hour">Last Hour</option>
              <option value="day">Last Day</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              {/* <option value="decade">Last Decade</option> */}
            </select>
          </div>
        </div>

        {/* Loading + error states */}
        {isLoading && (
          <div className="absolute top-4 left-4 bg-white p-2 rounded shadow">
            Loading earthquakes...
          </div>
        )}
        {error && (
          <div className="absolute top-4 left-4 bg-red-50 text-red-700 p-2 rounded shadow">
            Error loading data
          </div>
        )}
        {!isLoading && !error && earthquakes.length === 0 && (
          <div className="absolute top-4 left-4 bg-yellow-50 text-yellow-700 p-2 rounded shadow">
            No earthquakes found for this range
          </div>
        )}

        {/* Map */}
        <MapView earthquakes={earthquakes} selectedCoords={selectedCoords} />
      </div>
    </div>
  );
}
