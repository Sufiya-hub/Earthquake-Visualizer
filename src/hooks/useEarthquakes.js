import { useState, useEffect } from 'react';

export default function useEarthquakes(timeRange = 'day') {
  const [features, setFeatures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper: format date YYYY-MM-DD
  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        let url = '';
        const today = new Date();

        if (['hour', 'day', 'week', 'month'].includes(timeRange)) {
          // Default live feeds
          url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${timeRange}.geojson`;
        } else if (timeRange === 'year') {
          const lastYear = today.getFullYear() - 1;
          const start = `${lastYear}-01-01`;
          const end = `${lastYear}-12-31`;
          // Only significant earthquakes, limit to 5000
          url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${start}&endtime=${end}&minmagnitude=2.5&orderby=time&limit=5000`;
        } else if (timeRange === 'decade') {
          const start = `${today.getFullYear() - 10}-01-01`;
          const end = formatDate(today);
          // Only stronger earthquakes, limit to 5000
          url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${start}&endtime=${end}&minmagnitude=4&orderby=time&limit=5000`;
        } else {
          throw new Error('Invalid time range');
        }

        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok)
          throw new Error(`Failed to fetch earthquakes: ${res.status}`);

        const data = await res.json();
        if (!data.features) throw new Error('Invalid data received');

        setFeatures(data.features);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching earthquakes:', err);
          setError(err.message);
          setFeatures([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
    return () => controller.abort();
  }, [timeRange]);

  return { features, isLoading, error };
}
