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
  const [userPathRoute, setUserPathRoute] = useState(null); // Add this state for the user path

  const navigationTimer = useRef(null);
  const locationWatchId = useRef(null);
  const mapRef = useRef(null);

  // Add this function to calculate a route from user to next point
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
          // CORREÇÃO: Calcular caminho para o ponto atual
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
              // Mostrar animação de chegada
              setShowArrival(true);

              // Esconder após 1.5 segundos
              setTimeout(() => {
                setShowArrival(false);
              }, 1500);

              // Incrementa o índice de navegação
              setNavigationIndex(prev => prev + 1);
              
              // NOVA FUNCIONALIDADE: Remover o ponto que acabamos de chegar
              if (navigationIndex < points.length) {
                // Criamos cópias para não modificar diretamente os estados
                const newPoints = [...points];
                
                // Removemos o ponto atual (que acabamos de chegar)
                newPoints.splice(navigationIndex, 1);
                
                // Atualizamos os pontos
                setPoints(newPoints);
                
                // Atualizamos os endereços correspondentes
                setAddresses(prevAddresses => {
                  const newAddresses = [...prevAddresses];
                  newAddresses.splice(navigationIndex, 1);
                  return newAddresses;
                });
                
                // Corrigimos o índice de navegação
                setNavigationIndex(prev => prev - 1);
                
                // CORREÇÃO: Recalcular imediatamente a rota do usuário para o próximo ponto
                // após remover o ponto atual
                if (newPoints.length > 0) {
                  calculateUserToPointRoute([longitude, latitude], newPoints[Math.min(navigationIndex, newPoints.length - 1)]);
                } else {
                  // Se não houver mais pontos, limpar a rota do usuário
                  setUserPathRoute(null);
                }
                
                // Recalcular a rota principal com os pontos restantes
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
                  // Limpar a rota se não tiver pontos suficientes
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

    if (value.length >= 2) { // Reduzir para 2 caracteres para iniciar a busca mais cedo
      try {
        // Opções de busca que incluem a proximidade (se disponível)
        const searchOptions = {};
        
        // Se tivermos a localização do usuário, usar como referência para melhorar os resultados
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

  // Efeito para recalcular a rota quando os pontos mudam externamente
  useEffect(() => {
    const fetchRoute = async () => {
      if (points.length >= 2) {
        try {
          const routeData = await getRouteFromPoints(points);
          setRoute(routeData.geojson);
          setRouteInfo(routeData.info);
          
          // Se estiver navegando, recalcular a rota do usuário para o próximo ponto
          if (isNavigating && userLocation && navigationIndex < points.length) {
            calculateUserToPointRoute(userLocation, points[navigationIndex]);
          }
        } catch (error) {
          console.error('Erro ao calcular rota:', error);
        }
      } else {
        // Se não houver pontos suficientes, limpar a rota
        setRoute(null);
        setRouteInfo(null);
        setUserPathRoute(null);
      }
    };
    
    fetchRoute();
  }, [points]); // Dependência apenas em points para atualizar quando os pontos mudam

  const startNavigation = () => {
    if (!route || points.length < 2) return;

    setIsNavigating(true);
    setNavigationIndex(0);

    getUserLocation();

    // Calculate initial path if user location is available
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
    // Primeira coisa: chamar getUserLocation para garantir que estamos tentando obter a localização
    getUserLocation();
    
    // Indicador visual de que estamos movendo
    setIsTransitioning(true); // Novo estado para controlar transições
    
    // Se já temos a localização do usuário, centralize o mapa nela
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
          speed: 1.5, // Velocidade da animação
          curve: 1, // Curvatura da animação
          essential: true // Garante que a transição aconteça
        });
      }
      
      // Define um timeout para garantir que a transição aconteça
      setTimeout(() => {
        // Verifica novamente se a posição está correta
        if (mapRef.current) {
          const center = mapRef.current.getCenter();
          const dist = getDistance(center.lng, center.lat, userLocation[0], userLocation[1]);
          
          if (dist > 0.0001) { // Se ainda estiver longe
            // Força uma atualização direta usando a API do Mapbox
            mapRef.current.flyTo({
              center: [userLocation[0], userLocation[1]],
              zoom: 17,
              pitch: 60,
              bearing: bearing,
              essential: true // Ignora transições suaves
            });
          }
        }
        
        setIsTransitioning(false);
      }, 1000); // Espere 1 segundo para a transição acontecer
    }
    // Se não temos a localização, vamos usar um intervalo para verificar quando estiver disponível
    else {
      // Primeiro, exiba uma mensagem ao usuário
      setLocationError("Obtendo sua localização...");
      
      // Adicione uma referência para o intervalo
      const checkLocationInterval = setInterval(() => {
        if (userLocation) {
          // Quando a localização estiver disponível
          let bearing = viewState.bearing;
          if (isNavigating && navigationIndex < points.length - 1) {
            const nextPoint = points[navigationIndex + 1];
            bearing = getBearing(userLocation, nextPoint);
          }
          
          // Atualizar a visualização
          setViewState({
            longitude: userLocation[0],
            latitude: userLocation[1],
            zoom: 17, // Zoom mais alto
            pitch: 60,
            bearing: bearing
          });
          
          // Limpar a mensagem de erro
          setLocationError(null);
          
          // Limpar o intervalo
          clearInterval(checkLocationInterval);
        }
      }, 500); // Verificar a cada 500ms
      
      // Limpar o intervalo após 10 segundos para evitar loops infinitos
      setTimeout(() => {
        clearInterval(checkLocationInterval);
        // Se ainda não tivermos a localização após 10 segundos, mostrar erro
        if (!userLocation) {
          setLocationError("Não foi possível obter sua localização.");
        }
      }, 10000);
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

      {isNavigating && (
        <div style={{
          position: 'absolute',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 122, 255, 0.9)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '8px',
          fontWeight: 'bold',
          fontSize: '18px',
          zIndex: 10,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          {directionMessage}
        </div>
      )}

      {isNavigating && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          width: '200px',
          zIndex: 10
        }}>
          <div style={{
            height: '8px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${(navigationIndex / (points.length - 1)) * 100}%`,
              backgroundColor: '#007AFF',
              borderRadius: '4px',
              transition: 'width 0.5s ease-in-out'
            }} />
          </div>
          <div style={{
            textAlign: 'center',
            fontSize: '12px',
            marginTop: '4px',
            color: '#333'
          }}>
            {`${navigationIndex} de ${points.length - 1} pontos`}
          </div>
        </div>
      )}

      {showArrival && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(52, 199, 89, 0.9)',
          color: 'white',
          padding: '20px 40px',
          borderRadius: '16px',
          fontSize: '20px',
          fontWeight: 'bold',
          zIndex: 100,
          animation: 'fadeInOut 1.5s forwards'
        }}>
          <style>
            {`
              @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                30% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                70% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
              }
            `}
          </style>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="white" />
            </svg>
            Chegou ao ponto!
          </div>
        </div>
      )}

      {/* Botões de Navegação */}
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
          {/* Renderiza apenas os pontos que ainda não foram visitados durante a navegação */}
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

          {/* Add the user path route */}
          {isNavigating && userPathRoute && (
            <Source id="user-path" type="geojson" data={userPathRoute}>
              <Layer
                id="user-path-layer"
                type="line"
                paint={{
                  'line-color': '#34C759', // Green color for user's path
                  'line-width': 5,
                  'line-dasharray': [2, 1], // Dashed line for user path
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
