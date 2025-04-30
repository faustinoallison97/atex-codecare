import React, { useEffect, useState, useRef } from 'react';
import { Map, Marker, Source, Layer } from '@vis.gl/react-mapbox';
import { getRouteFromPoints } from '../../services/mapboxService';
import { searchAddress, reverseGeocode } from '../../services/geocodingService';
import styles from './MapComponent.module.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGVyb2Jzc3MiLCJhIjoiY204ejNvdmt4MDg4cDJqcHR2cDAzcHE4NiJ9.FlkhBGISMB5Tev6sj6cong';

const DIRECTION_MESSAGES = {
  STRAIGHT: "Siga em frente",
  RIGHT: "Vire à direita",
  LEFT: "Vire à esquerda",
  SLIGHT_RIGHT: "Siga ligeiramente à direita",
  SLIGHT_LEFT: "Siga ligeiramente à esquerda",
  SHARP_RIGHT: "Faça uma curva fechada à direita",
  SHARP_LEFT: "Faça uma curva fechada à esquerda",
  UTURN: "Faça um retorno",
  ARRIVE: "Você chegou ao seu destino!"
};

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
  const [directionMessage, setDirectionMessage] = useState(DIRECTION_MESSAGES.STRAIGHT);
  const [showArrival, setShowArrival] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [userPathRoute, setUserPathRoute] = useState(null);

  const navigationTimer = useRef(null);
  const locationWatchId = useRef(null);
  const mapRef = useRef(null);

  const calculateUserToPointRoute = async (userLocation, nextPoint) => {
    if (!userLocation || !nextPoint) return;
    
    try {
      const routeData = await getRouteFromPoints([
        userLocation,
        nextPoint
      ]);
      setUserPathRoute(routeData.geojson);
    } catch (error) {
      console.error('Erro ao calcular rota do usuário:', error);
    }
  };

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

        if (isNavigating && navigationIndex < points.length) {
          calculateUserToPointRoute([longitude, latitude], points[navigationIndex]);
          
          let bearing = 0;
          if (navigationIndex < points.length - 1) {
            const nextPoint = points[navigationIndex + 1];
            bearing = getBearing([longitude, latitude], nextPoint);

            const currentHeading = position.coords.heading || viewState.bearing;
            setDirectionMessage(getDirectionMessage(currentHeading, bearing));
          } else if (navigationIndex === points.length - 1) {
            setDirectionMessage(DIRECTION_MESSAGES.ARRIVE);
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
              setShowArrival(true);

              setTimeout(() => {
                setShowArrival(false);
              }, 1500);

              setNavigationIndex(prev => prev + 1);
              
              if (navigationIndex < points.length) {
                const newPoints = [...points];
                
                newPoints.splice(navigationIndex, 1);
                
                setPoints(newPoints);
                
                setAddresses(prevAddresses => {
                  const newAddresses = [...prevAddresses];
                  newAddresses.splice(navigationIndex, 1);
                  return newAddresses;
                });
                
                setNavigationIndex(prev => prev - 1);
                
                if (newPoints.length > 0) {
                  calculateUserToPointRoute([longitude, latitude], newPoints[Math.min(navigationIndex, newPoints.length - 1)]);
                } else {
                  setUserPathRoute(null);
                }
                
                if (newPoints.length >= 2) {
                  getRouteFromPoints(newPoints)
                    .then(routeData => {
                      setRoute(routeData.geojson);
                      setRouteInfo(routeData.info);
                    })
                    .catch(error => {
                      console.error('Erro ao recalcular rota:', error);
                    });
                } else if (newPoints.length < 2) {
                  setRoute(null);
                  setRouteInfo(null);
                }
              }
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

    if (value.length >= 2) {
      try {
        const searchOptions = {};
        
        if (userLocation) {
          searchOptions.proximity = userLocation;
        }
        
        const results = await searchAddress(value, searchOptions);
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
      if (points.length >= 2) {
        try {
          const routeData = await getRouteFromPoints(points);
          setRoute(routeData.geojson);
          setRouteInfo(routeData.info);
          
          if (isNavigating && userLocation && navigationIndex < points.length) {
            calculateUserToPointRoute(userLocation, points[navigationIndex]);
          }
        } catch (error) {
          console.error('Erro ao calcular rota:', error);
        }
      } else {
        setRoute(null);
        setRouteInfo(null);
        setUserPathRoute(null);
      }
    };
    
    fetchRoute();
  }, [points]);

  const startNavigation = () => {
    if (!route || points.length < 2) return;

    setIsNavigating(true);
    setNavigationIndex(0);

    getUserLocation();

    if (userLocation && points.length > 0) {
      calculateUserToPointRoute(userLocation, points[0]);
    }

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

  const getDirectionMessage = (currentBearing, targetBearing) => {
    let angleDiff = ((targetBearing - currentBearing + 540) % 360) - 180;

    if (Math.abs(angleDiff) < 15) {
      return DIRECTION_MESSAGES.STRAIGHT;
    } else if (angleDiff >= 15 && angleDiff < 45) {
      return DIRECTION_MESSAGES.SLIGHT_RIGHT;
    } else if (angleDiff >= 45 && angleDiff < 135) {
      return DIRECTION_MESSAGES.RIGHT;
    } else if (angleDiff >= 135) {
      return DIRECTION_MESSAGES.SHARP_RIGHT;
    } else if (angleDiff <= -15 && angleDiff > -45) {
      return DIRECTION_MESSAGES.SLIGHT_LEFT;
    } else if (angleDiff <= -45 && angleDiff > -135) {
      return DIRECTION_MESSAGES.LEFT;
    } else if (angleDiff <= -135) {
      return DIRECTION_MESSAGES.SHARP_LEFT;
    }

    return DIRECTION_MESSAGES.STRAIGHT;
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

    setUserPathRoute(null);
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
    getUserLocation();
    
    setIsTransitioning(true);
    
    if (userLocation) {
      let bearing = viewState.bearing;
      if (isNavigating && navigationIndex < points.length - 1) {
        const nextPoint = points[navigationIndex + 1];
        bearing = getBearing(userLocation, nextPoint);
      }
      
      if (userLocation && mapRef.current) {
        mapRef.current.flyTo({
          center: [userLocation[0], userLocation[1]],
          zoom: 17,
          pitch: 60,
          bearing: bearing,
          speed: 1.5,
          curve: 1,
          essential: true
        });
      }
      
      setTimeout(() => {
        if (mapRef.current) {
          const center = mapRef.current.getCenter();
          const dist = getDistance(center.lng, center.lat, userLocation[0], userLocation[1]);
          
          if (dist > 0.0001) {
            mapRef.current.flyTo({
              center: [userLocation[0], userLocation[1]],
              zoom: 17,
              pitch: 60,
              bearing: bearing,
              essential: true
            });
          }
        }
        
        setIsTransitioning(false);
      }, 1000);
    }
    else {
      setLocationError("Obtendo sua localização...");
      
      const checkLocationInterval = setInterval(() => {
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
          
          setLocationError(null);
          
          clearInterval(checkLocationInterval);
        }
      }, 500);
      
      setTimeout(() => {
        clearInterval(checkLocationInterval);
        if (!userLocation) {
          setLocationError("Não foi possível obter sua localização.");
        }
      }, 10000);
    }
  };

  return (
    <>
      <div className={styles.mapWrapper}>
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={false}
          initialViewState={viewState}
          {...(isNavigating ? {} : { onMove: evt => setViewState(evt.viewState) })}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          ref={mapRef}
          onLoad={(evt) => {
            mapRef.current = evt.target;
          }}
        >
          {points.map((p, idx) => (
            (!isNavigating || idx >= navigationIndex) && (
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
            )
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

          {isNavigating && userPathRoute && (
            <Source id="user-path" type="geojson" data={userPathRoute}>
              <Layer
                id="user-path-layer"
                type="line"
                paint={{
                  'line-color': '#34C759',
                  'line-width': 5,
                  'line-dasharray': [2, 1],
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
              <div className={styles.userLocationMarker} />
            </Marker>
          )}

          {isNavigating && !userLocation && (
            <Marker
              longitude={viewState.longitude}
              latitude={viewState.latitude}
              anchor="center"
            >
              <div className={styles.userLocationMarker} />
            </Marker>
          )}
        </Map>

        {/* Sobreposições - Colocadas dentro do wrapper para posicionamento absoluto correto */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            value={searchText}
            onChange={handleSearchChange}
            placeholder="Digite um endereço..."
            className={styles.searchInput}
          />
          {suggestions.length > 0 && (
            <ul className={styles.suggestionsList}>
              {suggestions.map((s, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelectSuggestion(s)}
                  className={styles.suggestionItem}
                >
                  {s.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          onClick={centerOnUser}
          className={styles.locationButton}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" />
            <path d="M12 2V4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 20V22" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 12H4" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {isNavigating && (
          <button
            onClick={returnToUserLocation}
            className={styles.returnButton}
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
        )}

        {locationError && (
          <div className={styles.errorMessage}>
            {locationError}
          </div>
        )}

        {isNavigating && (
          <div className={styles.directionMessage}>
            {directionMessage}
          </div>
        )}

        {isNavigating && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${(navigationIndex / (points.length - 1)) * 100}%` }}
              />
            </div>
            <div className={styles.progressText}>
              {`${navigationIndex} de ${points.length - 1} pontos`}
            </div>
          </div>
        )}

        {showArrival && (
          <div className={styles.arrivalNotification}>
            <div className={styles.arrivalContent}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
              </svg>
              Chegou ao ponto!
            </div>
          </div>
        )}

        <div className={styles.navigationControls}>
          {!isNavigating ? (
            <button
              onClick={startNavigation}
              className={styles.startButton}
              disabled={!route}
            >
              Iniciar Navegação
            </button>
          ) : (
            <button
              onClick={stopNavigation}
              className={styles.stopButton}
            >
              Parar Navegação
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MapComponent;
