import React, { useEffect, useState } from 'react';
import { Map, Marker, Source, Layer } from '@vis.gl/react-mapbox';
import { getRouteFromPoints } from '../../services/mapboxService';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGVyb2Jzc3MiLCJhIjoiY204ejNvdmt4MDg4cDJqcHR2cDAzcHE4NiJ9.FlkhBGISMB5Tev6sj6cong';

const MapComponent = () => {
  const [points, setPoints] = useState([
    [-46.57421, -23.52871],
    [-46.62529, -23.53374],
    [-46.65134, -23.54854]
  ]);
  const [route, setRoute] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const routeData = await getRouteFromPoints(points);
        setRoute(routeData.geojson);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoute();
  }, [points]);

  return (
    <Map
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        longitude: -46.62529,
        latitude: -23.53374,
        zoom: 12
      }}
      style={{ width: '100%', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
    >
      {points.map((p, idx) => (
        <Marker key={idx} longitude={p[0]} latitude={p[1]} />
      ))}

      {route && (
        <Source id="route" type="geojson" data={route}>
          <Layer
            id="route-layer"
            type="line"
            paint={{
              'line-color': '#3b9ddd',
              'line-width': 4
            }}
          />
        </Source>
      )}
    </Map>
  );
};

export default MapComponent;
