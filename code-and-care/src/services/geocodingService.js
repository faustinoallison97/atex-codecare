import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiaGVyb2Jzc3MiLCJhIjoiY204ejNvdmt4MDg4cDJqcHR2cDAzcHE4NiJ9.FlkhBGISMB5Tev6sj6cong';
const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_TOKEN });

export async function searchAddress(query) {
  const response = await geocodingClient.forwardGeocode({
    query,
    limit: 5,
    countries: ['br'],
  }).send();

  return response.body.features;
}
