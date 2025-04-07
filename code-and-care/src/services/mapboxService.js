// src/services/mapboxService.js
const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGVyb2Jzc3MiLCJhIjoiY204ejNvdmt4MDg4cDJqcHR2cDAzcHE4NiJ9.FlkhBGISMB5Tev6sj6cong';

export async function getRouteFromPoints(points) {
    const coordinates = points.map(p => p.join(',')).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
  
    const response = await fetch(url);
    const data = await response.json();
  
    if (!data.routes || !data.routes.length) {
      throw new Error('Nenhuma rota encontrada');
    }
  
    return {
      geojson: {
        type: 'Feature',
        properties: {},
        geometry: data.routes[0].geometry
      },
      distance: data.routes[0].distance,
      duration: data.routes[0].duration,
    };
  }
  