import React, { useEffect, useState } from 'react';
import { Map, Marker, Source, Layer } from '@vis.gl/react-mapbox';
import { getRouteFromPoints } from '../../services/mapboxService';
import { searchAddress, reverseGeocode } from '../../services/geocodingService';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGVyb2Jzc3MiLCJhIjoiY204ejNvdmt4MDg4cDJqcHR2cDAzcHE4NiJ9.FlkhBGISMB5Tev6sj6cong';

const MapComponent = ({ points, setPoints, setRouteInfo, setAddresses }) => {
  const [route, setRoute] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);

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

  const handleSelectSuggestion = async (feature) => {
    const coords = feature.geometry.coordinates;
    const address = await reverseGeocode(coords); // Converte coordenadas para endereço

    setPoints((prev) => [...prev, coords]);
    setAddresses((prev) => [...prev, address]); // Atualiza os endereços
    setSearchText('');
    setSuggestions([]);
  };

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const routeData = await getRouteFromPoints(points);
        setRoute(routeData.geojson);
        setRouteInfo(routeData.info); // Atualiza informações de tempo e distância
      } catch (error) {
        console.error(error);
      }
    };

    if (points.length >= 2) {
      fetchRoute();
    }
  }, [points, setRouteInfo]);

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

      {/* Mapa */}
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false} 
        initialViewState={{
          longitude: -45.9475,
          latitude: -21.4256,
          zoom: 13,
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        
        {/* {points.map((p, idx) => (
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
        ))} */}

        {route && (
          <Source id="route" type="geojson" data={route}>
            <Layer
              id="route-layer"
              type="line"
              paint={{
                'line-color': '#3b9ddd',
                'line-width': 4,
              }}
            />
          </Source>
        )}
      </Map>
    </>
  );
};

export default MapComponent;
