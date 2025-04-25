import React, { useEffect, useState, useRef } from 'react';
import { Map, Marker, Source, Layer } from '@vis.gl/react-mapbox';
import { getRouteFromPoints } from '../../services/mapboxService';
import { searchAddress, reverseGeocode } from '../../services/geocodingService';
import styles from './MapComponent.module.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGVyb2Jzc3MiLCJhIjoiY204ejNvdmt4MDg4cDJqcHR2cDAzcHE4NiJ9.FlkhBGISMB5Tev6sj6cong';

const MapComponent = ({ points, setPoints, setRouteInfo, setAddresses }) => {
  const [route, setRoute] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationIndex, setNavigationIndex] = useState(0);
  const [viewState, setViewState] = useState({
    longitude: -45.9475,
    latitude: -21.4256,
    zoom: 17,
    pitch: 60,
    bearing: 0
  });
  
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  
  const navigationTimer = useRef(null);
  const locationWatchId = useRef(null);
  
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocalização não é suportada pelo seu navegador.');
      return;
    }
    
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    
    locationWatchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);
        
        if (isNavigating) {
          let bearing = 0;
          if (navigationIndex < points.length - 1) {
            const nextPoint = points[navigationIndex + 1];
            bearing = getBearing([longitude, latitude], nextPoint);
          }
          
          setViewState({
            longitude,
            latitude,
            zoom: 17,
            pitch: 60,
            bearing
          });
          
          if (navigationIndex < points.length - 1) {
            const nextPoint = points[navigationIndex + 1];
            const distance = getDistance(longitude, latitude, nextPoint[0], nextPoint[1]);
            
            if (distance < 0.0003) {
              setNavigationIndex(prev => prev + 1);
            }
          }
        }
        
        setLocationError(null);
      },
      (error) => {
        let errorMsg;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Permissão para geolocalização negada.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Informação de localização indisponível.";
            break;
          case error.TIMEOUT:
            errorMsg = "Tempo esgotado para obter a localização.";
            break;
          default:
            errorMsg = "Erro desconhecido ao obter localização.";
        }
        setLocationError(errorMsg);
      },
      options
    );
  };
  
  const stopLocationTracking = () => {
    if (locationWatchId.current) {
      navigator.geolocation.clearWatch(locationWatchId.current);
      locationWatchId.current = null;
    }
  };

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
    const address = await reverseGeocode(coords);

    setPoints((prev) => [...prev, coords]);
    setAddresses((prev) => [...prev, address]);
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

    if (points.length >= 2) {
      fetchRoute();
    }
  }, [points, setRouteInfo]);

  const startNavigation = () => {
    if (!route || points.length < 2) return;
    
    setIsNavigating(true);
    setNavigationIndex(0);
    
    getUserLocation();
    
    if (!userLocation) {
      const startPoint = points[0];
      const nextPoint = points[1];
      
      const bearing = getBearing(startPoint, nextPoint);
      
      setViewState({
        longitude: startPoint[0],
        latitude: startPoint[1],
        zoom: 17,
        pitch: 60,
        bearing
      });
      
      navigationTimer.current = setInterval(() => {
        moveAlongRoute();
      }, 1000);
    }
  };
  
  const getBearing = (start, end) => {
    const startLat = start[1] * Math.PI / 180;
    const startLng = start[0] * Math.PI / 180;
    const endLat = end[1] * Math.PI / 180;
    const endLng = end[0] * Math.PI / 180;
    
    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) -
              Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };
  
  const moveAlongRoute = () => {
    if (navigationIndex >= points.length - 1) {
      clearInterval(navigationTimer.current);
      setIsNavigating(false);
      return;
    }
    
    const currentPoint = points[navigationIndex];
    const nextPoint = points[navigationIndex + 1];
    const bearing = getBearing(currentPoint, nextPoint);
    
    const progress = 0.1;
    const newLng = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * progress;
    const newLat = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * progress;
    
    setViewState(prev => ({
      ...prev,
      longitude: newLng,
      latitude: newLat,
      bearing
    }));
    
    const distance = getDistance(newLng, newLat, nextPoint[0], nextPoint[1]);
    if (distance < 0.0001) {
      setNavigationIndex(prev => prev + 1);
    }
  };
  
  const getDistance = (lng1, lat1, lng2, lat2) => {
    return Math.sqrt(Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2));
  };
  
  const stopNavigation = () => {
    stopLocationTracking();
    
    if (navigationTimer.current) {
      clearInterval(navigationTimer.current);
      navigationTimer.current = null;
    }
    
    setIsNavigating(false);
    
    setViewState({
      longitude: -45.9475,
      latitude: -21.4256,
      zoom: 12.5,
      pitch: 0,
      bearing: 0
    });
  };
  
  useEffect(() => {
    return () => {
      stopLocationTracking();
      
      if (navigationTimer.current) {
        clearInterval(navigationTimer.current);
      }
    };
  }, []);

  const centerOnUser = () => {
    if (userLocation) {
      setViewState({
        ...viewState,
        longitude: userLocation[0],
        latitude: userLocation[1],
      });
    } else {
      getUserLocation();
    }
  };

  const returnToUserLocation = () => {
    if (userLocation) {
      let bearing = viewState.bearing;
      if (isNavigating && navigationIndex < points.length - 1) {
        const nextPoint = points[navigationIndex + 1];
        bearing = getBearing(userLocation, nextPoint);
      }
      
      setViewState({
        longitude: userLocation[0],
        latitude: userLocation[1],
        zoom: 17,
        pitch: 60,
        bearing: bearing
      });
    } else {
      getUserLocation();
    }
  };

  return (
    <>
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
      
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
        <button
          onClick={centerOnUser}
          style={{
            backgroundColor: '#007AFF',
            color: 'white',
            padding: '8px',
            borderRadius: '50%',
            border: 'none',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" />
            <path d="M12 2V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 20V22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 12H4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      
      {isNavigating && (
        <div style={{ position: 'absolute', top: 60, right: 10, zIndex: 10 }}>
          <button
            onClick={returnToUserLocation}
            style={{
              backgroundColor: '#34C759',
              color: 'white',
              padding: '8px',
              borderRadius: '50%',
              border: 'none',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
            title="Voltar à sua localização na navegação"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" />
              <path d="M12 2L12 8" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 16L12 22" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M2 12L8 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M16 12L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
      
      {locationError && (
        <div style={{ 
          position: 'absolute', 
          top: 60, 
          left: '50%', 
          transform: 'translateX(-50%)',
          backgroundColor: '#FF3B30',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          zIndex: 10
        }}>
          {locationError}
        </div>
      )}
      
      {/* Botões de Navegação - Temporariamente ocultos para apresentação */}
      {/* 
      <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10 }}>
        {!isNavigating ? (
          <button 
            onClick={startNavigation}
            style={{
              backgroundColor: '#007AFF',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
            disabled={!route}
          >
            Iniciar Navegação
          </button>
        ) : (
          <button 
            onClick={stopNavigation}
            style={{
              backgroundColor: '#FF3B30',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Parar Navegação
          </button>
        )}
      </div>
      */}

      <div className={styles.mapWrapper}>
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
          initialViewState={viewState}
          {...(isNavigating ? {} : { onMove: evt => setViewState(evt.viewState) })}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
        >
          {points.map((p, idx) => (
            <Marker
              key={idx}
              longitude={p[0]}
              latitude={p[1]}
              anchor="bottom"
            >
              <svg
                viewBox="0 0 24 24"
                fill={idx === navigationIndex && isNavigating ? "blue" : "red"}
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="40"
              >
                <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z" />
              </svg>
            </Marker>
          ))}

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
          
          {userLocation && (
            <Marker
              longitude={userLocation[0]}
              latitude={userLocation[1]}
              anchor="center"
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#007AFF',
                border: '3px solid white',
                boxShadow: '0 0 5px rgba(0,0,0,0.5)'
              }} />
            </Marker>
          )}
          
          {isNavigating && !userLocation && (
            <Marker
              longitude={viewState.longitude}
              latitude={viewState.latitude}
              anchor="center"
            >
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#007AFF',
                border: '3px solid white',
                boxShadow: '0 0 5px rgba(0,0,0,0.5)'
              }} />
            </Marker>
          )}
        </Map>
      </div>
    </>
  );
};

export default MapComponent;
