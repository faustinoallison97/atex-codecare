import mbxDirections from '@mapbox/mapbox-sdk/services/directions';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGVyb2Jzc3MiLCJhIjoiY204ejNvdmt4MDg4cDJqcHR2cDAzcHE4NiJ9.FlkhBGISMB5Tev6sj6cong';
const directionsClient = mbxDirections({ accessToken: MAPBOX_TOKEN });

export async function getRouteFromPoints(points) {
  const response = await directionsClient.getDirections({
    profile: 'driving',
    geometries: 'geojson',
    waypoints: points.map(([lon, lat]) => ({ coordinates: [lon, lat] }))
  }).send();

  const route = response.body.routes[0];
  return {
    geojson: {
      type: 'Feature',
      geometry: route.geometry
    },
    info: {
      duration: route.duration, // segundos
      distance: route.distance  // metros
    }
  };
}
