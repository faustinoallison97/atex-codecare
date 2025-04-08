import React, { useEffect, useState } from 'react';
import { Map, Marker, Source, Layer } from '@vis.gl/react-mapbox';
import { getRouteFromPoints } from '../../services/mapboxService';
import { searchAddress } from '../../services/geocodingService'; // importa aqui

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGVyb2Jzc3MiLCJhIjoiY204ejNvdmt4MDg4cDJqcHR2cDAzcHE4NiJ9.FlkhBGISMB5Tev6sj6cong';

const MapComponent = () => {
  const [route, setRoute] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [points, setPoints] = useState([
    [-46.57421, -23.52871],
    [-46.62529, -23.53374],
    [-46.65134, -23.54854]
  ]);

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
      } catch (error) {
        console.error(error);
      }
    };

    fetchRoute();
  }, [points]);

  return (
    <>
      {/* Input de busca + sugestões */}
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

      {/* Lista de endereços adicionados */}
      <div style={{
        position: 'absolute',
        bottom: 10,
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
            <li key={idx}>Lon: {p[0].toFixed(4)}, Lat: {p[1].toFixed(4)}</li>
          ))}
        </ul>
      </div>

      {/* Mapa */}
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
    </>
  );
};

export default MapComponent;
