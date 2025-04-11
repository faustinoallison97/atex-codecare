import React, { useEffect, useState } from 'react';
import { Map, Marker, Source, Layer } from '@vis.gl/react-mapbox';
import { getRouteFromPoints } from '../../services/mapboxService';
import { searchAddress } from '../../services/geocodingService';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGVyb2Jzc3MiLCJhIjoiY204ejNvdmt4MDg4cDJqcHR2cDAzcHE4NiJ9.FlkhBGISMB5Tev6sj6cong';

const MapComponent = () => {
  const [route, setRoute] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [points, setPoints] = useState([
    [-45.9475, -21.4256],
    [-45.934, -21.4188],
    [-45.9587, -21.4312]
  ]);
  const [routeInfo, setRouteInfo] = useState(null);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (value.length >= 3) {
      try {
        const results = await searchAddress(value);
        setSuggestions(results);
      } catch (error) {
        console.error('Erro ao buscar endereço:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (feature) => {
    const coords = feature.geometry.coordinates;
    setPoints((prev) => [...prev, coords]);
    setSearchText('');
    setSuggestions([]);
  };

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const routeData = await getRouteFromPoints(points);
        setRoute(routeData.geojson);
        setRouteInfo(routeData.info);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoute();
  }, [points]);

  return (
    <>
      {/* Input de busca */}
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10 }}>
        <input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          placeholder="Digite um endereço..."
          style={{ padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        {suggestions.length > 0 && (
          <ul style={{ backgroundColor: '#fff', listStyle: 'none', padding: 0, margin: 0, border: '1px solid #ccc' }}>
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                onClick={() => handleSelectSuggestion(s)}
                style={{ padding: '5px 10px', cursor: 'pointer' }}
              >
                {s.place_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Lista de pontos */}
      <div style={{
        position: 'absolute',
        bottom: 100,
        left: 10,
        zIndex: 10,
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <h4 style={{ margin: 0 }}>Endereços adicionados:</h4>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {points.map((p, idx) => (
            <li key={idx}>Ponto {idx + 1}: Lon {p[0].toFixed(4)}, Lat {p[1].toFixed(4)}</li>
          ))}
        </ul>
      </div>

      {/* Info da Rota */}
      {routeInfo && (
        <div style={{
          position: 'absolute',
          bottom: 10,
          right: 10,
          zIndex: 10,
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <strong>Informações da Rota:</strong>
          <div>Duração: {(routeInfo.duration / 60).toFixed(1)} min</div>
          <div>Distância: {(routeInfo.distance / 1000).toFixed(2)} km</div>
          <div>Pontos: {points.length}</div>
        </div>
      )}

      {/* Mapa */}
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: -45.9475,
          latitude: -21.4256,
          zoom: 13
        }}
        style={{ width: '100%', height: '100vh' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        {points.map((p, idx) => (
          <Marker key={idx} longitude={p[0]} latitude={p[1]} anchor="bottom">
            <div style={{ width: 30, height: 40 }}>
              <svg
                viewBox="0 0 24 24"
                fill="red"
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="40"
              >
                <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z" />
              </svg>
            </div>
          </Marker>
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
    </>
  );
};

export default MapComponent;
