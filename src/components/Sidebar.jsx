import React from 'react';

export default function Sidebar({
  earthquakes = [],
  onSelect,
  minMag,
  setMinMag,
}) {
  const sorted = [...earthquakes].sort(
    (a, b) => (b.properties.mag ?? 0) - (a.properties.mag ?? 0)
  );
  const filtered = sorted.filter((eq) => (eq.properties.mag ?? 0) >= minMag);

  return (
    <div className="p-4 w-full md:w-80 bg-white/90 backdrop-blur-sm border-r border-gray-200">
      <h2 className="text-[22px] font-bold mb-2 text-sky-700">
        Recent Earthquakes (24h)
      </h2>

      <div className="mb-4">
        <label className="block text-sm">
          Minimum Magnitude: <span className="font-semibold">{minMag}</span>
        </label>
        <input
          type="range"
          min="0"
          max="8"
          step="0.1"
          value={minMag}
          onChange={(e) => setMinMag(Number(e.target.value))}
        />
      </div>

      <div className="sidebar-scroll">
        {filtered.length === 0 && (
          <div className="text-sm text-gray-500">
            No earthquakes match the filter.
          </div>
        )}
        {filtered.map((eq) => (
          <div
            key={eq.id}
            className="mb-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
            onClick={() => onSelect(eq.id)}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{eq.properties.place}</div>
              <div className="text-xs text-gray-600">
                M {eq.properties.mag ?? 'N/A'}
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(eq.properties.time).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-600">
        Data source: USGS. Updated periodically.
      </div>
    </div>
  );
}
